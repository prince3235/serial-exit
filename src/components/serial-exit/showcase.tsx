"use client";

import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { showcase } from "@/content/site";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { Button } from "./button";

/**
 * Showcase (Verified Opportunities) — "Confidential Dossier" style cards.
 * Reference IDs, redaction bar aesthetic, "NDA Required" classification,
 * single Verified indicator, labels >= 11px, and access request CTA.
 */
export function Showcase() {
  return (
    <SectionShell id="showcase" className="border-t border-white/[0.06] bg-[#0B0B0C]">
      <SectionHeading
        index={showcase.index}
        eyebrow={showcase.eyebrow}
        title={showcase.title}
        intro={showcase.intro}
      />

      <div className="mt-12 lg:mt-16">
        {/* Dossier status bar */}
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2 font-mono-display text-[0.6875rem] tracking-[0.25em] text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              <span>CLASSIFIED MANDATE REPOSITORY</span>
            </div>
            <span className="font-mono-display text-[0.6875rem] tracking-[0.25em] text-brass/80">
              OFF-MARKET · BILATERAL NDA · PRE-VETTED
            </span>
          </div>
        </Reveal>

        {/* 2x2 Dossier Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
          {showcase.cards.map((card, i) => (
            <Reveal key={card.sector} delay={i * 0.08}>
              <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-md border border-white/[0.12] bg-[#0E0E10] transition-colors duration-500 hover:border-amber-500/50 hover:bg-[#121214]">
                {/* Thin paper-like dossier header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-display text-[0.6875rem] font-medium tracking-[0.25em] text-amber-400">
                      {(card as { refId?: string }).refId ?? `SE-0${i + 1}42`}
                    </span>
                    <span className="hidden text-[0.6875rem] text-muted-foreground/60 sm:inline">·</span>
                    <span className="hidden font-mono-display text-[0.6875rem] tracking-[0.2em] text-muted-foreground sm:inline">
                      ILLUSTRATIVE DOSSIER 0{i + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* "NDA Required" tag */}
                    <span className="inline-flex items-center gap-1 border border-white/10 bg-black/40 px-2 py-0.5 font-mono-display text-[0.625rem] tracking-[0.18em] text-foreground/80 sm:px-2.5 sm:text-[0.6875rem] sm:tracking-[0.2em]">
                      <Lock className="h-2.5 w-2.5 text-amber-400" />
                      NDA REQUIRED
                    </span>
                  </div>
                </div>

                {/* Dossier Body */}
                <div className="p-5 sm:p-6">
                  {/* Single Verified indicator + Sector */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-sans text-lg font-medium tracking-[-0.01em] text-foreground sm:text-xl">
                        {card.sector}
                      </h3>
                      {/* Redaction bar with subtle transform shimmer */}
                      <div className="mt-2.5 flex items-center gap-2" aria-label="Target name redacted">
                        <span className="relative h-3.5 w-32 overflow-hidden rounded-xs bg-white/15">
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-full"
                          />
                        </span>
                        <span className="font-mono-display text-[0.6875rem] tracking-[0.2em] text-muted-foreground/75">
                          [REDACTED]
                        </span>
                      </div>
                    </div>

                    {/* Single Verified Badge per card */}
                    <span className="inline-flex shrink-0 items-center gap-1.5 border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono-display text-[0.6875rem] tracking-[0.2em] text-amber-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                      VERIFIED
                    </span>
                  </div>

                  {/* Mandate specifications in responsive grid */}
                  <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/[0.06] pt-4 sm:grid-cols-3">
                    <DataRow label="Target Size" value={card.size} />
                    <DataRow label="Geography" value={card.location} />
                    <DataRow label="Structure" value={card.transaction} />
                  </dl>
                </div>

                {/* Dossier Footer / Action prompt */}
                <div className="flex items-center justify-between border-t border-white/[0.06] bg-black/25 px-5 py-3">
                  <span className="font-mono-display text-[0.6875rem] tracking-[0.2em] text-muted-foreground">
                    CONFIDENTIALITY: LEVEL 3 STRICT
                  </span>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1 text-[0.75rem] font-medium text-amber-300 transition-colors hover:text-amber-200"
                  >
                    <span>Request Brief</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Illustrative disclaimer */}
        <Reveal delay={0.1}>
          <p className="mt-5 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass/70" aria-hidden="true" />
            {showcase.disclaimer}
          </p>
        </Reveal>

        {/* CTA Banner below grid: Request access to live deal flow */}
        <Reveal delay={0.16} className="mt-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-md border border-white/[0.1] bg-[#0E0E10] p-6 sm:flex-row sm:items-center sm:p-7">
            <div className="max-w-xl">
              <h3 className="font-sans text-base font-medium text-foreground sm:text-lg">
                Request Access to Live Off-Market Deal Flow
              </h3>
              <p className="mt-1 text-[0.875rem] leading-relaxed text-muted-foreground">
                Active opportunities are never published. Introductions and full dossiers are shared exclusively with verified partners under bilateral NDA.
              </p>
            </div>
            <Button href="#contact" size="md" withArrow className="shrink-0">
              Request access to live deal flow
            </Button>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono-display text-[0.6875rem] tracking-[0.22em] text-foreground/60">{label}</dt>
      <dd className="mt-1 font-sans text-[0.875rem] font-medium text-foreground/90">{value}</dd>
    </div>
  );
}
