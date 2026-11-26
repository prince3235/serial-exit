import { Reveal } from "./reveal";

const PROOF_POINTS = [
  {
    index: "01",
    label: "Transaction Types",
    value: "5 Mandate Scopes",
    detail: "Sales, acquisitions, capital, debt & JVs",
  },
  {
    index: "02",
    label: "Off-Market",
    value: "Private Origination",
    detail: "Direct mandates before public listing",
  },
  {
    index: "03",
    label: "Coverage",
    value: "Pan-India",
    detail: "Businesses & partners across India",
  },
  {
    index: "04",
    label: "Verified Introductions",
    value: "1-to-1 Bilateral",
    detail: "Vetted counterparties under NDA",
  },
] as const;

/**
 * ProofStrip — Compact horizontal institutional summary bar placed directly
 * beneath the Hero fold. Mirrors the site's brass/amber mono index aesthetic
 * and Showcase data-row hierarchy while remaining low-profile and scannable.
 */
export function ProofStrip() {
  return (
    <section
      aria-label="Institutional Standards"
      className="border-y border-white/[0.08] bg-[#070708] py-3.5 sm:py-4"
    >
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Reveal y={12}>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {PROOF_POINTS.map((p, i) => (
              <div
                key={p.label}
                className={[
                  "flex flex-col justify-center",
                  i % 2 === 1 ? "border-l border-white/[0.06] pl-4 sm:pl-6" : "pr-4 sm:pr-6",
                  i < 2 ? "border-b border-white/[0.06] pb-3.5 lg:border-b-0 lg:pb-0" : "pt-3.5 lg:pt-0",
                  i === 0 ? "lg:pl-0 lg:pr-6" : "",
                  i === 1 || i === 2 ? "lg:border-l lg:border-white/[0.06] lg:px-6" : "",
                  i === 3 ? "lg:border-l lg:border-white/[0.06] lg:pl-6 lg:pr-0" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <dt className="flex items-center gap-2">
                  <span className="font-mono-display text-[0.6875rem] tracking-[0.22em] text-amber-500">
                    {p.index}
                  </span>
                  <span className="h-px w-3 bg-amber-500/45" aria-hidden="true" />
                  <span className="font-mono-display text-[0.6875rem] font-medium tracking-[0.18em] text-amber-400">
                    {p.label}
                  </span>
                </dt>
                <dd className="mt-1">
                  <span className="block font-sans text-[0.9375rem] font-medium leading-snug tracking-[-0.01em] text-foreground">
                    {p.value}
                  </span>
                  <span className="mt-0.5 block text-[0.75rem] leading-snug text-muted-foreground">
                    {p.detail}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
