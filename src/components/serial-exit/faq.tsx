"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { SectionShell } from "./section-shell";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

export const FAQS = [
  {
    q: "How does Serial Exit protect confidentiality?",
    a: "All introductions are conducted strictly 1-to-1 under bilateral Non-Disclosure Agreements (NDAs). We never publish public deal boards, broadcast blind teasers, or distribute identifiable materials without explicit promoter authorization.",
  },
  {
    q: "What fee structure does Serial Exit operate on?",
    a: "Serial Exit operates on a success-aligned mandate model. We do not charge upfront public listing fees or platform subscription costs. Commercial terms are agreed upon in writing prior to introducing counterparties.",
  },
  {
    q: "Who qualifies as a verified corporate finance partner?",
    a: "Access is reserved for institutional private equity sponsors, family offices, strategic corporate acquirers, boutique investment banks, and structured credit funds with active, verified deployment mandates in India.",
  },
  {
    q: "What criteria must a business meet to be originated?",
    a: "We focus on profitable, established Indian enterprises typically with enterprise values ranging between ₹25 Cr and ₹500 Cr across manufacturing, healthcare, industrial distribution, specialty chemicals, and commercial services.",
  },
  {
    q: "What is the typical timeline from enquiry to bilateral introduction?",
    a: "Initial mandate review occurs within 24 hours. Following a discreet 15-minute briefing to calibrate strategic fit, verified bilateral introductions are arranged within 5 to 7 business days.",
  },
  {
    q: "Can business owners explore an exit without notifying staff or competitors?",
    a: "Yes. Strict operational discretion is our foundational principle. Identifying information is masked until qualified counterparties are pre-vetted and sign bilateral non-disclosure documentation.",
  },
  {
    q: "How does Serial Exit differ from public M&A listing platforms?",
    a: "Public listing boards broadcast teasers across open networks, eroding pricing leverage and confidentiality. Serial Exit operates an institutional, off-market origination network with 100% pre-verified principal qualification.",
  },
] as const;

export function Faq() {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (i + 1) % FAQS.length;
      document.getElementById(`faq-question-${next}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (i - 1 + FAQS.length) % FAQS.length;
      document.getElementById(`faq-question-${prev}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      document.getElementById(`faq-question-0`)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      document.getElementById(`faq-question-${FAQS.length - 1}`)?.focus();
    }
  };

  return (
    <SectionShell id="faq" className="border-t border-white/[0.06] bg-[#050505]">
      <SectionHeading
        index={t.faq.index}
        eyebrow={t.faq.eyebrow}
        title={t.faq.title}
        intro={t.faq.intro}
      />

      <div className="mx-auto mt-12 max-w-4xl lg:mt-16">
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={item.q} delay={i * 0.04}>
                <div className="transition-colors duration-300 hover:bg-white/[0.015]">
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${i}`}
                    id={`faq-question-${i}`}
                    className="flex w-full items-start justify-between gap-4 py-6 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/80"
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className="mt-1 h-4 w-4 shrink-0 text-amber-500" strokeWidth={1.5} />
                      <span className="font-sans text-base font-medium tracking-tight text-foreground sm:text-lg">
                        {item.q}
                      </span>
                    </div>
                    <span className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-xs border border-white/10 text-amber-400">
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-300",
                          isOpen && "rotate-180"
                        )}
                        strokeWidth={1.5}
                      />
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden pl-7 pr-4">
                      <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
