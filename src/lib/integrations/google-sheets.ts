import { createSign } from "node:crypto";
import { parseGoogleServiceAccount } from "@/lib/firestore";
import type { AutomationLogRecord, CommunicationRecord, LeadRecord } from "@/lib/comms/types";
import { formatPhoneDisplay } from "@/lib/comms/phone";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

const TAB_LEADS = "Leads";
const TAB_COMMS = "Communication Log";
const TAB_LOGS = "Automation Logs";

const HEADERS_LEADS = [
  "Lead ID",
  "Lead Code",
  "Source",
  "Type",
  "Name",
  "Company",
  "Email",
  "Phone / WhatsApp",
  "Role / Mandate",
  "Latest Message",
  "WhatsApp Consent",
  "Consent Source",
  "Status",
  "Enquiry Count",
  "Client Email Status",
  "Client WA Status",
  "Partner 1 Email",
  "Partner 1 WA",
  "Partner 2 Email",
  "Partner 2 WA",
  "Created At",
  "Last Contact At",
];

const HEADERS_COMMS = [
  "Comm ID",
  "Lead ID",
  "Lead Code",
  "Lead Name",
  "Direction",
  "Channel",
  "Recipient Type",
  "Recipient",
  "Subject / Template",
  "Message Content",
  "Status",
  "External Message ID",
  "Attempts",
  "Error",
  "Created At",
  "Updated At",
];

const HEADERS_LOGS = [
  "Log ID",
  "Lead ID",
  "Lead Code",
  "Event",
  "Status",
  "Detail",
  "Created At",
];

let cachedToken: { token: string; expiresAt: number } | null = null;

function getSheetsCredentials() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || "";
  const explicitEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim();
  const explicitKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.trim();

  if (explicitEmail && explicitKey) {
    return {
      spreadsheetId,
      clientEmail: explicitEmail,
      privateKey: explicitKey.replace(/\\n/g, "\n"),
    };
  }

  const sa = parseGoogleServiceAccount();
  return {
    spreadsheetId,
    clientEmail: sa?.client_email || "",
    privateKey: sa?.private_key || "",
  };
}

export function isGoogleSheetsConfigured(): boolean {
  const cfg = getSheetsCredentials();
  return Boolean(cfg.spreadsheetId && cfg.clientEmail && cfg.privateKey);
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const { clientEmail, privateKey } = getSheetsCredentials();
  if (!clientEmail || !privateKey) {
    throw new Error("Google Service Account credentials are not configured for Google Sheets.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope: SHEETS_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  ).toString("base64url");

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const signature = signer.sign(privateKey, "base64url");
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    signal: AbortSignal.timeout(8000),
  });

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || `OAuth2 token failure HTTP ${res.status}`);
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function sheetsFetch(path: string, init?: RequestInit) {
  const token = await getAccessToken();
  const res = await fetch(`${SHEETS_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    signal: AbortSignal.timeout(10_000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`;
    throw new Error(`Google Sheets API error: ${msg}`);
  }
  return body;
}

async function ensureTabsAndHeaders(spreadsheetId: string): Promise<void> {
  const meta = (await sheetsFetch(`/${spreadsheetId}?fields=sheets.properties.title`)) as {
    sheets?: Array<{ properties?: { title?: string } }>;
  };
  const existingTitles = new Set(
    (meta.sheets ?? []).map((s) => s.properties?.title).filter(Boolean) as string[]
  );

  const requiredTabs: Array<{ title: string; headers: string[] }> = [
    { title: TAB_LEADS, headers: HEADERS_LEADS },
    { title: TAB_COMMS, headers: HEADERS_COMMS },
    { title: TAB_LOGS, headers: HEADERS_LOGS },
  ];

  const missing = requiredTabs.filter((t) => !existingTitles.has(t.title));
  if (missing.length > 0) {
    await sheetsFetch(`/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({
        requests: missing.map((t) => ({ addSheet: { properties: { title: t.title } } })),
      }),
    });
  }

  // Ensure row 1 headers exist on each tab
  for (const t of requiredTabs) {
    const range = encodeURIComponent(`'${t.title}'!A1:Z1`);
    const existing = (await sheetsFetch(`/${spreadsheetId}/values/${range}`)) as {
      values?: string[][];
    };
    if (!existing.values || existing.values.length === 0 || existing.values[0].length === 0) {
      await sheetsFetch(`/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        body: JSON.stringify({ values: [t.headers] }),
      });
    }
  }
}

function leadToRow(l: LeadRecord): (string | number)[] {
  return [
    l.id,
    l.leadCode,
    l.source,
    l.tab,
    l.name,
    l.company,
    l.email || "",
    formatPhoneDisplay(l.phone),
    l.role,
    l.latestMessage,
    l.whatsappConsent ? "Yes" : "No",
    l.consentSource,
    l.status,
    l.enquiryCount,
    l.deliverySummary.clientEmail,
    l.deliverySummary.clientWhatsapp,
    l.deliverySummary.partner1Email,
    l.deliverySummary.partner1Whatsapp,
    l.deliverySummary.partner2Email,
    l.deliverySummary.partner2Whatsapp,
    l.createdAt,
    l.lastContactAt,
  ];
}

function commToRow(c: CommunicationRecord): (string | number)[] {
  return [
    c.id,
    c.leadId,
    c.leadCode,
    c.leadName,
    c.direction,
    c.channel,
    c.recipientType,
    c.recipient,
    c.templateOrSubject,
    c.content,
    c.status,
    c.externalMessageId || "",
    c.attempts,
    c.error || "",
    c.createdAt,
    c.updatedAt,
  ];
}

function logToRow(l: AutomationLogRecord): string[] {
  return [
    l.id,
    l.leadId || "",
    l.leadCode || "",
    l.event,
    l.status,
    l.detail,
    l.createdAt,
  ];
}

async function upsertRowsByIdColumn(
  spreadsheetId: string,
  tabName: string,
  rows: (string | number)[][]
): Promise<void> {
  if (rows.length === 0) return;

  const colARange = encodeURIComponent(`'${tabName}'!A:A`);
  const existing = (await sheetsFetch(`/${spreadsheetId}/values/${colARange}`)) as {
    values?: string[][];
  };
  const idToRowIndex = new Map<string, number>();
  (existing.values ?? []).forEach((r, idx) => {
    if (idx > 0 && r[0]) idToRowIndex.set(r[0], idx + 1);
  });

  const toUpdate: Array<{ range: string; values: (string | number)[][] }> = [];
  const toAppend: (string | number)[][] = [];

  for (const row of rows) {
    const id = String(row[0]);
    const rowIdx = idToRowIndex.get(id);
    if (rowIdx) {
      toUpdate.push({
        range: `'${tabName}'!A${rowIdx}`,
        values: [row],
      });
    } else {
      toAppend.push(row);
    }
  }

  if (toUpdate.length > 0) {
    await sheetsFetch(`/${spreadsheetId}/values:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: toUpdate,
      }),
    });
  }

  if (toAppend.length > 0) {
    const appendRange = encodeURIComponent(`'${tabName}'!A:A`);
    await sheetsFetch(
      `/${spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        body: JSON.stringify({ values: toAppend }),
      }
    );
  }
}

export async function syncRecordsToGoogleSheets(params: {
  leads: LeadRecord[];
  communications: CommunicationRecord[];
  logs: AutomationLogRecord[];
}): Promise<{ ok: boolean; unconfigured?: boolean; error?: string }> {
  const { spreadsheetId } = getSheetsCredentials();
  if (!isGoogleSheetsConfigured()) {
    return {
      ok: false,
      unconfigured: true,
      error: "GOOGLE_SHEETS_SPREADSHEET_ID or service account credentials not configured.",
    };
  }

  try {
    await ensureTabsAndHeaders(spreadsheetId);
    await Promise.all([
      upsertRowsByIdColumn(spreadsheetId, TAB_LEADS, params.leads.map(leadToRow)),
      upsertRowsByIdColumn(spreadsheetId, TAB_COMMS, params.communications.map(commToRow)),
      upsertRowsByIdColumn(spreadsheetId, TAB_LOGS, params.logs.map(logToRow)),
    ]);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Google Sheets sync failed",
    };
  }
}
