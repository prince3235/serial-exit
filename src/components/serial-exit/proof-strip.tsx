import { Reveal } from "./reveal";

const PROOF_POINTS = [
  {
    kpi: "5",
    label: "Transaction Types",
    detail: "M&A, Acquisitions, Growth Capital, Structured Debt & Strategic Partnerships",
  },
  {
    kpi: "100%",
    label: "Off-Market",
    detail: "Direct founder & sponsor mandates prior to public dissemination",
  },
  {
    kpi: "Pan-India",
    label: "Coverage",
    detail: "Active origination across core industrial & high-growth economic hubs",
  },
  {
    kpi: "1-to-1",
    label: "Verified Introductions",
    detail: "Curated bilateral counterparties under strict NDA protocols",
  },
] as const;

/**
 * ProofStrip — 4 structurally-true institutional facts placed immediately under
 * the Hero fold. Aligned to the max-w-[1440px] container grid with equal column widths,
 * mono numerals, hairline dividers, stacking 2x2 on mobile.
 */
export function ProofStrip() {
  return (
    <section aria-label="Institutional Standards" className="border-y border-white/[0.08] bg-[#070708] py-8 sm:py-10">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <div className="grid grid-cols-2 gap-y-8 divide-y divide-white/[0.08] md:grid-cols-4 md:divide-y-0 md:divide-x md:divide-white/[0.08]">
            {PROOF_POINTS.map((p, i) => (
              <div
                key={p.label}
                className={`flex flex-col justify-between ${
                  i % 2 === 1 ? "border-l border-white/[0.08] pl-4 sm:pl-6 md:border-l-0" : "pr-4 sm:pr-6"
                } ${i >= 2 ? "pt-6 md:pt-0 md:pl-6 lg:pl-8" : "md:px-6 lg:px-8"} ${
                  i === 0 ? "md:pl-0" : ""
                } ${i === PROOF_POINTS.length - 1 ? "md:pr-0" : ""}`}
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                      {p.kpi}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                  </div>
                  <h3 className="mt-1 font-mono-display text-[0.6875rem] font-medium tracking-[0.24em] text-amber-400">
                    {p.label}
                  </h3>
                </div>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground max-w-[34ch]">
                  {p.detail}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
