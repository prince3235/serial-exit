"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  Mail,
  MessageSquare,
  RefreshCw,
  RotateCw,
  Search,
  Send,
  Sheet,
  AlertTriangle,
} from "lucide-react";
import type {
  AutomationLogRecord,
  CommunicationRecord,
  DeliveryStatus,
  LeadRecord,
  LeadSource,
  LeadStatus,
} from "@/lib/comms/types";
import { cn } from "@/lib/utils";

type IntegrationHealth = {
  firestoreConfigured: boolean;
  resendConfigured: boolean;
  whatsappConfigured: boolean;
  whatsappWebhookSecured: boolean;
  googleSheetsConfigured: boolean;
  partners: Array<{
    key: string;
    name: string;
    emailConfigured: boolean;
    whatsappConfigured: boolean;
  }>;
};

type DashboardResponse = {
  ok: boolean;
  leads?: LeadRecord[];
  communications?: CommunicationRecord[];
  logs?: AutomationLogRecord[];
  integrations?: IntegrationHealth;
  storageError?: string;
};

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  contacted: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  qualified: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  archived: "border-white/15 bg-white/[0.04] text-foreground/60",
};

const DELIVERY_STYLE: Record<DeliveryStatus, string> = {
  queued: "text-foreground/65 border-white/15",
  sent: "text-amber-300 border-amber-500/40 bg-amber-500/[0.06]",
  delivered: "text-emerald-300 border-emerald-500/40 bg-emerald-500/[0.06]",
  read: "text-emerald-200 border-emerald-400/50 bg-emerald-500/10",
  failed: "text-rose-300 border-rose-500/50 bg-rose-500/10",
  skipped_no_consent: "text-foreground/55 border-white/10",
  skipped_unconfigured: "text-foreground/50 border-white/10",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(digits: string | null | undefined): string {
  if (!digits) return "—";
  return digits.startsWith("+") ? digits : `+${digits}`;
}

export function ClientDashboard() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [comms, setComms] = useState<CommunicationRecord[]>([]);
  const [logs, setLogs] = useState<AutomationLogRecord[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationHealth | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [detailTab, setDetailTab] = useState<"comms" | "logs">("comms");

  // Direct reply state
  const [replyChannel, setReplyChannel] = useState<"email" | "whatsapp">("email");
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const applyDashboardData = useCallback((data: DashboardResponse) => {
    const nextLeads = data.leads ?? [];
    setLeads(nextLeads);
    setComms(data.communications ?? []);
    setLogs(data.logs ?? []);
    setIntegrations(data.integrations ?? null);
    setStorageError(data.storageError ?? null);
    setSelectedId((prev) =>
      prev && nextLeads.some((l) => l.id === prev) ? prev : nextLeads[0]?.id ?? null
    );
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portal/leads", { credentials: "same-origin" });
      const data = (await res.json().catch(() => ({}))) as DashboardResponse;
      if (res.ok && data.ok) {
        applyDashboardData(data);
      }
    } catch {
      setBanner({ kind: "err", text: "Unable to load client leads right now." });
    } finally {
      setLoading(false);
    }
  }, [applyDashboardData]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portal/leads", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json().catch(() => null) : null))
      .then((data: DashboardResponse | null) => {
        if (!cancelled && data?.ok) {
          applyDashboardData(data);
        }
      })
      .catch(() => {
        if (!cancelled) setBanner({ kind: "err", text: "Unable to load client leads right now." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyDashboardData]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        (l.email ?? "").toLowerCase().includes(q) ||
        (l.phone ?? "").includes(q) ||
        l.leadCode.toLowerCase().includes(q)
      );
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? filteredLeads[0] ?? null,
    [leads, filteredLeads, selectedId]
  );

  const selectedComms = useMemo(
    () =>
      selectedLead
        ? comms
            .filter((c) => c.leadId === selectedLead.id)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        : [],
    [comms, selectedLead]
  );

  const selectedLogs = useMemo(
    () =>
      selectedLead
        ? logs.filter((lg) => lg.leadId === selectedLead.id)
        : logs,
    [logs, selectedLead]
  );

  const failedCount = useMemo(
    () => comms.filter((c) => c.status === "failed" && c.direction === "outbound").length,
    [comms]
  );

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    setBusyAction(`status:${leadId}`);
    try {
      const res = await fetch("/api/portal/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ leadId, status }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
        setBanner({ kind: "ok", text: `Lead status updated to ${status}.` });
      }
    } finally {
      setBusyAction(null);
    }
  };

  const runAction = async (
    key: string,
    payload: Record<string, unknown>,
    successMsg: string
  ) => {
    setBusyAction(key);
    setBanner(null);
    try {
      const res = await fetch("/api/portal/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        processed?: number;
        succeeded?: number;
      };
      if (res.ok && data.ok) {
        setBanner({
          kind: "ok",
          text:
            key === "retry_all"
              ? `Processed ${data.processed ?? 0} retry job(s), ${data.succeeded ?? 0} succeeded.`
              : successMsg,
        });
        await fetchData();
      } else {
        setBanner({ kind: "err", text: data.error || "Action failed." });
      }
    } catch {
      setBanner({ kind: "err", text: "Network error while executing action." });
    } finally {
      setBusyAction(null);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !replyMessage.trim()) return;
    await runAction(
      "reply",
      {
        action: "reply",
        leadId: selectedLead.id,
        channel: replyChannel,
        subject: replySubject.trim() || undefined,
        message: replyMessage.trim(),
      },
      `Reply sent via ${replyChannel === "email" ? "Resend Email" : "WhatsApp Cloud API"}.`
    );
    setReplyMessage("");
    setReplySubject("");
  };

  return (
    <div className="mt-6 flex flex-col gap-5">
      {/* Integration Readiness Strip */}
      {integrations && (
        <div className="flex flex-wrap items-center gap-2 border border-white/[0.08] bg-[#050505] px-4 py-2.5 text-[0.6875rem]">
          <span className="font-mono-display text-[0.5625rem] tracking-[0.22em] text-foreground/55 mr-1">
            SYSTEMS:
          </span>
          {[
            { label: "Firestore", ok: integrations.firestoreConfigured },
            { label: "Resend Email", ok: integrations.resendConfigured },
            { label: "WhatsApp API", ok: integrations.whatsappConfigured },
            { label: "Google Sheets", ok: integrations.googleSheetsConfigured },
          ].map((sys) => (
            <span
              key={sys.label}
              className={cn(
                "inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono-display text-[0.5625rem] tracking-[0.16em]",
                sys.ok
                  ? "border-emerald-500/35 bg-emerald-500/[0.06] text-emerald-300"
                  : "border-amber-500/35 bg-amber-500/[0.06] text-amber-300"
              )}
            >
              <span
                className={cn("h-1.5 w-1.5 rounded-full", sys.ok ? "bg-emerald-400" : "bg-amber-400")}
              />
              {sys.label} {sys.ok ? "READY" : "NEEDS ENV"}
            </span>
          ))}
        </div>
      )}

      {storageError && (
        <div className="flex items-start gap-2.5 border border-amber-500/40 bg-amber-500/[0.06] p-3.5 text-[0.8125rem] text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" strokeWidth={1.6} />
          <div>
            <p className="font-medium">Firestore connection required for live leads</p>
            <p className="mt-0.5 text-[0.75rem] text-amber-200/80">{storageError}</p>
          </div>
        </div>
      )}

      {banner && (
        <div
          className={cn(
            "flex items-center justify-between border px-4 py-2.5 text-[0.8125rem]",
            banner.kind === "ok"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/40 bg-rose-500/10 text-rose-200"
          )}
        >
          <span>{banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Total Leads" value={leads.length} />
        <KpiCard label="New Enquiries" value={leads.filter((l) => l.status === "new").length} accent />
        <KpiCard
          label="Qualified / Active"
          value={leads.filter((l) => l.status === "contacted" || l.status === "qualified").length}
        />
        <KpiCard label="Failed Deliveries" value={failedCount} danger={failedCount > 0} />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col gap-3 border border-white/[0.08] bg-[#050505] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, company, code, email..."
              className="w-full border border-white/[0.1] bg-[#0B0B0C] py-2 pl-8 pr-3 text-[0.8125rem] text-foreground placeholder:text-foreground/45 focus:border-amber-500/60 focus:outline-none"
            />
          </div>
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="border border-white/[0.1] bg-[#0B0B0C] px-3 py-2 text-[0.75rem] text-foreground focus:border-amber-500/60 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="archived">Archived</option>
          </select>
          <select
            aria-label="Filter by source"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as LeadSource | "all")}
            className="border border-white/[0.1] bg-[#0B0B0C] px-3 py-2 text-[0.75rem] text-foreground focus:border-amber-500/60 focus:outline-none"
          >
            <option value="all">All Sources</option>
            <option value="website">Website</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/portal/export"
            className="inline-flex items-center gap-1.5 border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-mono-display text-[0.625rem] tracking-[0.18em] text-amber-200 hover:bg-amber-500/20"
          >
            <Download className="h-3.5 w-3.5" />
            EXPORT .XLSX
          </a>
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={() =>
              runAction("sync_sheets", { action: "sync_sheets" }, "Synchronized all records to Google Sheets.")
            }
            className="inline-flex items-center gap-1.5 border border-white/[0.12] bg-[#0B0B0C] px-3 py-2 font-mono-display text-[0.625rem] tracking-[0.18em] text-foreground/85 hover:border-amber-500/50 disabled:opacity-50"
          >
            <Sheet className="h-3.5 w-3.5 text-amber-400" />
            {busyAction === "sync_sheets" ? "SYNCING..." : "SYNC SHEETS"}
          </button>
          <button
            type="button"
            disabled={busyAction !== null || failedCount === 0}
            onClick={() =>
              runAction("retry_all", { action: "retry_all" }, "Retried failed deliveries.")
            }
            className="inline-flex items-center gap-1.5 border border-white/[0.12] bg-[#0B0B0C] px-3 py-2 font-mono-display text-[0.625rem] tracking-[0.18em] text-foreground/85 hover:border-amber-500/50 disabled:opacity-40"
          >
            <RotateCw className="h-3.5 w-3.5 text-amber-400" />
            {busyAction === "retry_all" ? "RETRYING..." : "RETRY FAILED"}
          </button>
          <button
            type="button"
            onClick={fetchData}
            aria-label="Refresh leads"
            className="inline-flex h-8 w-8 items-center justify-center border border-white/[0.12] bg-[#0B0B0C] text-foreground/75 hover:border-amber-500/50 hover:text-amber-300"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Master-Detail View */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Lead List */}
        <div
          data-lenis-prevent
          className="flex max-h-[520px] flex-col gap-2 overflow-y-auto border border-white/[0.08] bg-[#050505] p-2.5 lg:col-span-5"
        >
          {loading && leads.length === 0 ? (
            <p className="py-10 text-center text-[0.8125rem] text-muted-foreground">Loading enquiries…</p>
          ) : filteredLeads.length === 0 ? (
            <p className="py-10 text-center text-[0.8125rem] text-muted-foreground">
              No enquiries match the active filters yet.
            </p>
          ) : (
            filteredLeads.map((l) => {
              const active = selectedLead?.id === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedId(l.id)}
                  className={cn(
                    "flex flex-col items-start gap-1.5 border p-3.5 text-left transition-colors",
                    active
                      ? "border-amber-500/50 bg-amber-500/[0.06]"
                      : "border-white/[0.06] bg-[#0B0B0C] hover:border-white/[0.15]"
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="font-mono-display text-[0.5625rem] tracking-[0.2em] text-amber-400">
                      {l.leadCode} · {l.source.toUpperCase()}
                    </span>
                    <span
                      className={cn(
                        "border px-1.5 py-0.5 font-mono-display text-[0.5rem] tracking-[0.18em]",
                        STATUS_STYLE[l.status]
                      )}
                    >
                      {l.status}
                    </span>
                  </div>
                  <p className="font-sans text-[0.9375rem] font-medium text-foreground">
                    {l.name}
                  </p>
                  <p className="text-[0.75rem] text-muted-foreground">
                    {l.company} · {l.role}
                  </p>
                  <div className="mt-1 flex w-full items-center justify-between text-[0.6875rem] text-foreground/55">
                    <span>{l.whatsappConsent ? "WA Opt-in" : "Email Only"}</span>
                    <span>{formatDate(l.lastContactAt)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Lead Detail + Communication Timeline */}
        <div className="border border-white/[0.08] bg-[#050505] p-4 sm:p-5 lg:col-span-7">
          {!selectedLead ? (
            <div className="flex h-full min-h-[260px] items-center justify-center text-[0.875rem] text-muted-foreground">
              Select a lead to view details, communication history, and delivery status.
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div className="flex flex-col gap-3 border-b border-white/[0.08] pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="font-mono-display text-[0.5625rem] tracking-[0.22em] text-amber-400">
                    {selectedLead.leadCode} · {selectedLead.source.toUpperCase()} · {selectedLead.enquiryCount} ENQUIRY(IES)
                  </span>
                  <h3 className="mt-1 font-sans text-xl font-medium text-foreground">
                    {selectedLead.name}
                  </h3>
                  <p className="text-[0.8125rem] text-muted-foreground">
                    {selectedLead.company} — {selectedLead.role}
                  </p>
                </div>
                <select
                  aria-label="Lead status"
                  disabled={busyAction === `status:${selectedLead.id}`}
                  value={selectedLead.status}
                  onChange={(e) => updateStatus(selectedLead.id, e.target.value as LeadStatus)}
                  className={cn(
                    "border px-3 py-1.5 font-mono-display text-[0.625rem] tracking-[0.18em] bg-[#0B0B0C] focus:outline-none",
                    STATUS_STYLE[selectedLead.status]
                  )}
                >
                  <option value="new">NEW</option>
                  <option value="contacted">CONTACTED</option>
                  <option value="qualified">QUALIFIED</option>
                  <option value="archived">ARCHIVED</option>
                </select>
              </div>

              {/* Contact Metadata & Delivery Matrix */}
              <div className="grid grid-cols-1 gap-3 text-[0.8125rem] sm:grid-cols-2">
                <div className="border border-white/[0.06] bg-[#0B0B0C] p-3">
                  <p className="font-mono-display text-[0.5625rem] tracking-[0.2em] text-foreground/55">
                    CLIENT DETAILS
                  </p>
                  <p className="mt-1.5 text-foreground/90">Email: {selectedLead.email || "—"}</p>
                  <p className="mt-1 text-foreground/90">Phone: {formatPhone(selectedLead.phone)}</p>
                  <p className="mt-1 text-foreground/75">
                    WhatsApp Consent:{" "}
                    <span className={selectedLead.whatsappConsent ? "text-emerald-300" : "text-foreground/55"}>
                      {selectedLead.whatsappConsent ? `Yes (${selectedLead.consentSource})` : "No"}
                    </span>
                  </p>
                  <p className="mt-1 text-foreground/75">
                    Sheets Sync: <span className="text-amber-300">{selectedLead.syncStatus.sheets}</span>
                  </p>
                </div>

                <div className="border border-white/[0.06] bg-[#0B0B0C] p-3">
                  <p className="font-mono-display text-[0.5625rem] tracking-[0.2em] text-foreground/55">
                    AUTOMATED DISPATCH STATUS
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 text-[0.6875rem]">
                    <StatusPill label="Client Email" status={selectedLead.deliverySummary.clientEmail} />
                    <StatusPill label="Client WA" status={selectedLead.deliverySummary.clientWhatsapp} />
                    <StatusPill label="P1 Email" status={selectedLead.deliverySummary.partner1Email} />
                    <StatusPill label="P1 WA" status={selectedLead.deliverySummary.partner1Whatsapp} />
                    <StatusPill label="P2 Email" status={selectedLead.deliverySummary.partner2Email} />
                    <StatusPill label="P2 WA" status={selectedLead.deliverySummary.partner2Whatsapp} />
                  </div>
                </div>
              </div>

              {/* Quick Reply Composer */}
              <form onSubmit={sendReply} className="border border-white/[0.08] bg-[#0B0B0C] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono-display text-[0.5625rem] tracking-[0.2em] text-amber-400">
                    SEND DIRECT REPLY
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={!selectedLead.email}
                      onClick={() => setReplyChannel("email")}
                      className={cn(
                        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.6875rem] disabled:opacity-40",
                        replyChannel === "email"
                          ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                          : "border-white/10 text-foreground/65"
                      )}
                    >
                      <Mail className="h-3 w-3" /> Email
                    </button>
                    <button
                      type="button"
                      disabled={!selectedLead.phone || !selectedLead.whatsappConsent}
                      onClick={() => setReplyChannel("whatsapp")}
                      className={cn(
                        "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.6875rem] disabled:opacity-40",
                        replyChannel === "whatsapp"
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                          : "border-white/10 text-foreground/65"
                      )}
                    >
                      <MessageSquare className="h-3 w-3" /> WhatsApp
                    </button>
                  </div>
                </div>
                {replyChannel === "email" && (
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    placeholder={`Subject (default: Re: Serial Exit Enquiry (${selectedLead.leadCode}))`}
                    className="mt-2.5 w-full border border-white/[0.1] bg-[#050505] px-3 py-2 text-[0.8125rem] text-foreground placeholder:text-foreground/45 focus:border-amber-500/60 focus:outline-none"
                  />
                )}
                <textarea
                  rows={2}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={
                    replyChannel === "email"
                      ? "Write confidential email response..."
                      : "Write WhatsApp message (uses 24h session if active, else approved template)..."
                  }
                  className="mt-2 w-full resize-none border border-white/[0.1] bg-[#050505] px-3 py-2 text-[0.8125rem] text-foreground placeholder:text-foreground/45 focus:border-amber-500/60 focus:outline-none"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={busyAction === "reply" || !replyMessage.trim()}
                    className="inline-flex items-center gap-1.5 bg-amber-500 px-3.5 py-1.5 text-[0.75rem] font-medium text-[#050505] hover:bg-amber-400 disabled:opacity-40"
                  >
                    <Send className="h-3 w-3" />
                    {busyAction === "reply" ? "Sending..." : "Send"}
                  </button>
                </div>
              </form>

              {/* History Tabs */}
              <div>
                <div className="flex gap-4 border-b border-white/[0.08] text-[0.75rem]">
                  <button
                    type="button"
                    onClick={() => setDetailTab("comms")}
                    className={cn(
                      "border-b-2 pb-2 font-mono-display text-[0.625rem] tracking-[0.2em]",
                      detailTab === "comms"
                        ? "border-amber-500 text-amber-300"
                        : "border-transparent text-foreground/60 hover:text-foreground"
                    )}
                  >
                    COMMUNICATION LOG ({selectedComms.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailTab("logs")}
                    className={cn(
                      "border-b-2 pb-2 font-mono-display text-[0.625rem] tracking-[0.2em]",
                      detailTab === "logs"
                        ? "border-amber-500 text-amber-300"
                        : "border-transparent text-foreground/60 hover:text-foreground"
                    )}
                  >
                    AUTOMATION LOGS ({selectedLogs.length})
                  </button>
                </div>

                <div data-lenis-prevent className="mt-3 flex max-h-[240px] flex-col gap-2 overflow-y-auto pr-1">
                  {detailTab === "comms" ? (
                    selectedComms.length === 0 ? (
                      <p className="py-4 text-[0.8125rem] text-muted-foreground">No communication entries recorded yet.</p>
                    ) : (
                      selectedComms.map((c) => (
                        <div key={c.id} className="border border-white/[0.06] bg-[#0B0B0C] p-3 text-[0.8125rem]">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono-display text-[0.5625rem] tracking-[0.18em] text-foreground/75">
                              {c.direction.toUpperCase()} · {c.channel.toUpperCase()} · {c.recipientType.toUpperCase()} ({c.recipient})
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "border px-1.5 py-0.5 font-mono-display text-[0.5rem] tracking-[0.15em]",
                                  DELIVERY_STYLE[c.status]
                                )}
                              >
                                {c.status}
                              </span>
                              {c.status === "failed" && c.retryPayload && (
                                <button
                                  type="button"
                                  disabled={busyAction === `retry:${c.id}`}
                                  onClick={() =>
                                    runAction(
                                      `retry:${c.id}`,
                                      { action: "retry", commId: c.id },
                                      "Retried message delivery."
                                    )
                                  }
                                  className="inline-flex items-center gap-1 border border-amber-500/40 px-2 py-0.5 font-mono-display text-[0.5rem] tracking-[0.16em] text-amber-300 hover:bg-amber-500/10"
                                >
                                  <RotateCw className="h-2.5 w-2.5" /> RETRY
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="mt-1.5 text-[0.75rem] text-amber-200/85">{c.templateOrSubject}</p>
                          <p className="mt-1 whitespace-pre-wrap text-[0.75rem] leading-relaxed text-foreground/75">
                            {c.content}
                          </p>
                          {c.error && (
                            <p className="mt-1.5 text-[0.6875rem] text-rose-300">Error: {c.error}</p>
                          )}
                          <p className="mt-1.5 text-[0.625rem] text-foreground/45">
                            {formatDate(c.createdAt)} · Attempts: {c.attempts}/{c.maxAttempts}
                          </p>
                        </div>
                      ))
                    )
                  ) : selectedLogs.length === 0 ? (
                    <p className="py-4 text-[0.8125rem] text-muted-foreground">No automation logs yet.</p>
                  ) : (
                    selectedLogs.map((lg) => (
                      <div key={lg.id} className="flex items-start justify-between gap-3 border border-white/[0.06] bg-[#0B0B0C] p-2.5 text-[0.75rem]">
                        <div className="flex items-start gap-2">
                          {lg.status === "ok" ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          ) : lg.status === "error" ? (
                            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                          ) : (
                            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/45" />
                          )}
                          <div>
                            <p className="font-mono-display text-[0.5625rem] tracking-[0.18em] text-foreground/80">
                              {lg.event}
                            </p>
                            <p className="mt-0.5 text-foreground/70">{lg.detail}</p>
                          </div>
                        </div>
                        <span className="shrink-0 text-[0.625rem] text-foreground/45">{formatDate(lg.createdAt)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: number;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="border border-white/[0.08] bg-[#050505] p-3.5">
      <p className="font-mono-display text-[0.5625rem] tracking-[0.2em] text-foreground/55">{label}</p>
      <p
        className={cn(
          "mt-1 font-sans text-2xl font-medium",
          danger ? "text-rose-300" : accent ? "text-amber-300" : "text-foreground"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function StatusPill({ label, status }: { label: string; status: DeliveryStatus }) {
  return (
    <div className={cn("flex items-center justify-between border px-2 py-1", DELIVERY_STYLE[status])}>
      <span className="truncate text-[0.625rem]">{label}</span>
      <span className="font-mono-display text-[0.5rem] uppercase">{status.replace("skipped_", "")}</span>
    </div>
  );
}
