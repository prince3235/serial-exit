/**
 * Shared domain types for Serial Exit's Client Enquiry & Communication System.
 */

export type LeadSource = "website" | "whatsapp";
export type LeadTab = "partner" | "owner" | "whatsapp";
export type LeadStatus = "new" | "contacted" | "qualified" | "archived";

export type Channel = "email" | "whatsapp";
export type Direction = "inbound" | "outbound";
export type RecipientType = "client" | "partner_1" | "partner_2";

export type DeliveryStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "skipped_no_consent"
  | "skipped_unconfigured";

export type SheetsSyncState = "synced" | "pending" | "failed" | "unconfigured";

export type LeadRecord = {
  id: string;
  leadCode: string;
  name: string;
  company: string;
  email: string | null;
  phone: string | null;
  tab: LeadTab;
  role: string;
  latestMessage: string;
  latestMessageHash: string;
  source: LeadSource;
  whatsappConsent: boolean;
  consentSource: "website_checkbox" | "inbound_whatsapp" | "none";
  consentTimestamp: string | null;
  status: LeadStatus;
  enquiryCount: number;
  lastContactAt: string;
  lastInboundWhatsappAt: string | null;
  createdAt: string;
  updatedAt: string;
  ipHash: string | null;
  syncStatus: {
    sheets: SheetsSyncState;
    lastSyncedAt: string | null;
    error: string | null;
  };
  deliverySummary: {
    clientEmail: DeliveryStatus;
    clientWhatsapp: DeliveryStatus;
    partner1Email: DeliveryStatus;
    partner1Whatsapp: DeliveryStatus;
    partner2Email: DeliveryStatus;
    partner2Whatsapp: DeliveryStatus;
  };
};

export type RetryPayload =
  | {
      kind: "client_welcome_email";
      leadId: string;
    }
  | {
      kind: "partner_alert_email";
      leadId: string;
      partnerKey: "partner_1" | "partner_2";
      partnerName: string;
      partnerEmail: string;
    }
  | {
      kind: "client_welcome_whatsapp";
      leadId: string;
      phone: string;
    }
  | {
      kind: "whatsapp_reply_text";
      leadId: string;
      phone: string;
      text: string;
    }
  | {
      kind: "partner_alert_whatsapp";
      leadId: string;
      partnerKey: "partner_1" | "partner_2";
      partnerName: string;
      partnerPhone: string;
    }
  | {
      kind: "portal_email_reply";
      leadId: string;
      toEmail: string;
      subject: string;
      text: string;
    };

export type CommunicationRecord = {
  id: string;
  leadId: string;
  leadCode: string;
  leadName: string;
  channel: Channel;
  direction: Direction;
  recipientType: RecipientType;
  recipient: string;
  templateOrSubject: string;
  content: string;
  externalMessageId: string | null;
  status: DeliveryStatus;
  error: string | null;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  retryPayload: RetryPayload | null;
  createdAt: string;
  updatedAt: string;
};

export type AutomationLogRecord = {
  id: string;
  leadId: string | null;
  leadCode: string | null;
  event: string;
  status: "ok" | "error" | "skipped";
  detail: string;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

export type PartnerDestination = {
  key: "partner_1" | "partner_2";
  name: string;
  email: string | null;
  whatsapp: string | null;
};
