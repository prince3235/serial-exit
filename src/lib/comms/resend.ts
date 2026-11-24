import { SITE_URL } from "@/lib/site";
import { formatPhoneDisplay } from "./phone";
import type { LeadRecord, PartnerDestination } from "./types";

export type SendResult = {
  ok: boolean;
  externalId?: string;
  error?: string;
  unconfigured?: boolean;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || "Serial Exit <onboarding@resend.dev>";
  return { apiKey, from };
}

async function sendViaResend(params: {
  to: string[];
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const { apiKey, from } = getResendConfig();
  if (!apiKey) {
    return { ok: false, unconfigured: true, error: "RESEND_API_KEY is not configured." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
    if (!res.ok) {
      return {
        ok: false,
        error: data?.message || `Resend rejected request with HTTP ${res.status}`,
      };
    }
    return { ok: true, externalId: data?.id };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Resend network timeout/failure",
    };
  }
}

/**
 * Automated welcome email sent to a client upon enquiry capture.
 */
export async function sendClientWelcomeEmail(lead: LeadRecord): Promise<SendResult & { subject: string; text: string }> {
  const subject = `Serial Exit — Enquiry Received (${lead.leadCode})`;
  const text = [
    `Dear ${lead.name},`,
    ``,
    `Thank you for contacting Serial Exit. Your enquiry (${lead.leadCode}) has been received and logged in strict confidence.`,
    ``,
    `Summary:`,
    `• Reference: ${lead.leadCode}`,
    `• Company:   ${lead.company}`,
    `• Mandate:   ${lead.role}`,
    ``,
    `One of our principal partners will review your note and respond directly within two business days.`,
    ``,
    `Regards,`,
    `Serial Exit`,
    `${SITE_URL}`,
    ``,
    `Confidentiality Notice: Serial Exit is an off-market deal origination platform. All enquiries are handled in strict confidence.`,
  ].join("\n");

  const html = `
  <div style="background:#050505;color:#f4f1ec;font-family:Inter,Arial,sans-serif;padding:32px 20px;">
    <div style="max-width:560px;margin:0 auto;border:1px solid rgba(255,255,255,0.1);background:#0b0b0c;padding:32px;">
      <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ff7a1a;font-family:monospace;">
        SERIAL EXIT · ${escapeHtml(lead.leadCode)}
      </p>
      <h1 style="margin:0 0 16px;font-size:22px;font-weight:500;color:#f4f1ec;">
        Enquiry received in confidence.
      </h1>
      <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#d6d2cb;">
        Dear ${escapeHtml(lead.name)},
      </p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#a8a29a;">
        Thank you for reaching out to Serial Exit. Your submission has been securely recorded and routed to our principal partners. A partner will respond directly within two business days.
      </p>
      <div style="border-top:1px solid rgba(255,255,255,0.08);border-bottom:1px solid rgba(255,255,255,0.08);padding:14px 0;margin:20px 0;font-size:13px;color:#d6d2cb;">
        <div><strong style="color:#d9a65a;">Reference:</strong> ${escapeHtml(lead.leadCode)}</div>
        <div style="margin-top:6px;"><strong style="color:#d9a65a;">Company:</strong> ${escapeHtml(lead.company)}</div>
        <div style="margin-top:6px;"><strong style="color:#d9a65a;">Scope / Role:</strong> ${escapeHtml(lead.role)}</div>
      </div>
      <p style="margin:0;font-size:11px;line-height:1.5;color:#78736c;">
        Serial Exit · Verified Off-Market Deal Origination · All enquiries are handled in strict confidence.
      </p>
    </div>
  </div>`;

  if (!lead.email) {
    return { ok: false, unconfigured: true, error: "Client has no email address.", subject, text };
  }

  const res = await sendViaResend({
    to: [lead.email],
    subject,
    text,
    html,
    replyTo: process.env.PARTNER_1_EMAIL?.trim() || process.env.CONTACT_NOTIFY_EMAIL?.trim(),
  });
  return { ...res, subject, text };
}

/**
 * New enquiry alert email sent to each configured Business Partner.
 */
export async function sendPartnerAlertEmail(
  lead: LeadRecord,
  partner: PartnerDestination
): Promise<SendResult & { subject: string; text: string }> {
  const kind = lead.tab === "owner" ? "Business Owner" : lead.source === "whatsapp" ? "WhatsApp Lead" : "Partner";
  const subject = `[${lead.leadCode}] New ${kind} Enquiry — ${lead.name} (${lead.company})`;
  const consentLabel = lead.whatsappConsent ? `Opted In (${lead.consentSource})` : "No";

  const text = [
    `Hello ${partner.name},`,
    ``,
    `A new client enquiry has been captured via ${lead.source.toUpperCase()}.`,
    ``,
    `Reference:         ${lead.leadCode}`,
    `Type:              ${kind}`,
    `Name:              ${lead.name}`,
    `Company:           ${lead.company}`,
    `Email:             ${lead.email || "—"}`,
    `Phone / WhatsApp:  ${formatPhoneDisplay(lead.phone)}`,
    `WhatsApp Consent:  ${consentLabel}`,
    `Role / Scope:      ${lead.role}`,
    ``,
    `Message:`,
    lead.latestMessage,
    ``,
    `Manage this lead in the Partner Portal: ${SITE_URL}`,
  ].join("\n");

  const html = `
  <div style="background:#050505;color:#f4f1ec;font-family:Inter,Arial,sans-serif;padding:28px 18px;">
    <div style="max-width:580px;margin:0 auto;border:1px solid rgba(255,122,26,0.3);background:#0b0b0c;padding:28px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ff7a1a;font-family:monospace;">
        PARTNER ALERT · ${escapeHtml(lead.leadCode)} · ${escapeHtml(lead.source.toUpperCase())}
      </p>
      <h2 style="margin:0 0 18px;font-size:20px;font-weight:500;color:#f4f1ec;">
        ${escapeHtml(lead.name)} — ${escapeHtml(lead.company)}
      </h2>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#d6d2cb;">
        <tr><td style="padding:6px 0;color:#a8a29a;width:140px;">Type</td><td style="padding:6px 0;">${escapeHtml(kind)}</td></tr>
        <tr><td style="padding:6px 0;color:#a8a29a;">Role / Mandate</td><td style="padding:6px 0;">${escapeHtml(lead.role)}</td></tr>
        <tr><td style="padding:6px 0;color:#a8a29a;">Email</td><td style="padding:6px 0;">${escapeHtml(lead.email || "—")}</td></tr>
        <tr><td style="padding:6px 0;color:#a8a29a;">Phone / WA</td><td style="padding:6px 0;">${escapeHtml(formatPhoneDisplay(lead.phone))}</td></tr>
        <tr><td style="padding:6px 0;color:#a8a29a;">WA Consent</td><td style="padding:6px 0;">${escapeHtml(consentLabel)}</td></tr>
      </table>
      <div style="margin-top:16px;padding:14px;border:1px solid rgba(255,255,255,0.08);background:#050505;font-size:13px;line-height:1.6;color:#f4f1ec;white-space:pre-wrap;">${escapeHtml(lead.latestMessage)}</div>
      <p style="margin:18px 0 0;font-size:12px;color:#a8a29a;">
        Open the Partner Portal at <a href="${escapeHtml(SITE_URL)}" style="color:#ffb37a;">${escapeHtml(SITE_URL)}</a> to update status or reply directly.
      </p>
    </div>
  </div>`;

  if (!partner.email) {
    return {
      ok: false,
      unconfigured: true,
      error: `${partner.name} email is not configured.`,
      subject,
      text,
    };
  }

  const res = await sendViaResend({
    to: [partner.email],
    subject,
    text,
    html,
    replyTo: lead.email || undefined,
  });
  return { ...res, subject, text };
}

/**
 * Direct reply sent by a partner from the Partner Portal Client Management Dashboard.
 */
export async function sendPortalReplyEmail(params: {
  toEmail: string;
  subject: string;
  text: string;
  leadCode: string;
  clientName: string;
}): Promise<SendResult> {
  const html = `
  <div style="background:#050505;color:#f4f1ec;font-family:Inter,Arial,sans-serif;padding:28px 18px;">
    <div style="max-width:560px;margin:0 auto;border:1px solid rgba(255,255,255,0.1);background:#0b0b0c;padding:28px;">
      <p style="margin:0 0 12px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#ff7a1a;font-family:monospace;">
        SERIAL EXIT · ${escapeHtml(params.leadCode)}
      </p>
      <div style="font-size:14px;line-height:1.65;color:#f4f1ec;white-space:pre-wrap;">${escapeHtml(params.text)}</div>
      <p style="margin:24px 0 0;font-size:11px;color:#78736c;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;">
        Serial Exit · Confidential Correspondence · ${escapeHtml(SITE_URL)}
      </p>
    </div>
  </div>`;

  return sendViaResend({
    to: [params.toEmail],
    subject: params.subject,
    text: params.text,
    html,
    replyTo: process.env.PARTNER_1_EMAIL?.trim() || process.env.CONTACT_NOTIFY_EMAIL?.trim(),
  });
}
