import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin } from "@/lib/request";
import { normalizeEmail, normalizePhone } from "@/lib/comms/phone";
import { getPartnerDestinations } from "@/lib/comms/partners";
import { sendClientWelcomeEmail, sendPartnerAlertEmail } from "@/lib/comms/resend";
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
 * POST /api/contact
 *
 * Captures a website enquiry into the unified Firestore Lead Capture Engine,
 * triggers automated Resend welcome & partner alert emails, triggers consented
 * Meta WhatsApp Cloud API template messages, and syncs to Google Sheets.
 *
 * Delivery guarantee: succeeds only if AT LEAST ONE durable channel (Firestore
 * or Resend email) accepts the enquiry.
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

  const normalizedPhone = normalizePhone(data.phone);
  const whatsappConsent = Boolean(data.whatsappConsent && normalizedPhone);
  const ipHash = hashIp(ip);

  // Try unified Firestore Lead Capture Engine first
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

    // Record the inbound website submission in communications
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

    // Run full automation pipeline (awaited before response so serverless runtimes complete cleanly)
    await runLeadAutomation(lead, { isNewLead: isNew });

    return json({ ok: true, leadCode: lead.leadCode });
  } catch (err) {
    console.error("[/api/contact] Firestore pipeline unavailable, attempting Resend fallback", err);

    const now = new Date().toISOString();
    const fallbackLead: LeadRecord = {
      id: "fallback",
      leadCode: "SE-DIRECT",
      name: data.name,
      company: data.company,
      email: normalizeEmail(data.email),
      phone: normalizedPhone,
      tab: data.tab,
      role: data.role,
      latestMessage: data.message,
      latestMessageHash: "",
      source: "website",
      whatsappConsent,
      consentSource: whatsappConsent ? "website_checkbox" : "none",
      consentTimestamp: whatsappConsent ? now : null,
      status: "new",
      enquiryCount: 1,
      lastContactAt: now,
      lastInboundWhatsappAt: null,
      createdAt: now,
      updatedAt: now,
      ipHash,
      syncStatus: { sheets: "failed", lastSyncedAt: null, error: "Firestore unavailable" },
      deliverySummary: {
        clientEmail: "queued",
        clientWhatsapp: "skipped_unconfigured",
        partner1Email: "queued",
        partner1Whatsapp: "skipped_unconfigured",
        partner2Email: "queued",
        partner2Whatsapp: "skipped_unconfigured",
      },
    };

    const partners = getPartnerDestinations();
    const results = await Promise.all([
      sendClientWelcomeEmail(fallbackLead),
      ...partners.map((p) => sendPartnerAlertEmail(fallbackLead, p)),
    ]);
    const anyEmailed = results.some((r) => r.ok);

    if (!anyEmailed) {
      return json(
        { ok: false, error: "We couldn't submit your enquiry right now. Please try again shortly." },
        500
      );
    }
    return json({ ok: true, leadCode: fallbackLead.leadCode });
  }
}

export async function GET() {
  return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "POST" });
}
