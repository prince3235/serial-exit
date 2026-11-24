import ExcelJS from "exceljs";
import type { AutomationLogRecord, CommunicationRecord, LeadRecord } from "@/lib/comms/types";
import { formatPhoneDisplay } from "@/lib/comms/phone";

/**
 * Generates an institutional multi-sheet .xlsx workbook containing Leads,
 * Communication Log, and Automation Logs using ExcelJS.
 */
export async function buildLeadsWorkbookBuffer(data: {
  leads: LeadRecord[];
  communications: CommunicationRecord[];
  logs: AutomationLogRecord[];
}): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Serial Exit";
  wb.created = new Date();

  const headerStyle = {
    font: { bold: true, color: { argb: "FFF4F1EC" }, size: 10 },
    fill: { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FF18181B" } },
    border: {
      bottom: { style: "thin" as const, color: { argb: "FFD9A65A" } },
    },
  };

  // Sheet 1: Leads
  const wsLeads = wb.addWorksheet("Leads", { views: [{ state: "frozen", ySplit: 1 }] });
  wsLeads.columns = [
    { header: "Lead Code", key: "leadCode", width: 15 },
    { header: "Source", key: "source", width: 12 },
    { header: "Type", key: "tab", width: 12 },
    { header: "Name", key: "name", width: 24 },
    { header: "Company", key: "company", width: 24 },
    { header: "Email", key: "email", width: 28 },
    { header: "Phone / WhatsApp", key: "phone", width: 18 },
    { header: "Role / Mandate", key: "role", width: 22 },
    { header: "Latest Message", key: "latestMessage", width: 44 },
    { header: "WA Consent", key: "whatsappConsent", width: 13 },
    { header: "Status", key: "status", width: 13 },
    { header: "Enquiries", key: "enquiryCount", width: 11 },
    { header: "Client Email", key: "clientEmail", width: 16 },
    { header: "Client WA", key: "clientWhatsapp", width: 16 },
    { header: "P1 Email", key: "p1Email", width: 16 },
    { header: "P1 WA", key: "p1Wa", width: 16 },
    { header: "P2 Email", key: "p2Email", width: 16 },
    { header: "P2 WA", key: "p2Wa", width: 16 },
    { header: "Sheets Sync", key: "sheetsSync", width: 14 },
    { header: "Created At", key: "createdAt", width: 24 },
    { header: "Last Contact", key: "lastContactAt", width: 24 },
  ];
  wsLeads.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));

  for (const l of data.leads) {
    wsLeads.addRow({
      leadCode: l.leadCode,
      source: l.source,
      tab: l.tab,
      name: l.name,
      company: l.company,
      email: l.email || "—",
      phone: formatPhoneDisplay(l.phone),
      role: l.role,
      latestMessage: l.latestMessage,
      whatsappConsent: l.whatsappConsent ? "Yes" : "No",
      status: l.status,
      enquiryCount: l.enquiryCount,
      clientEmail: l.deliverySummary.clientEmail,
      clientWhatsapp: l.deliverySummary.clientWhatsapp,
      p1Email: l.deliverySummary.partner1Email,
      p1Wa: l.deliverySummary.partner1Whatsapp,
      p2Email: l.deliverySummary.partner2Email,
      p2Wa: l.deliverySummary.partner2Whatsapp,
      sheetsSync: l.syncStatus.sheets,
      createdAt: l.createdAt,
      lastContactAt: l.lastContactAt,
    });
  }

  // Sheet 2: Communication Log
  const wsComms = wb.addWorksheet("Communication Log", { views: [{ state: "frozen", ySplit: 1 }] });
  wsComms.columns = [
    { header: "Lead Code", key: "leadCode", width: 15 },
    { header: "Lead Name", key: "leadName", width: 22 },
    { header: "Direction", key: "direction", width: 12 },
    { header: "Channel", key: "channel", width: 12 },
    { header: "Recipient Type", key: "recipientType", width: 15 },
    { header: "Recipient", key: "recipient", width: 28 },
    { header: "Subject / Template", key: "templateOrSubject", width: 32 },
    { header: "Content", key: "content", width: 48 },
    { header: "Status", key: "status", width: 16 },
    { header: "External ID", key: "externalMessageId", width: 28 },
    { header: "Attempts", key: "attempts", width: 10 },
    { header: "Error", key: "error", width: 30 },
    { header: "Created At", key: "createdAt", width: 24 },
  ];
  wsComms.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));

  for (const c of data.communications) {
    wsComms.addRow({
      leadCode: c.leadCode,
      leadName: c.leadName,
      direction: c.direction,
      channel: c.channel,
      recipientType: c.recipientType,
      recipient: c.recipient,
      templateOrSubject: c.templateOrSubject,
      content: c.content,
      status: c.status,
      externalMessageId: c.externalMessageId || "",
      attempts: c.attempts,
      error: c.error || "",
      createdAt: c.createdAt,
    });
  }

  // Sheet 3: Automation Logs
  const wsLogs = wb.addWorksheet("Automation Logs", { views: [{ state: "frozen", ySplit: 1 }] });
  wsLogs.columns = [
    { header: "Lead Code", key: "leadCode", width: 15 },
    { header: "Event", key: "event", width: 26 },
    { header: "Status", key: "status", width: 12 },
    { header: "Detail", key: "detail", width: 54 },
    { header: "Created At", key: "createdAt", width: 24 },
  ];
  wsLogs.getRow(1).eachCell((cell) => Object.assign(cell, headerStyle));

  for (const log of data.logs) {
    wsLogs.addRow({
      leadCode: log.leadCode || "—",
      event: log.event,
      status: log.status,
      detail: log.detail,
      createdAt: log.createdAt,
    });
  }

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
