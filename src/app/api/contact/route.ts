import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "@google-cloud/firestore";
import { z } from "zod";
import { getFirestore } from "@/lib/firestore";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, hashIp, isSameOrigin } from "@/lib/request";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/contact
 *
 * Validates an enquiry, stores it in Firestore (collection `enquiries`) and
 * forwards it by email via Resend when RESEND_API_KEY is set.
 *
 * Delivery guarantee: the request only succeeds if AT LEAST ONE durable
 * channel (Firestore or email) accepted the enquiry. A lead is never
 * silently dropped.
 *
 * Note: work is awaited BEFORE responding. On Cloud Run, CPU is throttled
 * once the response is sent, so "fire-and-forget" email calls can stall.
 *
 * Env (all optional): RESEND_API_KEY, CONTACT_NOTIFY_EMAIL, CONTACT_FROM_EMAIL,
 * FIRESTORE_DATABASE_ID, IP_HASH_SALT.
 */

const schema = z.object({
  tab: z.enum(["partner", "owner"]).catch("partner"),
  name: z.string().trim().min(1, "Required").max(200),
  company: z.string().trim().min(1, "Required").max(200),
  email: z.string().trim().max(320).pipe(z.email("Invalid email")),
  phone: z.string().trim().max(40).optional().default(""),
  role: z.string().trim().min(1, "Required").max(100),
  message: z.string().trim().min(12, "Too short").max(5000),
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

  // Bound the body size before parsing.
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

  const record = {
    tab: data.tab,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone || null,
    role: data.role,
    message: data.message,
    ipHash: hashIp(ip),
    source: SITE_URL,
  };

  const [stored, emailed] = await Promise.all([saveToFirestore(record), notifyByEmail(record)]);

  if (!stored && !emailed) {
    return json({ ok: false, error: "We couldn't submit your enquiry right now. Please try again shortly." }, 500);
  }
  return json({ ok: true });
}

type Record_ = {
  tab: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  role: string;
  message: string;
  ipHash: string;
  source: string;
};

async function saveToFirestore(record: Record_): Promise<boolean> {
  try {
    await getFirestore()
      .collection("enquiries")
      .add({ ...record, createdAt: FieldValue.serverTimestamp() });
    return true;
  } catch (err) {
    console.error("[/api/contact] firestore write failed", err);
    return false;
  }
}

/** Forward the enquiry via Resend. Returns false when unconfigured or on failure. */
async function notifyByEmail(record: Record_): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const to = process.env.CONTACT_NOTIFY_EMAIL || "partners@serialexit.com";
  const from = process.env.CONTACT_FROM_EMAIL || "Serial Exit <onboarding@resend.dev>";
  const kind = record.tab === "owner" ? "Business Owner" : "Partner";

  const text = [
    `New enquiry received via ${new URL(SITE_URL).host}`,
    ``,
    `Type:     ${kind}`,
    `Name:     ${record.name}`,
    `Company:  ${record.company}`,
    `Email:    ${record.email}`,
    `Phone:    ${record.phone || "—"}`,
    `Role:     ${record.role}`,
    ``,
    `Message:`,
    record.message,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: record.email,
        subject: `New ${kind} enquiry — ${record.name} (${record.company})`,
        text,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      console.error("[/api/contact] resend rejected", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[/api/contact] resend failed", err);
    return false;
  }
}

export async function GET() {
  return json({ ok: false, error: "Method not allowed" }, 405, { Allow: "POST" });
}
