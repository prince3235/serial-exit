/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck — dormant: not mounted on the public site (portal launch deferred)
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lock, X, ShieldCheck, Building2, TrendingUp, Banknote, Handshake, Users, Briefcase, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/provider";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { VerifiedSeal } from "./verified-seal";
import { Button } from "./button";
import { ClientDashboard } from "./client-dashboard";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Shape returned by /api/portal (mirrors src/content/portal-cases.ts, which stays server-side). */
type PortalCase = {
  icon: "building" | "trending" | "banknote" | "handshake";
  sector: string;
  size: string;
  location: string;
  structure: string;
  status: string;
  blurb: string;
};

const ICONS: Record<PortalCase["icon"], LucideIcon> = {
  building: Building2,
  trending: TrendingUp,
  banknote: Banknote,
  handshake: Handshake,
};

type Failure = "wrong" | "unavailable" | "rate" | "network" | null;

/**
 * PartnerPortal — gated overlay with an illustrative preview of the deal-flow
 * profile shared with verified partners.
 *
 * The gate is SERVER-SIDE: the access key is checked by POST /api/portal
 * (env PORTAL_ACCESS_KEY, timing-safe, rate-limited) which sets a signed
 * httpOnly session cookie. The case-study content is only returned by the
 * server after that check, so it never ships in the public JS bundle.
 */
export function PartnerPortal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const [cases, setCases] = useState<PortalCase[] | null>(null);
  const [key, setKey] = useState("");
  const [failure, setFailure] = useState<Failure>(null);
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(dialogRef, open, onClose, inputRef);

  // Restore an existing server session (cookie) when the portal opens.
  useEffect(() => {
    if (!open || cases) return;
    let cancelled = false;
    fetch("/api/portal", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.ok) setCases(d.cases);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [open, cases]);

  const tryUnlock = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (busy || !key.trim()) return;
      setBusy(true);
      setFailure(null);
      try {
        const res = await fetch("/api/portal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ key }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          setCases(data.cases);
          setKey("");
        } else if (res.status === 503) setFailure("unavailable");
        else if (res.status === 429) setFailure("rate");
        else setFailure("wrong");
      } catch {
        setFailure("network");
      } finally {
        setBusy(false);
      }
    },
    [busy, key]
  );

  const lock = useCallback(() => {
    setCases(null);
    setKey("");
    fetch("/api/portal", { method: "DELETE", credentials: "same-origin" }).catch(() => undefined);
  }, []);

  const message =
    failure === "wrong"
      ? t.portal.wrongKey
      : failure === "unavailable"
        ? t.portal.unavailable
        : failure === "rate"
          ? t.portal.tooMany
          : failure === "network"
            ? t.portal.unavailable
            : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          data-lenis-prevent
          role="dialog"
          aria-modal="true"
          aria-label={t.portal.eyebrow}
          className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-[#050505]/95 p-4 backdrop-blur-md sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <motion.div
            className="relative my-auto w-full max-w-6xl border border-white/[0.08] bg-[#0B0B0C] p-6 sm:p-10 lg:p-12"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t.portal.back}
              className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center text-foreground/70 hover:text-amber-300 sm:right-6 sm:top-6"
            >
              <X className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
            </button>

            {/* corner brackets */}
            <span aria-hidden="true" className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-amber-500/50 sm:left-6 sm:top-6" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-4 left-4 h-3 w-3 border-b border-l border-amber-500/50 sm:bottom-6 sm:left-6" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-4 right-4 h-3 w-3 border-b border-r border-amber-500/50 sm:bottom-6 sm:right-6" />

            {!cases ? (
              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/[0.06]">
                  <Lock className="h-6 w-6 text-amber-400" strokeWidth={1.4} aria-hidden="true" />
                </span>
                <span className="mt-6 font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">{t.portal.eyebrow}</span>
                <h2 className="mt-3 font-sans text-2xl font-medium tracking-[-0.01em] text-foreground sm:text-3xl">{t.portal.title}</h2>
                <p className="mt-3 text-[0.875rem] leading-relaxed text-muted-foreground">{t.portal.intro}</p>

                <form onSubmit={tryUnlock} className="mt-8 w-full text-left" noValidate>
                  <label htmlFor="portal-key" className="font-mono-display text-[0.625rem] tracking-[0.25em] text-foreground/70">
                    {t.portal.enterPassword}
                  </label>
                  <input
                    id="portal-key"
                    ref={inputRef}
                    type="password"
                    autoComplete="off"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder={t.portal.passwordPlaceholder}
                    aria-invalid={failure === "wrong"}
                    aria-describedby={message ? "portal-error" : undefined}
                    className="mt-2 w-full border border-white/[0.14] bg-[#050505] px-4 py-3.5 text-[0.9375rem] text-foreground placeholder:text-foreground/65 focus:border-amber-500/70 focus:outline-none"
                  />
                  <p id="portal-error" role="alert" className="mt-2 min-h-5 text-[0.75rem] text-amber-300">
                    {message}
                  </p>
                  <Button type="submit" size="lg" className="mt-3 w-full" magnetic={false} withArrow>
                    {busy ? t.portal.checking : t.portal.unlock}
                  </Button>
                  <p className="mt-4 text-center font-mono-display text-[0.5625rem] tracking-[0.25em] text-foreground/60">{t.portal.hint}</p>
                </form>
              </div>
            ) : (
              <Unlocked t={t} cases={cases} onLock={lock} onClose={onClose} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Unlocked({
  t,
  cases,
  onLock,
  onClose,
}: {
  t: ReturnType<typeof useI18n>["t"];
  cases: PortalCase[];
  onLock: () => void;
  onClose: () => void;
}) {
  const [view, setView] = useState<"enquiries" | "mandates">("enquiries");

  return (
    <div>
      <div className="flex flex-col gap-4 pr-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">{t.portal.eyebrow}</span>
          <h2 className="mt-3 font-sans text-2xl font-medium tracking-[-0.01em] text-foreground sm:text-3xl">
            {view === "enquiries" ? "Client Enquiries & Communication" : t.portal.title}
          </h2>
          <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-muted-foreground">
            {view === "enquiries"
              ? "Manage incoming website and WhatsApp enquiries, automated client welcomes, partner alerts, and Google Sheets sync."
              : t.portal.intro}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 border border-amber-500/40 bg-amber-500/[0.06] px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" strokeWidth={1.6} aria-hidden="true" />
            <span className="font-mono-display text-[0.5625rem] tracking-[0.25em] text-amber-300">Access Granted</span>
          </span>
          <button type="button" onClick={onLock} className="inline-flex min-h-11 items-center gap-2 text-[0.8125rem] text-foreground/70 hover:text-amber-300">
            <Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
            {t.portal.logout}
          </button>
        </div>
      </div>

      {/* Portal Section Switcher */}
      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-4">
        <button
          type="button"
          onClick={() => setView("enquiries")}
          className={cn(
            "inline-flex items-center gap-2 border px-4 py-2 font-mono-display text-[0.625rem] tracking-[0.2em] transition-colors",
            view === "enquiries"
              ? "border-amber-500/60 bg-amber-500/10 text-amber-200"
              : "border-white/10 text-foreground/70 hover:border-white/25 hover:text-foreground"
          )}
        >
          <Users className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          CLIENT MANAGEMENT
        </button>
        <button
          type="button"
          onClick={() => setView("mandates")}
          className={cn(
            "inline-flex items-center gap-2 border px-4 py-2 font-mono-display text-[0.625rem] tracking-[0.2em] transition-colors",
            view === "mandates"
              ? "border-amber-500/60 bg-amber-500/10 text-amber-200"
              : "border-white/10 text-foreground/70 hover:border-white/25 hover:text-foreground"
          )}
        >
          <Briefcase className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
          {t.portal.caseStudiesTitle}
        </button>
      </div>

      {view === "enquiries" ? (
        <ClientDashboard />
      ) : (
        <>
          <div className="mt-8 flex items-center gap-3">
            <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-foreground/60">{t.portal.caseStudiesTitle}</span>
            <span className="h-px flex-1 bg-white/[0.08]" />
            <VerifiedSeal size={28} label="Verified" />
          </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cases.map((c, i) => {
          const Icon = ICONS[c.icon] ?? Building2;
          return (
            <motion.article
              key={c.sector}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              className="glass-dark glass-dark-hover relative p-6"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center border border-amber-500/30 bg-amber-500/[0.06] text-amber-400">
                  <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="font-mono-display text-[0.5625rem] tracking-[0.25em] text-amber-400">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-sans text-base font-medium tracking-[-0.01em] text-foreground">{c.sector}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">{c.blurb}</p>
              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/[0.08] pt-4">
                {(
                  [
                    ["Size", c.size],
                    ["Location", c.location],
                    ["Structure", c.structure],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono-display text-[0.5625rem] tracking-[0.25em] text-foreground/60">{k}</dt>
                    <dd className="mt-1 text-[0.8125rem] text-foreground/90">{v}</dd>
                  </div>
                ))}
                <div>
                  <dt className="font-mono-display text-[0.5625rem] tracking-[0.25em] text-foreground/60">Status</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-amber-300">
                    <span className="h-1 w-1 rounded-full bg-amber-500" aria-hidden="true" />
                    {c.status}
                  </dd>
                </div>
              </dl>
            </motion.article>
          );
        })}
      </div>

      <p className="mt-6 flex items-start gap-2 text-[0.75rem] leading-relaxed text-muted-foreground">
        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-500/60" aria-hidden="true" />
        {t.portal.caseStudiesNote}
      </p>
        </>
      )}

      <div className="mt-8 border-t border-white/[0.08] pt-6">
        <Button href="#contact" size="md" withArrow onClick={onClose}>
          {t.nav.cta}
        </Button>
      </div>
    </div>
  );
}
