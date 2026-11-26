import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { isFirestoreExplicitlyConfigured } from "@/lib/firestore";
import { clientIp, hashIp, isSameOrigin } from "@/lib/request";
import { normalizeEmail, normalizePhone } from "@/lib/comms/phone";
import { getPartnerDestinations } from "@/lib/comms/partners";
import {
  isResendSandboxSender,
  sendClientWelcomeEmail,
  sendPartnerAlertEmail,
} from "@/lib/comms/resend";
import { runLeadAutomation } from "@/lib/comms/orchestrator";
import {
  createCommunication,
  logAutomationEvent,
  upsertLead,
} from "@/lib/comms/store";
import type { LeadRecord } from "@/lib/comms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * In-memory duplicate guard (10 min window) for direct Email-First mode so
 * accidental double-clicks or refreshes don't send duplicate Resend emails.
 */
const recentSubmissions = new Map<string, { at: number; leadCode: string }>();
const DEDUPE_WINDOW_MS = 10 * 60_000;

function checkDuplicateSubmission(email: string, message: string): string | null {
  const now = Date.now();
  for (const [k, v] of recentSubmissions) {
    if (now - v.at > DEDUPE_WINDOW_MS) recentSubmissions.delete(k);
  }
  const key = createHash("sha256")
    .update(`${email.toLowerCase()}::${message.trim().toLowerCase()}`)
    .digest("hex");
  return recentSubmissions.get(key)?.leadCode ?? null;
}

function recordSubmission(email: string, message: string, leadCode: string) {
  const key = createHash("sha256")
    .update(`${email.toLowerCase()}::${message.trim().toLowerCase()}`)
    .digest("hex");
  recentSubmissions.set(key, { at: Date.now(), leadCode });
  if (recentSubmissions.size > 1000) {
    const oldest = recentSubmissions.keys().next().value;
    if (oldest) recentSubmissions.delete(oldest);
  }
}

function generateLeadCode(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(2).toString("hex").toUpperCase();
  return `SE-${stamp}-${suffix}`;
}

/**
 * POST /api/contact
 *
 * Email-First mode (default when Firestore is not configured):
 *  - Validates & rate-limits the enquiry, deduplicates accidental repeats,
 *    generates a reference code, and sends Partner Alert emails via Resend
 *    (with Reply-To set to the enquirer).
 *  - Sends Client Auto-Acknowledgement email automatically once a verified
 *    custom domain sender (CONTACT_FROM_EMAIL) is configured (or in sandbox
 *    when testing to the verified owner inbox).
 *
 * When Firestore is explicitly configured (Phase 2), captures into Firestore
 * and runs the full lead automation pipeline.
 */
const schema = z.object({
  tab: z.enum(["partner", "owner"]).catch("partner"),
  name: z.string().trim().min(1, "Required").max(200),
  company: z.string().trim().min(1, "Required").max(200),
  email: z.string().trim().max(320).pipe(z.email("Invalid email")),
  phone: z.string().trim().max(40).optional().default(""),
  role: z.string().trim().min(1, "Required").max(100),
  message: z.string().trim().min(12, "Too short").max(5000),
  whatsappConsent: z.boolean().optional().default(false),
  website: z.string().optional().default(""), // honeypot
});

const json = (body: unknown, status = 200, headers?: Record<string, string>) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ ok: false, error: "Forbidden" }, 403);

  const ip = clientIp(req);
  const limited = rateLimit(`contact:${ip}`, 5, 10 * 60_000);
  if (!limited.ok) {
    return json(
      { ok: false, error: "Too many requests. Please try again in a few minutes." },
      429,
      { "Retry-After": String(limited.retryAfter) }
    );
  }

  const raw = await req.text();
  if (raw.length > 20_000) return json({ ok: false, error: "Payload too large" }, 413);

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "message");
      errors[field] ??= issue.message;
    }
    return json({ ok: false, errors }, 422);
  }

  const data = parsed.data;

  // Honeypot — pretend success, store nothing.
  if (data.website) return json({ ok: true });

  const normalizedEmail = normalizeEmail(data.email) || data.email.trim().toLowerCase();
  const normalizedPhone = normalizePhone(data.phone);
  const whatsappConsent = Boolean(data.whatsappConsent && normalizedPhone);
  const ipHash = hashIp(ip);

  // Phase 2 path: only run Firestore pipeline when explicitly configured.
  if (isFirestoreExplicitlyConfigured()) {
    try {
      const { lead, isNew, isDuplicateSubmission } = await upsertLead({
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        tab: data.tab,
        role: data.role,
        message: data.message,
        source: "website",
        whatsappConsent,
        consentSource: whatsappConsent ? "website_checkbox" : "none",
        ipHash,
      });

      if (isDuplicateSubmission) {
        await logAutomationEvent({
          leadId: lead.id,
          leadCode: lead.leadCode,
          event: "enquiry.duplicate_suppressed",
          status: "skipped",
          detail: "Duplicate website submission within 10-minute window suppressed.",
        });
        return json({ ok: true, duplicate: true, leadCode: lead.leadCode });
      }

      await createCommunication({
        leadId: lead.id,
        leadCode: lead.leadCode,
        leadName: lead.name,
        channel: "email",
        direction: "inbound",
        recipientType: "client",
        recipient: lead.email || data.email,
        templateOrSubject: `Website Enquiry (${data.role})`,
        content: data.message,
        status: "delivered",
        attempts: 1,
      });

      await logAutomationEvent({
        leadId: lead.id,
        leadCode: lead.leadCode,
        event: isNew ? "enquiry.captured" : "enquiry.merged_existing",
        status: "ok",
        detail: `${isNew ? "Created" : "Merged"} website lead ${lead.leadCode} (${lead.name})`,
      });

      await runLeadAutomation(lead, { isNewLead: isNew });
      return json({ ok: true, leadCode: lead.leadCode });
    } catch (err) {
      console.error("[/api/contact] Firestore pipeline unavailable, falling back to direct Resend email", err);
    }
  }

  // Phase 1 default: Direct Email-First pipeline via Resend (no DB required)
  const existingCode = checkDuplicateSubmission(normalizedEmail, data.message);
  if (existingCode) {
    return json({ ok: true, duplicate: true, leadCode: existingCode });
  }

  const now = new Date().toISOString();
  const leadCode = generateLeadCode();
  const directLead: LeadRecord = {
    id: "direct",
    leadCode,
    name: data.name,
    company: data.company,
    email: normalizedEmail,
    phone: normalizedPhone,
    tab: data.tab,
    role: data.role,
    latestMessage: data.message,
    latestMessageHash: "",
    source: "website",
    whatsappConsent: false,
    consentSource: "none",
    consentTimestamp: null,
    status: "new",
    enquiryCount: 1,
    lastContactAt: now,
    lastInboundWhatsappAt: null,
    createdAt: now,
    updatedAt: now,
    ipHash,
    syncStatus: { sheets: "unconfigured", lastSyncedAt: null, error: null },
    deliverySummary: {
      clientEmail: "queued",
      clientWhatsapp: "skipped_unconfigured",
      partner1Email: "queued",
      partner1Whatsapp: "skipped_unconfigured",
      partner2Email: "queued",
      partner2Whatsapp: "skipped_unconfigured",
    },
  };

  const partnerDestinations = getPartnerDestinations().filter((p) => Boolean(p.email));
  const partnerResults = await Promise.all(
    partnerDestinations.map((p) => sendPartnerAlertEmail(directLead, p))
  );
  const partnerEmailed = partnerResults.some((r) => r.ok);

  // Send automated client acknowledgement:
  // - With verified custom domain sender (CONTACT_FROM_EMAIL): sends to all clients.
  // - In Resend sandbox (onboarding@resend.dev): best-effort (Resend only permits verified owner email).
  let clientAckSent = false;
  if (!isResendSandboxSender() || partnerDestinations.some((p) => p.email === normalizedEmail)) {
    const clientRes = await sendClientWelcomeEmail(directLead);
    clientAckSent = clientRes.ok;
  }

  if (!partnerEmailed && !clientAckSent) {
    return json(
      { ok: false, error: "We couldn't submit your enquiry right now. Please try again shortly." },
      500
    );
  }

  recordSubmission(normalizedEmail, data.message, leadCode);
  return json({ ok: true, leadCode });
}

export async function GET() {
  return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "POST" });
}
