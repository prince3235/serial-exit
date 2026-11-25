"use client";

import Image from "next/image";
import Link from "next/link";
import { Linkedin, Mail, Phone, MapPin, Lock } from "lucide-react";
import { footer, site } from "@/content/site";
import { useI18n } from "@/i18n/provider";
import { Reveal } from "./reveal";

/**
 * Footer — logo, descriptor, nav links, contact placeholders, LinkedIn,
 * legal disclaimer, copyright. Sticks to bottom via the page wrapper
 * (mt-auto on the footer element, applied in page.tsx).
 */
export function Footer({ onOpenPortal }: { onOpenPortal?: () => void }) {
  const { t } = useI18n();
  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#050505]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        {/* Top: logo + descriptor + nav columns */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="relative h-9 w-[190px]">
              <Image
                src="/images/logo-white.png"
                alt="Serial Exit"
                fill
                className="object-contain object-left"
                sizes="190px"
              />
            </div>
            <p className="mt-6 max-w-sm text-[0.875rem] leading-relaxed text-muted-foreground">
              {t.footer.descriptor}
            </p>
            <p className="mt-6 font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">
              India · Est. {site.founded}
            </p>
          </Reveal>

          {/* nav columns use i18n headings */}
          <Reveal delay={0.1} className="lg:col-span-2">
            <h3 className="font-mono-display text-[0.625rem] tracking-[0.3em] text-foreground/65">
              {t.footer.platform}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {footer.navColumns[0].links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.875rem] text-foreground/70 transition-colors duration-300 hover:text-amber-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.18} className="lg:col-span-2">
            <h3 className="font-mono-display text-[0.625rem] tracking-[0.3em] text-foreground/65">
              {t.footer.engage}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <button
                  onClick={onOpenPortal}
                  className="group inline-flex items-center gap-2 text-[0.875rem] text-foreground/70 transition-colors duration-300 hover:text-amber-300"
                >
                  <Lock className="h-3.5 w-3.5 text-amber-500 transition-colors duration-300 group-hover:text-amber-400" strokeWidth={1.4} />
                  {t.nav.portal}
                </button>
              </li>
              {footer.navColumns[1].links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.875rem] text-foreground/70 transition-colors duration-300 hover:text-amber-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Contact */}
          <Reveal delay={0.26} className="lg:col-span-3">
            <h3 className="font-mono-display text-[0.625rem] tracking-[0.3em] text-foreground/65">
              {t.footer.contact}
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="group flex items-center gap-3 text-[0.875rem] text-foreground/70 transition-colors duration-300 hover:text-amber-300"
                >
                  <Mail className="h-4 w-4 text-amber-500 transition-colors duration-300 group-hover:text-amber-400" strokeWidth={1.4} />
                  {site.contact.email}
                </a>
              </li>
              {site.contact.phones.map((ph) => (
                <li key={ph}>
                  <a
                    href={`tel:${ph.replace(/\s/g, "")}`}
                    className="group flex items-center gap-3 text-[0.875rem] text-foreground/70 transition-colors duration-300 hover:text-amber-300"
                  >
                    <Phone className="h-4 w-4 text-amber-500 transition-colors duration-300 group-hover:text-amber-400" strokeWidth={1.4} />
                    {ph}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3 text-[0.875rem] text-foreground/70">
                <MapPin className="h-4 w-4 text-amber-500" strokeWidth={1.4} />
                {site.contact.location}
              </li>
              <li>
                <a
                  href={site.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Serial Exit on LinkedIn"
                  className="group inline-flex h-10 w-10 items-center justify-center border border-white/[0.1] text-foreground/60 transition-all duration-300 hover:border-amber-500/60 hover:text-amber-300"
                >
                  <Linkedin className="h-4 w-4" strokeWidth={1.4} />
                </a>
              </li>
            </ul>
          </Reveal>
        </div>

        {/* Legal */}
        <div className="mt-14 border-t border-white/[0.06] pt-8 lg:mt-20">
          <p className="max-w-3xl text-[0.75rem] leading-relaxed text-foreground/65">
            {t.footer.legal}
          </p>
          <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3 font-mono-display text-[0.6875rem] tracking-[0.22em] text-foreground/70">
              <span>{t.footer.copyright}</span>
              <span className="text-white/20" aria-hidden="true">·</span>
              <Link href="/privacy" className="transition-colors hover:text-amber-300">
                Privacy Policy
              </Link>
              <span className="text-white/20" aria-hidden="true">·</span>
              <Link href="/terms" className="transition-colors hover:text-amber-300">
                Terms of Service
              </Link>
            </div>
            <p className="font-mono-display text-[0.6875rem] tracking-[0.25em] text-foreground/60">
              Verified · Confidential · Relationship-Driven
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
