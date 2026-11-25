import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Serial Exit",
  description:
    "Confidentiality framework, privacy protocols, and data protection practices for Serial Exit.",
};

export default function PrivacyPage() {
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
            Legal & Data Privacy
          </span>
        </div>
        <h1 className="mt-4 font-sans text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 font-mono-display text-[0.6875rem] tracking-[0.2em] text-muted-foreground">
          LAST UPDATED: NOVEMBER 2026 · STATUS: DRAFT FOR LEGAL REVIEW
        </p>

        {/* Legal notice banner */}
        <div className="mt-8 flex items-start gap-3 border border-amber-500/30 bg-amber-500/[0.05] p-4 text-[0.8125rem] leading-relaxed text-amber-200/90">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>
            This draft privacy policy outlines the strict confidential data handling practices employed by
            Serial Exit for institutional deal origination and counterparty introduction.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="mt-12 space-y-10 text-[0.9375rem] leading-relaxed text-foreground/85">
          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              1. Institutional Confidentiality Commitment
            </h2>
            <p className="mt-3">
              Serial Exit operates exclusively on a private, relationship-led model. We do not maintain public
              deal boards, broadcast email teasers, or sell user information to third-party data brokers. Every
              enquiry and counterparty interaction is treated under strict bilateral confidentiality.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              2. Information We Collect
            </h2>
            <p className="mt-3">
              We collect information provided directly through our introductory qualification forms, including:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Full Name, official corporate email address, and professional telephone number</li>
              <li>Enterprise or institutional affiliation, designation, and primary mandate scope</li>
              <li>Transaction parameters, sector preferences, and target enterprise value ranges</li>
              <li>Technical diagnostics: IP addresses hashed using cryptographic salt for privacy verification</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              3. Purpose and Use of Data
            </h2>
            <p className="mt-3">
              Information collected is used solely to:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Qualify professional credentials and mandate legitimacy prior to introduction</li>
              <li>Structure 1-to-1 introductions under custom bilateral Non-Disclosure Agreements (NDAs)</li>
              <li>Transmit automated enquiry acknowledgements via secure email or opted-in WhatsApp channels</li>
            </ul>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              4. WhatsApp & Communication Channels
            </h2>
            <p className="mt-3">
              WhatsApp notifications are strictly transactional and opt-in. We do not distribute marketing
              campaigns or unsolicited bulk messages. You may revoke consent at any time by replying STOP or
              emailing our compliance team.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              5. Data Protection & DPDP Act Compliance
            </h2>
            <p className="mt-3">
              Serial Exit complies with the Digital Personal Data Protection Act, 2023 (India). Data principals
              retain the right to request access, correction, or complete erasure of their submitted professional
              records.
            </p>
          </section>

          <section>
            <h2 className="font-sans text-xl font-medium tracking-tight text-foreground">
              6. Contact & Grievance Redressal
            </h2>
            <p className="mt-3">
              For privacy inquiries, rights enforcement, or compliance verification, contact our principals directly at{" "}
              <a href={`mailto:${site.contact.email}`} className="text-amber-400 underline hover:text-amber-300">
                {site.contact.email}
              </a>{" "}
              or by written notice to our Ahmedabad, India offices.
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
