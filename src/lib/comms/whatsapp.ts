import { createHmac, timingSafeEqual } from "node:crypto";
import { normalizePhone } from "./phone";

const GRAPH_VERSION = "v21.0";
const WINDOW_24H_MS = 24 * 60 * 60 * 1000;

export type WhatsappSendResult = {
  ok: boolean;
  externalId?: string;
  error?: string;
  unconfigured?: boolean;
};

export function getWhatsappConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() || "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || "";
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim() || "";
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() || "";
  const welcomeTemplate = process.env.WHATSAPP_TEMPLATE_WELCOME?.trim() || "serial_exit_welcome";
  const partnerAlertTemplate =
    process.env.WHATSAPP_TEMPLATE_PARTNER_ALERT?.trim() || "serial_exit_partner_alert";
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG?.trim() || "en";

  return {
    accessToken,
    phoneNumberId,
    appSecret,
    verifyToken,
    welcomeTemplate,
    partnerAlertTemplate,
    templateLang,
    configured: Boolean(accessToken && phoneNumberId),
  };
}

/**
 * Meta Webhook GET challenge verification (constant-time token compare).
 */
export function verifyWebhookChallenge(
  mode: string | null,
  token: string | null
): boolean {
  const { verifyToken } = getWhatsappConfig();
  if (!verifyToken || mode !== "subscribe" || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(verifyToken);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Verify `X-Hub-Signature-256` from Meta Webhook POST payloads.
 * Fails closed whenever WHATSAPP_APP_SECRET is configured, or in production.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const { appSecret } = getWhatsappConfig();
  if (!appSecret) {
    // Allow unsigned local testing ONLY if explicitly in non-production without secret
    return process.env.NODE_ENV !== "production";
  }
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const expectedHex = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const receivedHex = signatureHeader.slice("sha256=".length).trim().toLowerCase();
  if (expectedHex.length !== receivedHex.length) return false;
  return timingSafeEqual(Buffer.from(expectedHex, "utf8"), Buffer.from(receivedHex, "utf8"));
}

/**
 * Meta WhatsApp Policy: free-form session messages are strictly restricted to
 * within 24 hours of the customer's last inbound message. Outside that window,
 * ONLY pre-approved WhatsApp Templates may be used (with explicit consent).
 */
export function isWithin24hCustomerWindow(lastInboundWhatsappAt: string | null | undefined): boolean {
  if (!lastInboundWhatsappAt) return false;
  const ts = Date.parse(lastInboundWhatsappAt);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < WINDOW_24H_MS;
}

async function postGraphMessage(payload: Record<string, unknown>): Promise<WhatsappSendResult> {
  const cfg = getWhatsappConfig();
  if (!cfg.configured) {
    return {
      ok: false,
      unconfigured: true,
      error: "WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is not configured.",
    };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${cfg.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${cfg.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          ...payload,
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    const data = (await res.json().catch(() => ({}))) as {
      messages?: Array<{ id?: string }>;
      error?: { message?: string; code?: number };
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data?.error?.message || `Meta WhatsApp API error HTTP ${res.status}`,
      };
    }

    return {
      ok: true,
      externalId: data?.messages?.[0]?.id,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "WhatsApp API network failure",
    };
  }
}

/**
 * Send an approved Meta WhatsApp Template message.
 */
export async function sendWhatsappTemplate(params: {
  toPhone: string;
  templateName: string;
  languageCode?: string;
  bodyVariables?: string[];
}): Promise<WhatsappSendResult> {
  const normalized = normalizePhone(params.toPhone);
  if (!normalized) return { ok: false, error: "Invalid destination phone number." };

  const cfg = getWhatsappConfig();
  const lang = params.languageCode || cfg.templateLang;
  const components =
    params.bodyVariables && params.bodyVariables.length > 0
      ? [
          {
            type: "body",
            parameters: params.bodyVariables.map((v) => ({
              type: "text",
              text: v.slice(0, 500),
            })),
          },
        ]
      : undefined;

  return postGraphMessage({
    to: normalized,
    type: "template",
    template: {
      name: params.templateName,
      language: { code: lang },
      ...(components ? { components } : {}),
    },
  });
}

/**
 * Send a free-form session reply inside an active 24h customer-service window.
 */
export async function sendWhatsappSessionText(params: {
  toPhone: string;
  text: string;
  lastInboundWhatsappAt: string | null | undefined;
}): Promise<WhatsappSendResult> {
  if (!isWithin24hCustomerWindow(params.lastInboundWhatsappAt)) {
    return {
      ok: false,
      error:
        "Outside 24-hour WhatsApp customer-service window. Meta policy requires an approved template.",
    };
  }
  const normalized = normalizePhone(params.toPhone);
  if (!normalized) return { ok: false, error: "Invalid destination phone number." };

  return postGraphMessage({
    to: normalized,
    recipient_type: "individual",
    type: "text",
    text: {
      preview_url: false,
      body: params.text.slice(0, 4096),
    },
  });
}
