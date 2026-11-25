import { Radio, ShieldAlert, UserCheck } from "lucide-react";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { GlassCard } from "./glass-card";

const DIFFERENTIATORS = [
  {
    n: "01",
    icon: Radio,
    norm: "Public Platforms",
    normDesc: "Open listing boards, mass distribution of teasers, commoditised broker outreach.",
    standard: "Serial Exit Standard",
    standardTitle: "Bilateral Discretion",
    standardDesc: "Zero public listings. Opportunities are matched and introduced 1-to-1 under bilateral confidentiality frameworks.",
  },
  {
    n: "02",
    icon: ShieldAlert,
    norm: "Standard Deal Flow",
    normDesc: "Opportunities sourced through public auction processes after market awareness is already established.",
    standard: "Serial Exit Standard",
    standardTitle: "Proprietary Origination",
    standardDesc: "Direct relationships with founders and promoters before mandates transition to public intermediaries.",
  },
  {
    n: "03",
    icon: UserCheck,
    norm: "Unqualified Listings",
    normDesc: "Unverified seller intent, speculative price expectations, and fragmented mandate authority.",
    standard: "Serial Exit Standard",
    standardTitle: "Pre-Verified Qualification",
    standardDesc: "Every transaction is pre-vetted for verified commercial readiness, seller intent, and realistic valuation parameters.",
  },
] as const;

/**
 * WhySerialExit — 3 institutional differentiators comparing the Serial Exit
 * standard against traditional public listing platforms.
 */
export function WhySerialExit() {
  return (
    <SectionShell id="why-serial-exit" className="border-t border-white/[0.06] bg-[#070708]">
      <SectionHeading
        index="03"
        eyebrow="The Institutional Advantage"
        title="Why Serial Exit vs. Public Listing Networks"
        intro="Traditional platforms treat M&A like retail marketplaces. Serial Exit operates on an institutional bilateral origination standard designed to protect enterprise value."
      />

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-16 lg:gap-6">
        {DIFFERENTIATORS.map((d, i) => {
          const Icon = d.icon;
          return (
            <Reveal key={d.n} delay={i * 0.08}>
              <GlassCard className="group flex h-full flex-col justify-between p-6 sm:p-7">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xs border border-white/10 bg-white/[0.02] text-amber-400">
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.5} />
                    </div>
                    <span className="font-mono-display text-[0.6875rem] tracking-[0.25em] text-amber-500">
                      {d.n}
                    </span>
                  </div>

                  {/* Serial Exit standard (prominent) */}
                  <div className="mt-6">
                    <span className="font-mono-display text-[0.625rem] tracking-[0.25em] text-amber-400">
                      {d.standard}
                    </span>
                    <h3 className="mt-1 font-sans text-xl font-medium tracking-tight text-foreground sm:text-2xl">
                      {d.standardTitle}
                    </h3>
                    <p className="mt-2 text-[0.875rem] leading-relaxed text-muted-foreground">
                      {d.standardDesc}
                    </p>
                  </div>
                </div>

                {/* Contrast with the industry norm */}
                <div className="mt-6 border-t border-white/[0.06] pt-4">
                  <span className="font-mono-display text-[0.625rem] tracking-[0.2em] text-foreground/50">
                    The Industry Norm ({d.norm})
                  </span>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground/80">
                    {d.normDesc}
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
