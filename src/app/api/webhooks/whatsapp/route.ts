import { NextRequest, NextResponse } from "next/server";
import {
  isWithin24hCustomerWindow,
  verifyWebhookChallenge,
  verifyWebhookSignature,
} from "@/lib/comms/whatsapp";
import {
  createCommunication,
  getLeadById,
  hasExternalMessageId,
  logAutomationEvent,
  updateCommunicationByExternalId,
  upsertLead,
} from "@/lib/comms/store";
import { runLeadAutomation } from "@/lib/comms/orchestrator";
import type { DeliveryStatus } from "@/lib/comms/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/webhooks/whatsapp
 * Official Meta WhatsApp Cloud API webhook verification challenge.
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (verifyWebhookChallenge(mode, token) && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" },
    });
  }
  return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 403 });
}

type MetaWebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
        messages?: Array<{
          id?: string;
          from?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
          button?: { text?: string };
          interactive?: {
            button_reply?: { title?: string };
            list_reply?: { title?: string };
          };
        }>;
        statuses?: Array<{
          id?: string;
          status?: string;
          recipient_id?: string;
          errors?: Array<{ code?: number; title?: string; message?: string }>;
        }>;
      };
    }>;
  }>;
};

function mapMetaStatus(status: string | undefined): DeliveryStatus | null {
  switch (status) {
    case "sent":
      return "sent";
    case "delivered":
      return "delivered";
    case "read":
      return "read";
    case "failed":
      return "failed";
    default:
      return null;
  }
}

/**
 * POST /api/webhooks/whatsapp
 * Handles incoming WhatsApp messages and outbound delivery status callbacks
 * from Meta WhatsApp Cloud API. Secured via X-Hub-Signature-256.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  if (rawBody.length > 200_000) {
    return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 });
  }

  const sig = req.headers.get("x-hub-signature-256");
  if (!verifyWebhookSignature(rawBody, sig)) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature" }, { status: 401 });
  }

  let body: MetaWebhookPayload;
  try {
    body = JSON.parse(rawBody) as MetaWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (body.object && body.object !== "whatsapp_business_account") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value) continue;

        // 1. Handle outbound message delivery statuses (sent / delivered / read / failed)
        for (const st of value.statuses ?? []) {
          if (!st.id) continue;
          const mapped = mapMetaStatus(st.status);
          if (!mapped) continue;
          const errText =
            st.errors?.map((e) => `${e.code ?? ""}: ${e.title || e.message || ""}`).join("; ") ||
            null;
          const updated = await updateCommunicationByExternalId(st.id, mapped, errText);
          await logAutomationEvent({
            leadId: updated?.leadId ?? null,
            leadCode: updated?.leadCode ?? null,
            event: `whatsapp.status.${mapped}`,
            status: mapped === "failed" ? "error" : "ok",
            detail: `Meta reported status '${mapped}' for ${st.id}${errText ? ` (${errText})` : ""}`,
          });
        }

        // 2. Handle incoming client WhatsApp messages
        const profileMap = new Map<string, string>();
        for (const contact of value.contacts ?? []) {
          if (contact.wa_id && contact.profile?.name) {
            profileMap.set(contact.wa_id, contact.profile.name);
          }
        }

        for (const msg of value.messages ?? []) {
          const msgId = msg.id || "";
          const fromPhone = msg.from || "";
          if (!msgId || !fromPhone) continue;

          // Webhook deduplication: Meta may deliver the same message webhook multiple times
          if (await hasExternalMessageId(msgId)) {
            await logAutomationEvent({
              event: "whatsapp.duplicate_webhook",
              status: "skipped",
              detail: `Ignored duplicate WhatsApp webhook message ${msgId}`,
            });
            continue;
          }

          const messageText =
            msg.text?.body?.trim() ||
            msg.button?.text?.trim() ||
            msg.interactive?.button_reply?.title?.trim() ||
            msg.interactive?.list_reply?.title?.trim() ||
            `[WhatsApp ${msg.type || "media"} message]`;

          const profileName = profileMap.get(fromPhone) || `WhatsApp User (+${fromPhone})`;

          // Capture or merge lead
          const { lead, isNew, isDuplicateSubmission } = await upsertLead({
            name: profileName,
            company: "WhatsApp Inbound",
            phone: fromPhone,
            tab: "whatsapp",
            role: "WhatsApp Enquiry",
            message: messageText,
            source: "whatsapp",
            whatsappConsent: true, // Customer initiated WhatsApp conversation
            consentSource: "inbound_whatsapp",
            isInboundWhatsapp: true,
          });

          // Record inbound message in communications
          await createCommunication({
            leadId: lead.id,
            leadCode: lead.leadCode,
            leadName: lead.name,
            channel: "whatsapp",
            direction: "inbound",
            recipientType: "client",
            recipient: fromPhone,
            templateOrSubject: "Inbound WhatsApp Message",
            content: messageText,
            externalMessageId: msgId,
            status: "delivered",
            attempts: 1,
          });

          await logAutomationEvent({
            leadId: lead.id,
            leadCode: lead.leadCode,
            event: "whatsapp.inbound",
            status: "ok",
            detail: `Captured inbound WhatsApp message from +${fromPhone}`,
          });

          if (isDuplicateSubmission) continue;

          // Check whether this lead already had an open 24h inbound window before this message
          const freshLead = (await getLeadById(lead.id)) ?? lead;
          const shouldSendAutoReply = isNew || !isWithin24hCustomerWindow(lead.lastInboundWhatsappAt);
          const autoReplyText = shouldSendAutoReply
            ? `Thank you for contacting Serial Exit. Your enquiry (${freshLead.leadCode}) has been received in strict confidence. One of our principal partners will respond directly.`
            : null;

          await runLeadAutomation(freshLead, {
            sendWhatsappSessionReplyText: autoReplyText,
            isNewLead: isNew,
          });
        }
      }
    }
  } catch (err) {
    console.error("[/api/webhooks/whatsapp] processing failed", err);
    // Acknowledge to avoid infinite webhook storms, while logging failure
    await logAutomationEvent({
      event: "whatsapp.webhook_error",
      status: "error",
      detail: err instanceof Error ? err.message : "Unknown webhook processing error",
    }).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
