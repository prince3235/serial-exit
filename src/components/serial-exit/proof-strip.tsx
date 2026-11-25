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
 * the Hero fold. No invented metrics, awards, or deal counts.
 */
export function ProofStrip() {
  return (
    <section aria-label="Institutional Standards" className="border-y border-white/[0.08] bg-[#070708] py-8 sm:py-10">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
            {PROOF_POINTS.map((p, i) => (
              <div
                key={p.label}
                className={`flex flex-col justify-between ${
                  i > 0 ? "border-l border-white/[0.07] pl-4 sm:pl-6 lg:pl-8" : ""
                }`}
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-sans text-2xl font-medium tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                      {p.kpi}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                  </div>
                  <h3 className="mt-1 font-mono-display text-[0.6875rem] font-semibold tracking-[0.24em] text-amber-400">
                    {p.label}
                  </h3>
                </div>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
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
