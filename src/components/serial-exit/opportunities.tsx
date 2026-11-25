"use client";

import { Building2, TrendingUp, Coins, Scale, Handshake } from "lucide-react";
import { opportunities } from "@/content/site";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

const ICONS = {
  Building2,
  TrendingUp,
  Coins,
  Scale,
  Handshake,
} as const;

/**
 * Opportunities — five dark glass cards for the transaction types.
 * Each card features a domain icon, mono index, aligned baseline title,
 * transaction scope description, and a "Typical for" institutional profile.
 * Bento grid: card 1 spans 4 cols on lg, cards 2-5 span 2 cols each.
 */
export function Opportunities() {
  return (
    <SectionShell id="opportunities" className="border-t border-white/[0.06] bg-[#050505]">
      <SectionHeading
        index={opportunities.index}
        eyebrow={opportunities.eyebrow}
        title={opportunities.title}
        intro={opportunities.intro}
      />

      <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 lg:mt-16 lg:grid-cols-6 lg:gap-6">
        {opportunities.items.map((item, i) => {
          const wide = i === 0;
          const IconComponent = ICONS[item.icon as keyof typeof ICONS] ?? Building2;

          return (
            <Reveal
              key={item.n}
              delay={i * 0.07}
              className={cn(wide ? "lg:col-span-4" : "lg:col-span-2")}
            >
              <GlassCard className="group flex h-full min-h-[240px] flex-col justify-between p-6 sm:p-7">
                {/* Top header: glyph icon + index + interactive amber hairline */}
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xs border border-white/[0.1] bg-white/[0.03] text-amber-400 transition-colors duration-500 group-hover:border-amber-500/50 group-hover:text-amber-300">
                        <IconComponent className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <span className="font-mono-display text-[0.6875rem] tracking-[0.28em] text-amber-500">
                        {item.n}
                      </span>
                    </div>
                    <span className="h-px w-10 bg-white/10 transition-all duration-500 group-hover:w-16 group-hover:bg-amber-500/50" />
                  </div>

                  {/* Title with strictly aligned baselines */}
                  <div className="mt-6">
                    <h3 className="font-sans text-xl font-medium tracking-[-0.01em] text-foreground sm:text-2xl">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-[0.875rem] leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom line: "Typical for: ..." institutional qualification */}
                <div className="mt-6 border-t border-white/[0.06] pt-3.5">
                  <p className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
                    <span className="shrink-0 font-mono-display text-[0.6875rem] tracking-[0.2em] text-amber-400">
                      Typical for:
                    </span>
                    <span className="text-[0.8125rem] leading-snug text-foreground/75">
                      {(item as { typicalFor?: string }).typicalFor}
                    </span>
                  </p>
                </div>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
