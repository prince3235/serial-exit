"use client";

import { showcase } from "@/content/site";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { GlassCard } from "./glass-card";
import { VerifiedSeal } from "./verified-seal";

/**
 * Showcase (Verified Opportunities) — clean 2x2 architectural grid of
 * illustrative verified off-market deal sheets. No side image bar; keeps
 * focus on deal clarity, verification status, and institutional restraint.
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
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <p className="font-mono-display text-[0.625rem] tracking-[0.3em] text-foreground/70">
              Illustrative Deal Sheet
            </p>
            <span className="font-mono-display text-[0.5625rem] tracking-[0.28em] text-brass/80">
              Verified · Off-Market · Confidential
            </span>
          </div>
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
          {showcase.cards.map((card, i) => (
            <Reveal key={card.sector} delay={i * 0.08}>
              <GlassCard className="group relative flex h-full flex-col justify-between p-6 sm:p-7">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">
                          0{i + 1}
                        </span>
                        <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-foreground/65">
                          Verified
                        </span>
                      </div>
                      <h3 className="mt-2 font-sans text-lg font-medium tracking-[-0.01em] text-foreground sm:text-xl">
                        {card.sector}
                      </h3>
                    </div>
                    <VerifiedSeal size={36} label="Verified" />
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/[0.06] pt-4 sm:grid-cols-3">
                    <DataRow label="Deal Size" value={card.size} />
                    <DataRow label="Location" value={card.location} />
                    <DataRow label="Transaction" value={card.transaction} />
                  </dl>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-4">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                    <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-400">
                      Status · {card.status}
                    </span>
                  </div>
                  <span className="h-px w-8 bg-white/10 transition-all duration-500 group-hover:w-14 group-hover:bg-amber-500/50" />
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 flex items-start gap-2 text-[0.75rem] leading-relaxed text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brass/70" aria-hidden="true" />
            {showcase.disclaimer}
          </p>
        </Reveal>
      </div>
    </SectionShell>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono-display text-[0.5625rem] tracking-[0.25em] text-foreground/65">{label}</dt>
      <dd className="mt-1 text-[0.875rem] text-foreground/90">{value}</dd>
    </div>
  );
}
