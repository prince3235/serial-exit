import { randomBytes } from "node:crypto";
import { FieldValue } from "@google-cloud/firestore";
import { getFirestore } from "@/lib/firestore";
import { hashMessagePayload, normalizeEmail, normalizePhone } from "./phone";
import type {
  AutomationLogRecord,
  Channel,
  CommunicationRecord,
  DeliveryStatus,
  Direction,
  LeadRecord,
  LeadSource,
  LeadStatus,
  LeadTab,
  RecipientType,
  RetryPayload,
  SheetsSyncState,
} from "./types";

const LEADS_COL = "leads";
const COMMS_COL = "communications";
const LOGS_COL = "automation_logs";
const LEGACY_COL = "enquiries";

const DUPLICATE_WINDOW_MS = 10 * 60_000;

function nowIso(): string {
  return new Date().toISOString();
}

function generateLeadCode(): string {
  const d = new Date();
  const ym = `${String(d.getUTCFullYear()).slice(-2)}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  const hex = randomBytes(2).toString("hex").toUpperCase();
  return `SE-${ym}-${hex}`;
}

export type CaptureLeadInput = {
  name: string;
  company: string;
  email?: string | null;
  phone?: string | null;
  tab: LeadTab;
  role: string;
  message: string;
  source: LeadSource;
  whatsappConsent: boolean;
  consentSource: "website_checkbox" | "inbound_whatsapp" | "none";
  ipHash?: string | null;
  isInboundWhatsapp?: boolean;
};

export type CaptureLeadResult = {
  lead: LeadRecord;
  isNew: boolean;
  isDuplicateSubmission: boolean;
};

/**
 * Find an existing lead by normalized email or normalized phone, merge/update it,
 * or create a new unified lead document in Firestore.
 */
export async function upsertLead(input: CaptureLeadInput): Promise<CaptureLeadResult> {
  const db = getFirestore();
  const leadsRef = db.collection(LEADS_COL);

  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.phone);
  const msgHash = hashMessagePayload(email, phone, input.message);
  const now = nowIso();

  let existingSnap = null as FirebaseFirestore.QueryDocumentSnapshot | null;

  if (email) {
    const byEmail = await leadsRef.where("email", "==", email).limit(1).get();
    if (!byEmail.empty) existingSnap = byEmail.docs[0];
  }
  if (!existingSnap && phone) {
    const byPhone = await leadsRef.where("phone", "==", phone).limit(1).get();
    if (!byPhone.empty) existingSnap = byPhone.docs[0];
  }

  if (existingSnap) {
    const prev = existingSnap.data() as LeadRecord;
    const lastMs = Date.parse(prev.lastContactAt || prev.createdAt || now);
    const isRecentSameMsg =
      prev.latestMessageHash === msgHash &&
      Number.isFinite(lastMs) &&
      Date.now() - lastMs < DUPLICATE_WINDOW_MS;

    if (isRecentSameMsg) {
      return {
        lead: { ...prev, id: existingSnap.id },
        isNew: false,
        isDuplicateSubmission: true,
      };
    }

    const grantedConsent = Boolean(prev.whatsappConsent || input.whatsappConsent);
    const updated: Partial<LeadRecord> = {
      name: prev.name && prev.name !== "WhatsApp Lead" ? prev.name : input.name,
      company: prev.company && prev.company !== "WhatsApp Inbound" ? prev.company : input.company,
      email: prev.email || email,
      phone: prev.phone || phone,
      role: prev.role || input.role,
      latestMessage: input.message,
      latestMessageHash: msgHash,
      whatsappConsent: grantedConsent,
      consentSource: prev.whatsappConsent ? prev.consentSource : input.consentSource,
      consentTimestamp:
        prev.consentTimestamp || (grantedConsent ? now : null),
      enquiryCount: (prev.enquiryCount || 1) + 1,
      lastContactAt: now,
      updatedAt: now,
      ...(input.isInboundWhatsapp ? { lastInboundWhatsappAt: now } : {}),
    };

    await existingSnap.ref.set(updated, { merge: true });
    const merged: LeadRecord = { ...prev, ...updated, id: existingSnap.id };
    return { lead: merged, isNew: false, isDuplicateSubmission: false };
  }

  const docRef = leadsRef.doc();
  const fresh: LeadRecord = {
    id: docRef.id,
    leadCode: generateLeadCode(),
    name: input.name.trim() || "Prospective Client",
    company: input.company.trim() || (input.source === "whatsapp" ? "WhatsApp Inbound" : "—"),
    email,
    phone,
    tab: input.tab,
    role: input.role || "General Enquiry",
    latestMessage: input.message,
    latestMessageHash: msgHash,
    source: input.source,
    whatsappConsent: Boolean(input.whatsappConsent),
    consentSource: input.whatsappConsent ? input.consentSource : "none",
    consentTimestamp: input.whatsappConsent ? now : null,
    status: "new",
    enquiryCount: 1,
    lastContactAt: now,
    lastInboundWhatsappAt: input.isInboundWhatsapp ? now : null,
    createdAt: now,
    updatedAt: now,
    ipHash: input.ipHash ?? null,
    syncStatus: {
      sheets: "pending",
      lastSyncedAt: null,
      error: null,
    },
    deliverySummary: {
      clientEmail: email ? "queued" : "skipped_unconfigured",
      clientWhatsapp: phone
        ? input.whatsappConsent
          ? "queued"
          : "skipped_no_consent"
        : "skipped_unconfigured",
      partner1Email: "queued",
      partner1Whatsapp: "queued",
      partner2Email: "queued",
      partner2Whatsapp: "queued",
    },
  };

  await docRef.set(fresh);

  // Preserve backward-compatible write to `enquiries` collection for website submissions
  if (input.source === "website") {
    await db
      .collection(LEGACY_COL)
      .add({
        leadId: fresh.id,
        leadCode: fresh.leadCode,
        tab: input.tab,
        name: fresh.name,
        company: fresh.company,
        email: fresh.email,
        phone: fresh.phone,
        role: fresh.role,
        message: input.message,
        whatsappConsent: fresh.whatsappConsent,
        ipHash: fresh.ipHash,
        createdAt: FieldValue.serverTimestamp(),
      })
      .catch((err) => console.error("[store] legacy enquiries write skipped", err));
  }

  return { lead: fresh, isNew: true, isDuplicateSubmission: false };
}

/** Check if an external Meta/Resend message ID has already been recorded (webhook idempotency). */
export async function hasExternalMessageId(externalMessageId: string): Promise<boolean> {
  if (!externalMessageId) return false;
  const db = getFirestore();
  const snap = await db
    .collection(COMMS_COL)
    .where("externalMessageId", "==", externalMessageId)
    .limit(1)
    .get();
  return !snap.empty;
}

export type CreateCommInput = {
  leadId: string;
  leadCode: string;
  leadName: string;
  channel: Channel;
  direction: Direction;
  recipientType: RecipientType;
  recipient: string;
  templateOrSubject: string;
  content: string;
  externalMessageId?: string | null;
  status: DeliveryStatus;
  error?: string | null;
  attempts?: number;
  maxAttempts?: number;
  nextRetryAt?: string | null;
  retryPayload?: RetryPayload | null;
};

export async function createCommunication(input: CreateCommInput): Promise<CommunicationRecord> {
  const db = getFirestore();
  const ref = db.collection(COMMS_COL).doc();
  const now = nowIso();
  const record: CommunicationRecord = {
    id: ref.id,
    leadId: input.leadId,
    leadCode: input.leadCode,
    leadName: input.leadName,
    channel: input.channel,
    direction: input.direction,
    recipientType: input.recipientType,
    recipient: input.recipient,
    templateOrSubject: input.templateOrSubject,
    content: input.content,
    externalMessageId: input.externalMessageId ?? null,
    status: input.status,
    error: input.error ?? null,
    attempts: input.attempts ?? (input.direction === "inbound" ? 1 : 0),
    maxAttempts: input.maxAttempts ?? 3,
    nextRetryAt: input.nextRetryAt ?? null,
    retryPayload: input.retryPayload ?? null,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(record);
  await syncLeadDeliveryField(input.leadId, input.channel, input.direction, input.recipientType, input.status);
  return record;
}

export async function updateCommunication(
  id: string,
  patch: Partial<Pick<CommunicationRecord, "status" | "error" | "externalMessageId" | "attempts" | "nextRetryAt">>
): Promise<CommunicationRecord | null> {
  const db = getFirestore();
  const ref = db.collection(COMMS_COL).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const prev = snap.data() as CommunicationRecord;
  const updatedAt = nowIso();
  await ref.set({ ...patch, updatedAt }, { merge: true });
  const next: CommunicationRecord = { ...prev, ...patch, updatedAt };
  await syncLeadDeliveryField(prev.leadId, prev.channel, prev.direction, prev.recipientType, next.status);
  return next;
}

export async function updateCommunicationByExternalId(
  externalMessageId: string,
  status: DeliveryStatus,
  error?: string | null
): Promise<CommunicationRecord | null> {
  if (!externalMessageId) return null;
  const db = getFirestore();
  const snap = await db
    .collection(COMMS_COL)
    .where("externalMessageId", "==", externalMessageId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const prev = doc.data() as CommunicationRecord;
  const updatedAt = nowIso();
  const patch: Partial<CommunicationRecord> = {
    status,
    error: error ?? prev.error,
    updatedAt,
    ...(status === "failed" && prev.attempts < prev.maxAttempts
      ? { nextRetryAt: new Date(Date.now() + 2 * 60_000).toISOString() }
      : { nextRetryAt: null }),
  };
  await doc.ref.set(patch, { merge: true });
  await syncLeadDeliveryField(prev.leadId, prev.channel, prev.direction, prev.recipientType, status);
  return { ...prev, ...patch };
}

async function syncLeadDeliveryField(
  leadId: string,
  channel: Channel,
  direction: Direction,
  recipientType: RecipientType,
  status: DeliveryStatus
) {
  if (direction !== "outbound") return;
  const keyMap: Record<string, keyof LeadRecord["deliverySummary"]> = {
    "client:email": "clientEmail",
    "client:whatsapp": "clientWhatsapp",
    "partner_1:email": "partner1Email",
    "partner_1:whatsapp": "partner1Whatsapp",
    "partner_2:email": "partner2Email",
    "partner_2:whatsapp": "partner2Whatsapp",
  };
  const field = keyMap[`${recipientType}:${channel}`];
  if (!field) return;
  const db = getFirestore();
  await db
    .collection(LEADS_COL)
    .doc(leadId)
    .set(
      {
        updatedAt: nowIso(),
        deliverySummary: { [field]: status },
      },
      { merge: true }
    )
    .catch(() => undefined);
}

export async function updateLeadSyncStatus(
  leadId: string,
  sheets: SheetsSyncState,
  error: string | null = null
) {
  const db = getFirestore();
  await db
    .collection(LEADS_COL)
    .doc(leadId)
    .set(
      {
        updatedAt: nowIso(),
        syncStatus: {
          sheets,
          lastSyncedAt: sheets === "synced" ? nowIso() : null,
          error,
        },
      },
      { merge: true }
    );
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<LeadRecord | null> {
  const db = getFirestore();
  const ref = db.collection(LEADS_COL).doc(leadId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const updatedAt = nowIso();
  await ref.set({ status, updatedAt }, { merge: true });
  return { ...(snap.data() as LeadRecord), status, updatedAt };
}

export async function getLeadById(leadId: string): Promise<LeadRecord | null> {
  const db = getFirestore();
  const snap = await db.collection(LEADS_COL).doc(leadId).get();
  if (!snap.exists) return null;
  return { ...(snap.data() as LeadRecord), id: snap.id };
}

export async function logAutomationEvent(input: {
  leadId?: string | null;
  leadCode?: string | null;
  event: string;
  status: "ok" | "error" | "skipped";
  detail: string;
  meta?: Record<string, unknown> | null;
}): Promise<AutomationLogRecord> {
  const db = getFirestore();
  const ref = db.collection(LOGS_COL).doc();
  const record: AutomationLogRecord = {
    id: ref.id,
    leadId: input.leadId ?? null,
    leadCode: input.leadCode ?? null,
    event: input.event,
    status: input.status,
    detail: input.detail,
    meta: input.meta ?? null,
    createdAt: nowIso(),
  };
  await ref.set(record).catch((err) => console.error("[store] logAutomationEvent failed", err));
  return record;
}

export async function listLeads(options?: {
  limit?: number;
  status?: LeadStatus | "all";
  source?: LeadSource | "all";
  search?: string;
}): Promise<LeadRecord[]> {
  const db = getFirestore();
  const limit = Math.min(options?.limit ?? 100, 300);
  const snap = await db
    .collection(LEADS_COL)
    .orderBy("lastContactAt", "desc")
    .limit(limit)
    .get();

  let items = snap.docs.map((d) => ({ ...(d.data() as LeadRecord), id: d.id }));
  if (options?.status && options.status !== "all") {
    items = items.filter((l) => l.status === options.status);
  }
  if (options?.source && options.source !== "all") {
    items = items.filter((l) => l.source === options.source);
  }
  if (options?.search) {
    const q = options.search.trim().toLowerCase();
    items = items.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.phone ?? "").includes(q) ||
        l.leadCode.toLowerCase().includes(q)
    );
  }
  return items;
}

export async function getLeadHistory(leadId: string): Promise<{
  lead: LeadRecord | null;
  communications: CommunicationRecord[];
  logs: AutomationLogRecord[];
}> {
  const db = getFirestore();
  const [leadSnap, commsSnap, logsSnap] = await Promise.all([
    db.collection(LEADS_COL).doc(leadId).get(),
    db.collection(COMMS_COL).where("leadId", "==", leadId).get(),
    db.collection(LOGS_COL).where("leadId", "==", leadId).get(),
  ]);

  if (!leadSnap.exists) return { lead: null, communications: [], logs: [] };

  const communications = commsSnap.docs
    .map((d) => ({ ...(d.data() as CommunicationRecord), id: d.id }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  const logs = logsSnap.docs
    .map((d) => ({ ...(d.data() as AutomationLogRecord), id: d.id }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    lead: { ...(leadSnap.data() as LeadRecord), id: leadSnap.id },
    communications,
    logs,
  };
}

export async function getRecentCommunications(limit = 150): Promise<CommunicationRecord[]> {
  const db = getFirestore();
  const snap = await db
    .collection(COMMS_COL)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ ...(d.data() as CommunicationRecord), id: d.id }));
}

export async function getRecentAutomationLogs(limit = 150): Promise<AutomationLogRecord[]> {
  const db = getFirestore();
  const snap = await db
    .collection(LOGS_COL)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({ ...(d.data() as AutomationLogRecord), id: d.id }));
}

export async function getCommunicationById(id: string): Promise<CommunicationRecord | null> {
  const db = getFirestore();
  const snap = await db.collection(COMMS_COL).doc(id).get();
  if (!snap.exists) return null;
  return { ...(snap.data() as CommunicationRecord), id: snap.id };
}

export async function listDueRetryCommunications(limit = 25): Promise<CommunicationRecord[]> {
  const db = getFirestore();
  const snap = await db
    .collection(COMMS_COL)
    .where("status", "==", "failed")
    .limit(limit * 2)
    .get();

  const now = Date.now();
  return snap.docs
    .map((d) => ({ ...(d.data() as CommunicationRecord), id: d.id }))
    .filter(
      (c) =>
        c.direction === "outbound" &&
        c.retryPayload !== null &&
        c.attempts < c.maxAttempts &&
        (!c.nextRetryAt || Date.parse(c.nextRetryAt) <= now)
    )
    .slice(0, limit);
}

export async function listAllForExport(): Promise<{
  leads: LeadRecord[];
  communications: CommunicationRecord[];
  logs: AutomationLogRecord[];
}> {
  const [leads, communications, logs] = await Promise.all([
    listLeads({ limit: 300 }),
    getRecentCommunications(500),
    getRecentAutomationLogs(500),
  ]);
  return { leads, communications, logs };
}
