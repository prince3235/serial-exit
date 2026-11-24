"use client";

import { Check, Minus } from "lucide-react";
import { comparison } from "@/content/site";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

/**
 * Comparison — minimal dark comparison table with hairline rows.
 * Left column: public listing platforms (with minus marks). Right column:
 * Serial Exit (with amber check marks). Responsive: stacks on mobile.
 */
export function Comparison() {
  const maxRows = Math.max(comparison.left.rows.length, comparison.right.rows.length);

  return (
    <SectionShell id="comparison" className="border-t border-white/[0.06] bg-[#050505]">
      <SectionHeading
        index={comparison.index}
        eyebrow={comparison.eyebrow}
        title={comparison.title}
      />

      <Reveal delay={0.1} className="mt-14 lg:mt-20">
        <div className="overflow-hidden border border-white/[0.08]">
          {/* Header row */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="border-b border-white/[0.08] border-r-0 px-6 py-6 sm:border-r sm:px-8 sm:py-8">
              <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-foreground/65">
                01 · The Norm
              </span>
              <h3 className="mt-2 font-sans text-xl font-medium tracking-[-0.01em] text-foreground/70 sm:text-2xl">
                {comparison.left.label}
              </h3>
            </div>
            <div className="relative border-b border-white/[0.08] bg-amber-500/[0.025] px-6 py-6 sm:px-8 sm:py-8">
              <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-400">
                02 · The Standard
              </span>
              <h3 className="mt-2 font-sans text-xl font-medium tracking-[-0.01em] text-amber-200 sm:text-2xl">
                {comparison.right.label}
              </h3>
              {/* amber edge */}
              <span className="pointer-events-none absolute inset-0 border border-amber-500/30" />
            </div>
          </div>

          {/* Body rows */}
          <div className="flex flex-col">
            {Array.from({ length: maxRows }).map((_, i) => {
              const left = comparison.left.rows[i];
              const right = comparison.right.rows[i];
              return (
                <div
                  key={i}
                  className="grid grid-cols-1 border-b border-white/[0.06] last:border-b-0 sm:grid-cols-2"
                >
                  <div className="flex items-start gap-3 px-6 py-5 sm:border-r sm:border-white/[0.06] sm:px-8 sm:py-6">
                    <Minus className="mt-0.5 h-4 w-4 shrink-0 text-foreground/65" strokeWidth={1.5} />
                    <span className="text-[0.875rem] leading-relaxed text-foreground/65 sm:text-[0.9375rem]">
                      {left}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 bg-amber-500/[0.015] px-6 py-5 sm:px-8 sm:py-6">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" strokeWidth={2} />
                    <span className="text-[0.875rem] leading-relaxed text-foreground sm:text-[0.9375rem]">
                      {right}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
