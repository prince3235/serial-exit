import { getPartnerDestinations } from "./partners";
import { sendClientWelcomeEmail, sendPartnerAlertEmail, sendPortalReplyEmail } from "./resend";
import {
  getWhatsappConfig,
  isWithin24hCustomerWindow,
  sendWhatsappSessionText,
  sendWhatsappTemplate,
} from "./whatsapp";
import {
  createCommunication,
  getLeadById,
  getLeadHistory,
  listDueRetryCommunications,
  logAutomationEvent,
  updateCommunication,
  updateLeadSyncStatus,
} from "./store";
import { isGoogleSheetsConfigured, syncRecordsToGoogleSheets } from "@/lib/integrations/google-sheets";
import type { AutomationLogRecord, CommunicationRecord, DeliveryStatus, LeadRecord } from "./types";

const RETRY_DELAYS_MS = [2 * 60_000, 10 * 60_000, 30 * 60_000];

function computeNextRetry(attempts: number, maxAttempts: number): string | null {
  if (attempts >= maxAttempts) return null;
  const delay = RETRY_DELAYS_MS[Math.min(attempts - 1, RETRY_DELAYS_MS.length - 1)] ?? 10 * 60_000;
  return new Date(Date.now() + delay).toISOString();
}

function statusFromResult(res: { ok: boolean; unconfigured?: boolean }): DeliveryStatus {
  if (res.ok) return "sent";
  return res.unconfigured ? "skipped_unconfigured" : "failed";
}

/**
 * Full automated dispatch workflow executed when a lead is captured from
 * the website form or an inbound WhatsApp message.
 */
export async function runLeadAutomation(
  lead: LeadRecord,
  options: { sendWhatsappSessionReplyText?: string | null; isNewLead: boolean }
): Promise<{
  communications: CommunicationRecord[];
  logs: AutomationLogRecord[];
}> {
  const createdComms: CommunicationRecord[] = [];
  const createdLogs: AutomationLogRecord[] = [];

  const recordLog = async (
    event: string,
    status: "ok" | "error" | "skipped",
    detail: string,
    meta?: Record<string, unknown>
  ) => {
    const log = await logAutomationEvent({
      leadId: lead.id,
      leadCode: lead.leadCode,
      event,
      status,
      detail,
      meta: meta ?? null,
    });
    createdLogs.push(log);
  };

  // 1. Client Welcome Email (when email exists)
  if (lead.email) {
    const res = await sendClientWelcomeEmail(lead);
    const status = statusFromResult(res);
    const comm = await createCommunication({
      leadId: lead.id,
      leadCode: lead.leadCode,
      leadName: lead.name,
      channel: "email",
      direction: "outbound",
      recipientType: "client",
      recipient: lead.email,
      templateOrSubject: res.subject,
      content: res.text,
      externalMessageId: res.externalId ?? null,
      status,
      error: res.ok ? null : res.error ?? null,
      attempts: res.unconfigured ? 0 : 1,
      nextRetryAt: status === "failed" ? computeNextRetry(1, 3) : null,
      retryPayload: status === "failed" ? { kind: "client_welcome_email", leadId: lead.id } : null,
    });
    createdComms.push(comm);
    await recordLog(
      "email.client_welcome",
      res.ok ? "ok" : res.unconfigured ? "skipped" : "error",
      res.ok ? `Sent welcome email to ${lead.email}` : res.error || "Skipped"
    );
  }

  // 2. Client Automated WhatsApp (strictly respecting consent & Meta template / 24h policy)
  const waCfg = getWhatsappConfig();
  if (lead.phone) {
    if (!lead.whatsappConsent) {
      const comm = await createCommunication({
        leadId: lead.id,
        leadCode: lead.leadCode,
        leadName: lead.name,
        channel: "whatsapp",
        direction: "outbound",
        recipientType: "client",
        recipient: lead.phone,
        templateOrSubject: waCfg.welcomeTemplate,
        content: "Skipped: client did not grant WhatsApp communication consent.",
        status: "skipped_no_consent",
        attempts: 0,
      });
      createdComms.push(comm);
      await recordLog("whatsapp.client_welcome", "skipped", "No WhatsApp consent given by client.");
    } else if (
      options.sendWhatsappSessionReplyText &&
      isWithin24hCustomerWindow(lead.lastInboundWhatsappAt)
    ) {
      // Reply inside active 24h customer-initiated session window
      const replyText = options.sendWhatsappSessionReplyText;
      const res = await sendWhatsappSessionText({
        toPhone: lead.phone,
        text: replyText,
        lastInboundWhatsappAt: lead.lastInboundWhatsappAt,
      });
      const status = statusFromResult(res);
      const comm = await createCommunication({
        leadId: lead.id,
        leadCode: lead.leadCode,
        leadName: lead.name,
        channel: "whatsapp",
        direction: "outbound",
        recipientType: "client",
        recipient: lead.phone,
        templateOrSubject: "session_auto_reply",
        content: replyText,
        externalMessageId: res.externalId ?? null,
        status,
        error: res.ok ? null : res.error ?? null,
        attempts: res.unconfigured ? 0 : 1,
        nextRetryAt: status === "failed" ? computeNextRetry(1, 3) : null,
        retryPayload:
          status === "failed"
            ? { kind: "whatsapp_reply_text", leadId: lead.id, phone: lead.phone, text: replyText }
            : null,
      });
      createdComms.push(comm);
      await recordLog(
        "whatsapp.session_reply",
        res.ok ? "ok" : res.unconfigured ? "skipped" : "error",
        res.ok ? `Sent WhatsApp session reply to +${lead.phone}` : res.error || "Skipped"
      );
    } else if (lead.source === "website") {
      // Business-initiated contact from website opt-in -> MUST use approved Meta template
      const res = await sendWhatsappTemplate({
        toPhone: lead.phone,
        templateName: waCfg.welcomeTemplate,
        bodyVariables: [lead.name, lead.leadCode],
      });
      const status = statusFromResult(res);
      const comm = await createCommunication({
        leadId: lead.id,
        leadCode: lead.leadCode,
        leadName: lead.name,
        channel: "whatsapp",
        direction: "outbound",
        recipientType: "client",
        recipient: lead.phone,
        templateOrSubject: `template:${waCfg.welcomeTemplate}`,
        content: `Approved template (${waCfg.welcomeTemplate}): Welcome ${lead.name}, Ref ${lead.leadCode}`,
        externalMessageId: res.externalId ?? null,
        status,
        error: res.ok ? null : res.error ?? null,
        attempts: res.unconfigured ? 0 : 1,
        nextRetryAt: status === "failed" ? computeNextRetry(1, 3) : null,
        retryPayload:
          status === "failed"
            ? { kind: "client_welcome_whatsapp", leadId: lead.id, phone: lead.phone }
            : null,
      });
      createdComms.push(comm);
      await recordLog(
        "whatsapp.client_welcome",
        res.ok ? "ok" : res.unconfigured ? "skipped" : "error",
        res.ok ? `Sent WhatsApp template to +${lead.phone}` : res.error || "Skipped"
      );
    }
  }

  // 3. Notify BOTH Business Partners via Email & WhatsApp
  const partners = getPartnerDestinations();
  await Promise.all(
    partners.map(async (partner) => {
      // Email alert
      const emailRes = await sendPartnerAlertEmail(lead, partner);
      const emailStatus = statusFromResult(emailRes);
      const emailComm = await createCommunication({
        leadId: lead.id,
        leadCode: lead.leadCode,
        leadName: lead.name,
        channel: "email",
        direction: "outbound",
        recipientType: partner.key,
        recipient: partner.email || `${partner.name} (unconfigured)`,
        templateOrSubject: emailRes.subject,
        content: emailRes.text,
        externalMessageId: emailRes.externalId ?? null,
        status: emailStatus,
        error: emailRes.ok ? null : emailRes.error ?? null,
        attempts: emailRes.unconfigured ? 0 : 1,
        nextRetryAt: emailStatus === "failed" ? computeNextRetry(1, 3) : null,
        retryPayload:
          emailStatus === "failed" && partner.email
            ? {
                kind: "partner_alert_email",
                leadId: lead.id,
                partnerKey: partner.key,
                partnerName: partner.name,
                partnerEmail: partner.email,
              }
            : null,
      });
      createdComms.push(emailComm);
      await recordLog(
        `email.${partner.key}_alert`,
        emailRes.ok ? "ok" : emailRes.unconfigured ? "skipped" : "error",
        emailRes.ok ? `Notified ${partner.name} (${partner.email})` : emailRes.error || "Skipped"
      );

      // WhatsApp alert
      if (partner.whatsapp) {
        const waRes = await sendWhatsappTemplate({
          toPhone: partner.whatsapp,
          templateName: waCfg.partnerAlertTemplate,
          bodyVariables: [lead.leadCode, lead.name, lead.company, lead.role],
        });
        const waStatus = statusFromResult(waRes);
        const waComm = await createCommunication({
          leadId: lead.id,
          leadCode: lead.leadCode,
          leadName: lead.name,
          channel: "whatsapp",
          direction: "outbound",
          recipientType: partner.key,
          recipient: partner.whatsapp,
          templateOrSubject: `template:${waCfg.partnerAlertTemplate}`,
          content: `Partner alert (${lead.leadCode}): ${lead.name} (${lead.company}) — ${lead.role}`,
          externalMessageId: waRes.externalId ?? null,
          status: waStatus,
          error: waRes.ok ? null : waRes.error ?? null,
          attempts: waRes.unconfigured ? 0 : 1,
          nextRetryAt: waStatus === "failed" ? computeNextRetry(1, 3) : null,
          retryPayload:
            waStatus === "failed"
              ? {
                  kind: "partner_alert_whatsapp",
                  leadId: lead.id,
                  partnerKey: partner.key,
                  partnerName: partner.name,
                  partnerPhone: partner.whatsapp,
                }
              : null,
        });
        createdComms.push(waComm);
        await recordLog(
          `whatsapp.${partner.key}_alert`,
          waRes.ok ? "ok" : waRes.unconfigured ? "skipped" : "error",
          waRes.ok ? `WhatsApp alert sent to ${partner.name}` : waRes.error || "Skipped"
        );
      } else {
        const waComm = await createCommunication({
          leadId: lead.id,
          leadCode: lead.leadCode,
          leadName: lead.name,
          channel: "whatsapp",
          direction: "outbound",
          recipientType: partner.key,
          recipient: `${partner.name} (unconfigured)`,
          templateOrSubject: `template:${waCfg.partnerAlertTemplate}`,
          content: "Partner WhatsApp number not configured.",
          status: "skipped_unconfigured",
          attempts: 0,
        });
        createdComms.push(waComm);
        await recordLog(
          `whatsapp.${partner.key}_alert`,
          "skipped",
          `${partner.name} WhatsApp number not configured.`
        );
      }
    })
  );

  // 4. Synchronize Lead + Communications + Automation Logs to Google Sheets
  await syncLeadRecordWithSheets(lead.id, createdComms, createdLogs);

  return { communications: createdComms, logs: createdLogs };
}

export async function syncLeadRecordWithSheets(
  leadId: string,
  extraComms: CommunicationRecord[] = [],
  extraLogs: AutomationLogRecord[] = []
): Promise<{ ok: boolean; unconfigured?: boolean; error?: string }> {
  const history = await getLeadHistory(leadId);
  if (!history.lead) return { ok: false, error: "Lead not found" };

  if (!isGoogleSheetsConfigured()) {
    await updateLeadSyncStatus(leadId, "unconfigured", "Google Sheets credentials not configured.");
    await logAutomationEvent({
      leadId,
      leadCode: history.lead.leadCode,
      event: "sheets.sync",
      status: "skipped",
      detail: "Google Sheets not configured.",
    });
    return { ok: false, unconfigured: true, error: "Google Sheets not configured." };
  }

  const syncRes = await syncRecordsToGoogleSheets({
    leads: [history.lead],
    communications: history.communications.length ? history.communications : extraComms,
    logs: history.logs.length ? history.logs : extraLogs,
  });

  if (syncRes.ok) {
    await updateLeadSyncStatus(leadId, "synced", null);
    await logAutomationEvent({
      leadId,
      leadCode: history.lead.leadCode,
      event: "sheets.sync",
      status: "ok",
      detail: `Synced ${history.lead.leadCode} to Google Sheets.`,
    });
  } else {
    await updateLeadSyncStatus(leadId, "failed", syncRes.error || "Sync failed");
    await logAutomationEvent({
      leadId,
      leadCode: history.lead.leadCode,
      event: "sheets.sync",
      status: "error",
      detail: syncRes.error || "Google Sheets sync failed",
    });
  }

  return syncRes;
}

/**
 * Re-execute a failed outbound communication record cleanly and update delivery state.
 */
export async function retryCommunication(comm: CommunicationRecord): Promise<{
  ok: boolean;
  status: DeliveryStatus;
  error?: string;
}> {
  if (!comm.retryPayload) {
    return { ok: false, status: comm.status, error: "No retry payload stored for this message." };
  }
  const lead = await getLeadById(comm.leadId);
  if (!lead) {
    return { ok: false, status: comm.status, error: "Lead record no longer exists." };
  }

  const nextAttempts = comm.attempts + 1;
  const waCfg = getWhatsappConfig();
  let res: { ok: boolean; externalId?: string; error?: string; unconfigured?: boolean } = {
    ok: false,
    error: "Unknown retry kind",
  };

  switch (comm.retryPayload.kind) {
    case "client_welcome_email":
      res = await sendClientWelcomeEmail(lead);
      break;
    case "partner_alert_email":
      res = await sendPartnerAlertEmail(lead, {
        key: comm.retryPayload.partnerKey,
        name: comm.retryPayload.partnerName,
        email: comm.retryPayload.partnerEmail,
        whatsapp: null,
      });
      break;
    case "client_welcome_whatsapp":
      if (!lead.whatsappConsent) {
        await updateCommunication(comm.id, { status: "skipped_no_consent", nextRetryAt: null });
        return { ok: false, status: "skipped_no_consent", error: "Client consent revoked/missing." };
      }
      res = await sendWhatsappTemplate({
        toPhone: comm.retryPayload.phone,
        templateName: waCfg.welcomeTemplate,
        bodyVariables: [lead.name, lead.leadCode],
      });
      break;
    case "whatsapp_reply_text":
      res = await sendWhatsappSessionText({
        toPhone: comm.retryPayload.phone,
        text: comm.retryPayload.text,
        lastInboundWhatsappAt: lead.lastInboundWhatsappAt,
      });
      break;
    case "partner_alert_whatsapp":
      res = await sendWhatsappTemplate({
        toPhone: comm.retryPayload.partnerPhone,
        templateName: waCfg.partnerAlertTemplate,
        bodyVariables: [lead.leadCode, lead.name, lead.company, lead.role],
      });
      break;
    case "portal_email_reply":
      res = await sendPortalReplyEmail({
        toEmail: comm.retryPayload.toEmail,
        subject: comm.retryPayload.subject,
        text: comm.retryPayload.text,
        leadCode: lead.leadCode,
        clientName: lead.name,
      });
      break;
  }

  const status = statusFromResult(res);
  await updateCommunication(comm.id, {
    status,
    attempts: nextAttempts,
    externalMessageId: res.externalId ?? comm.externalMessageId,
    error: res.ok ? null : res.error ?? null,
    nextRetryAt: status === "failed" ? computeNextRetry(nextAttempts, comm.maxAttempts) : null,
  });

  await logAutomationEvent({
    leadId: lead.id,
    leadCode: lead.leadCode,
    event: "retry.executed",
    status: res.ok ? "ok" : "error",
    detail: res.ok
      ? `Retry #${nextAttempts} succeeded for ${comm.channel} (${comm.recipientType})`
      : `Retry #${nextAttempts} failed: ${res.error}`,
  });

  return { ok: res.ok, status, error: res.error };
}

export async function processDueRetries(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const due = await listDueRetryCommunications(25);
  let succeeded = 0;
  let failed = 0;

  for (const comm of due) {
    const r = await retryCommunication(comm);
    if (r.ok) succeeded += 1;
    else failed += 1;
  }

  return { processed: due.length, succeeded, failed };
}
