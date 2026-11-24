"use client";

import { opportunities } from "@/content/site";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { GlassCard } from "./glass-card";
import { cn } from "@/lib/utils";

/**
 * Opportunities — five dark glass cards for the transaction types.
 * Each has a mono index, title, one-line description, and amber edge-light
 * on hover. Layout: single column on mobile, 2-col on sm, 3-col on lg with
 * the first card spanning wider for visual rhythm.
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

      <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-5 lg:mt-20 lg:grid-cols-6 lg:gap-6">
        {opportunities.items.map((item, i) => {
          // On large screens, arrange as: card 1 spans 4 cols (wide hero card),
          // cards 2–5 span 2 cols each forming a 2x2 + 1 row pattern.
          const wide = i === 0;
          return (
            <Reveal
              key={item.n}
              delay={i * 0.08}
              className={cn(
                wide ? "lg:col-span-4" : "lg:col-span-2"
              )}
            >
              <GlassCard className="group flex h-full min-h-[220px] flex-col justify-between p-6 sm:p-7 lg:p-8">
                {/* Top: index + hairline */}
                <div className="flex items-start justify-between">
                  <span className="font-mono-display text-[0.6875rem] tracking-[0.28em] text-amber-500">
                    {item.n}
                  </span>
                  <span className="h-px w-10 bg-white/10 transition-all duration-500 group-hover:w-16 group-hover:bg-amber-500/50" />
                </div>

                {/* Title + desc */}
                <div className="mt-10">
                  <h3 className="font-sans text-xl font-medium tracking-[-0.01em] text-foreground sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-muted-foreground">
                    {item.desc}
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
