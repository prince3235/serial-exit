"use client";

import { useI18n } from "@/i18n/provider";
import { Reveal } from "./reveal";
import { Button } from "./button";

/**
 * CtaBand — high-impact pre-contact institutional conversion banner with
 * dual-audience triggers and the signature .se-ornament divider motif.
 */
export function CtaBand() {
  const { t } = useI18n();

  return (
    <section aria-label="Direct Mandate Initiation" className="relative border-t border-white/[0.08] bg-[#070708] py-16 sm:py-20 lg:py-24">
      <span aria-hidden="true" className="se-ornament" />
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 rounded-lg border border-white/[0.1] bg-[#0E0E10] p-8 sm:p-12 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="font-mono-display text-[0.6875rem] font-semibold tracking-[0.28em] text-amber-400">
                {t.ctaBand.eyebrow}
              </span>
              <h2 className="mt-3 font-sans text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {t.ctaBand.title}
              </h2>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground sm:text-base">
                {t.ctaBand.intro}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="#contact?tab=partner" size="lg" withArrow>
                {t.ctaBand.ctaPrimary}
              </Button>
              <Button href="#contact?tab=owner" variant="ghost" size="lg">
                {t.ctaBand.ctaSecondary}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
