import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, portalKey, verifySession } from "@/lib/portal-session";
import { isSameOrigin } from "@/lib/request";
import { isFirestoreExplicitlyConfigured } from "@/lib/firestore";
import { getPartnerDestinations } from "@/lib/comms/partners";
import { sendPortalReplyEmail } from "@/lib/comms/resend";
import {
  getWhatsappConfig,
  isWithin24hCustomerWindow,
  sendWhatsappSessionText,
  sendWhatsappTemplate,
} from "@/lib/comms/whatsapp";
import { isGoogleSheetsConfigured, syncRecordsToGoogleSheets } from "@/lib/integrations/google-sheets";
import {
  createCommunication,
  getCommunicationById,
  getLeadById,
  getLeadHistory,
  getRecentAutomationLogs,
  getRecentCommunications,
  listAllForExport,
  listLeads,
  logAutomationEvent,
  updateLeadStatus,
} from "@/lib/comms/store";
import {
  processDueRetries,
  retryCommunication,
  syncLeadRecordWithSheets,
} from "@/lib/comms/orchestrator";
import type { LeadSource, LeadStatus } from "@/lib/comms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "private, no-store" };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers });

function requirePortalSession(req: NextRequest): boolean {
  return verifySession(req.cookies.get(SESSION_COOKIE)?.value, portalKey());
}

function getIntegrationHealth() {
  const partners = getPartnerDestinations();
  const wa = getWhatsappConfig();
  return {
    firestoreConfigured: isFirestoreExplicitlyConfigured(),
    resendConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    whatsappConfigured: wa.configured,
    whatsappWebhookSecured: Boolean(wa.appSecret && wa.verifyToken),
    googleSheetsConfigured: isGoogleSheetsConfigured(),
    partners: partners.map((p) => ({
      key: p.key,
      name: p.name,
      emailConfigured: Boolean(p.email),
      whatsappConfigured: Boolean(p.whatsapp),
    })),
  };
}

/**
 * GET /api/portal/leads
 * Returns leads, communication history, automation logs, and integration status.
 */
export async function GET(req: NextRequest) {
  if (!requirePortalSession(req)) return json({ ok: false, error: "unauthorized" }, 401);

  const leadId = req.nextUrl.searchParams.get("leadId");
  const status = (req.nextUrl.searchParams.get("status") || "all") as LeadStatus | "all";
  const source = (req.nextUrl.searchParams.get("source") || "all") as LeadSource | "all";
  const search = req.nextUrl.searchParams.get("search") || "";

  try {
    if (leadId) {
      const history = await getLeadHistory(leadId);
      if (!history.lead) return json({ ok: false, error: "Lead not found" }, 404);
      return json({ ok: true, ...history, integrations: getIntegrationHealth() });
    }

    const [leads, communications, logs] = await Promise.all([
      listLeads({ status, source, search, limit: 150 }),
      getRecentCommunications(200),
      getRecentAutomationLogs(150),
    ]);

    return json({
      ok: true,
      leads,
      communications,
      logs,
      integrations: getIntegrationHealth(),
    });
  } catch (err) {
    console.error("[/api/portal/leads] GET failed", err);
    return json({
      ok: true,
      leads: [],
      communications: [],
      logs: [],
      integrations: getIntegrationHealth(),
      storageError:
        err instanceof Error ? err.message : "Firestore credentials not configured in this environment.",
    });
  }
}

const patchSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(["new", "contacted", "qualified", "archived"]),
});

/**
 * PATCH /api/portal/leads
 * Updates lead pipeline status and syncs change to Google Sheets.
 */
export async function PATCH(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ ok: false, error: "forbidden" }, 403);
  if (!requirePortalSession(req)) return json({ ok: false, error: "unauthorized" }, 401);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: "Invalid request" }, 400);

  const updated = await updateLeadStatus(parsed.data.leadId, parsed.data.status);
  if (!updated) return json({ ok: false, error: "Lead not found" }, 404);

  await logAutomationEvent({
    leadId: updated.id,
    leadCode: updated.leadCode,
    event: "lead.status_updated",
    status: "ok",
    detail: `Lead status updated to '${updated.status}' via Partner Portal.`,
  });

  await syncLeadRecordWithSheets(updated.id);
  return json({ ok: true, lead: updated });
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("reply"),
    leadId: z.string().min(1),
    channel: z.enum(["email", "whatsapp"]),
    subject: z.string().trim().max(200).optional(),
    message: z.string().trim().min(1).max(4000),
    useTemplate: z.boolean().optional().default(false),
  }),
  z.object({
    action: z.literal("retry"),
    commId: z.string().min(1),
  }),
  z.object({
    action: z.literal("retry_all"),
  }),
  z.object({
    action: z.literal("sync_sheets"),
  }),
]);

/**
 * POST /api/portal/leads
 * Executes Partner Portal actions: direct client reply, retry failed deliveries,
 * or full Google Sheets synchronization.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return json({ ok: false, error: "forbidden" }, 403);
  if (!requirePortalSession(req)) return json({ ok: false, error: "unauthorized" }, 401);

  const body = await req.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: "Invalid action payload" }, 400);

  const data = parsed.data;

  if (data.action === "retry") {
    const comm = await getCommunicationById(data.commId);
    if (!comm) return json({ ok: false, error: "Communication record not found" }, 404);
    const res = await retryCommunication(comm);
    await syncLeadRecordWithSheets(comm.leadId);
    return json({ ok: res.ok, status: res.status, error: res.error });
  }

  if (data.action === "retry_all") {
    const summary = await processDueRetries();
    return json({ ok: true, ...summary });
  }

  if (data.action === "sync_sheets") {
    const all = await listAllForExport();
    const res = await syncRecordsToGoogleSheets(all);
    return json(
      { ok: res.ok, unconfigured: res.unconfigured, error: res.error },
      res.ok ? 200 : res.unconfigured ? 503 : 500
    );
  }

  // action === "reply"
  const lead = await getLeadById(data.leadId);
  if (!lead) return json({ ok: false, error: "Lead not found" }, 404);

  if (data.channel === "email") {
    if (!lead.email) return json({ ok: false, error: "Lead has no email address" }, 400);
    const subject = data.subject?.trim() || `Re: Serial Exit Enquiry (${lead.leadCode})`;
    const res = await sendPortalReplyEmail({
      toEmail: lead.email,
      subject,
      text: data.message,
      leadCode: lead.leadCode,
      clientName: lead.name,
    });
    const status = res.ok ? "sent" : res.unconfigured ? "skipped_unconfigured" : "failed";
    const comm = await createCommunication({
      leadId: lead.id,
      leadCode: lead.leadCode,
      leadName: lead.name,
      channel: "email",
      direction: "outbound",
      recipientType: "client",
      recipient: lead.email,
      templateOrSubject: subject,
      content: data.message,
      externalMessageId: res.externalId ?? null,
      status,
      error: res.ok ? null : res.error ?? null,
      attempts: res.unconfigured ? 0 : 1,
      nextRetryAt: status === "failed" ? new Date(Date.now() + 2 * 60_000).toISOString() : null,
      retryPayload:
        status === "failed"
          ? {
              kind: "portal_email_reply",
              leadId: lead.id,
              toEmail: lead.email,
              subject,
              text: data.message,
            }
          : null,
    });
    if (lead.status === "new" && res.ok) await updateLeadStatus(lead.id, "contacted");
    await logAutomationEvent({
      leadId: lead.id,
      leadCode: lead.leadCode,
      event: "portal.reply_email",
      status: res.ok ? "ok" : "error",
      detail: res.ok ? `Partner sent email reply to ${lead.email}` : res.error || "Failed",
    });
    await syncLeadRecordWithSheets(lead.id);
    return json({ ok: res.ok, communication: comm, error: res.error }, res.ok ? 200 : 502);
  }

  // WhatsApp reply from Partner Portal (enforces consent + 24h Meta policy)
  if (!lead.phone) return json({ ok: false, error: "Lead has no WhatsApp/phone number" }, 400);
  if (!lead.whatsappConsent) {
    return json({ ok: false, error: "Client has not opted into WhatsApp communications." }, 403);
  }

  const inWindow = isWithin24hCustomerWindow(lead.lastInboundWhatsappAt);
  const waCfg = getWhatsappConfig();
  let waRes;
  let templateOrSubject: string;

  if (inWindow && !data.useTemplate) {
    templateOrSubject = "portal_session_reply";
    waRes = await sendWhatsappSessionText({
      toPhone: lead.phone,
      text: data.message,
      lastInboundWhatsappAt: lead.lastInboundWhatsappAt,
    });
  } else {
    templateOrSubject = `template:${waCfg.welcomeTemplate}`;
    waRes = await sendWhatsappTemplate({
      toPhone: lead.phone,
      templateName: waCfg.welcomeTemplate,
      bodyVariables: [lead.name, lead.leadCode],
    });
  }

  const waStatus = waRes.ok ? "sent" : waRes.unconfigured ? "skipped_unconfigured" : "failed";
  const comm = await createCommunication({
    leadId: lead.id,
    leadCode: lead.leadCode,
    leadName: lead.name,
    channel: "whatsapp",
    direction: "outbound",
    recipientType: "client",
    recipient: lead.phone,
    templateOrSubject,
    content: inWindow && !data.useTemplate ? data.message : `Template ${waCfg.welcomeTemplate} re-engagement`,
    externalMessageId: waRes.externalId ?? null,
    status: waStatus,
    error: waRes.ok ? null : waRes.error ?? null,
    attempts: waRes.unconfigured ? 0 : 1,
  });

  if (lead.status === "new" && waRes.ok) await updateLeadStatus(lead.id, "contacted");
  await logAutomationEvent({
    leadId: lead.id,
    leadCode: lead.leadCode,
    event: "portal.reply_whatsapp",
    status: waRes.ok ? "ok" : "error",
    detail: waRes.ok ? `Sent WhatsApp reply to +${lead.phone}` : waRes.error || "Failed",
  });
  await syncLeadRecordWithSheets(lead.id);
  return json({ ok: waRes.ok, communication: comm, error: waRes.error }, waRes.ok ? 200 : 502);
}
