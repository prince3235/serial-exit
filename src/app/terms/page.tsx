import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Terms of Service | Serial Exit",
  description:
    "Institutional terms of engagement, origination boundaries, and platform scope for Serial Exit.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-foreground">
      {/* Header bar */}
      <header className="border-b border-white/[0.08] bg-[#070708]">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="relative h-8 w-[170px]" aria-label="Serial Exit — home">
            <Image
              src="/images/logo-white.png"
              alt="Serial Exit"
              fill
              className="object-contain object-left"
              sizes="170px"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/10 px-4 py-2 font-mono-display text-[0.6875rem] tracking-[0.2em] text-foreground/80 transition-colors hover:border-amber-500/60 hover:text-amber-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Platform</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
        {/* Eyebrow & Title */}
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
          <span className="font-mono-display text-[0.6875rem] tracking-[0.28em] text-amber-400">
            Institutional Terms
          </span>
        </div>
        <h1 className="mt-4 font-sans text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 font-mono-display text-[0.6875rem] tracking-[0.2em] text-muted-foreground">
          LAST UPDATED: NOVEMBER 2026 · STATUS: DRAFT FOR LEGAL REVIEW
        </p>

        {/* Regulatory disclaimer banner */}
        <div className="mt-8 flex items-start gap-3 border border-amber-500/30 bg-amber-500/[0.05] p-4 text-[0.8125rem] leading-relaxed text-amber-200/90">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            Serial Exit is an off-market deal origination and professional counterparty introduction network.
            It does not operate as a registered broker-dealer, merchant banker, SEBI-registered advisor, or legal counsel.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="mt-12 space-y-10 text-[0.9375rem] leading-relaxed text-foreground/85">
          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              1. Platform Purpose & Scope
            </h2>
            <p className="mt-3">
              Serial Exit operates a proprietary deal origination framework connecting vetted financial sponsors,
              corporate acquirers, family offices, and business owners. Platform engagement is limited strictly to
              evaluating bilateral fit and facilitating introductory counterparty connections.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              2. Non-Disclosure & Bilateral Protocols
            </h2>
            <p className="mt-3">
              All specific deal sheets, company identifying details, financial statements, and counterparty data
              shared beyond high-level anonymised teasers require the execution of an enforceable, bilateral Non-Disclosure
              Agreement (NDA).
            </p>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              3. Independent Due Diligence & Disclaimers
            </h2>
            <p className="mt-3">
              While Serial Exit conducts proprietary verification regarding seller intent and commercial operational metrics,
              all participants must conduct their own independent legal, commercial, and financial due diligence.
              Serial Exit does not guarantee transaction completion or business performance.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              4. Commercial Mandates & Success Fees
            </h2>
            <p className="mt-3">
              Origination fees, advisory arrangements, and transaction compensation are governed exclusively by separate,
              written mandate agreements negotiated directly between Serial Exit and the participating principals or firms.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              5. Governing Law & Dispute Resolution
            </h2>
            <p className="mt-3">
              These terms and any platform engagement shall be governed by and construed in accordance with the laws
              of the Republic of India. Courts situated in Ahmedabad, Gujarat, shall hold exclusive territorial jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              6. Formal Legal Review Notice
            </h2>
            <p className="mt-3">
              These terms are marked as DRAFT pending final regulatory review prior to commercial platform launch. For
              questions or counsel review requests, contact{" "}
              <a href={`mailto:${site.contact.email}`} className="text-amber-400 underline hover:text-amber-300">
                {site.contact.email}
              </a>.
            </p>
          </section>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/[0.08] bg-[#070708] py-8 text-center font-mono-display text-[0.6875rem] tracking-[0.2em] text-muted-foreground">
        © {new Date().getFullYear()} Serial Exit · Verified Off-Market Origination · India
      </footer>
    </div>
  );
}
