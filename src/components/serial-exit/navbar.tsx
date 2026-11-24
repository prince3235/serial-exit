"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X, Globe, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/content/site";
import { useI18n, localeNames, type Locale } from "@/i18n/provider";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { Button } from "./button";
import { Magnetic } from "./magnetic";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Navbar({ onOpenPortal }: { onOpenPortal?: () => void }) {
  const { t, locale, setLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [langOpen, setLangOpen] = useState(false);
  const { scrollY } = useScroll();
  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Scroll-spy
  useEffect(() => {
    const sections = nav.links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive("#" + visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Mobile menu: focus trap, Escape, scroll lock, focus restore
  useFocusTrap(menuRef, open, () => setOpen(false));

  // Language menu: close on Escape or outside click
  useEffect(() => {
    if (!langOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setLangOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [langOpen]);

  const navLabelMap: Record<string, string> = {
    Platform: t.nav.platform,
    "How It Works": t.nav.howItWorks,
    Opportunities: t.nav.opportunities,
  };

  const chip =
    "inline-flex h-9 items-center gap-1.5 border border-white/10 px-3 text-[0.75rem] text-foreground/80 hover:border-amber-500/60 hover:text-amber-300";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]">
        {/* Frosted backdrop fades in with opacity only (never animate backdrop-filter itself). */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 border-b border-white/[0.07] bg-[#050505]/80 backdrop-blur-xl transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        />
        <nav
          className="relative mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:h-20 lg:px-12"
          aria-label="Primary"
        >
          <Link
            href="#top"
            className="relative h-7 w-[150px] shrink-0 sm:h-8 sm:w-[170px] lg:h-9 lg:w-[190px]"
            aria-label="Serial Exit — home"
          >
            <Image
              src="/images/logo-white.png"
              alt="Serial Exit"
              fill
              priority
              className="object-contain object-left"
              sizes="190px"
            />
          </Link>

          <ul className="hidden items-center gap-6 lg:flex">
            {nav.links.map((l) => {
              const isActive = active === l.href;
              return (
                <li key={l.href} className="relative">
                  <Magnetic strength={0.2} radius={50}>
                    <Link
                      href={l.href}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "group relative inline-block text-[0.875rem] font-medium",
                        isActive ? "text-amber-300" : "text-foreground/80 hover:text-foreground"
                      )}
                    >
                      {navLabelMap[l.label] ?? l.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute -bottom-1 left-0 h-px w-full origin-left bg-amber-400 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                        )}
                      />
                    </Link>
                  </Magnetic>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <div ref={langRef} className="relative">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                aria-label={t.nav.language}
                aria-expanded={langOpen}
                aria-haspopup="true"
                className={chip}
              >
                <Globe className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-mono-display text-[0.625rem] tracking-[0.2em]">{localeNames[locale]}</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-11 w-32 border border-white/10 bg-[#0a0a0a] p-1"
                  >
                    {(Object.keys(localeNames) as Locale[]).map((l) => (
                      <button
                        key={l}
                        type="button"
                        lang={l}
                        aria-pressed={locale === l}
                        onClick={() => {
                          setLocale(l);
                          setLangOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between px-3 py-2 text-[0.8125rem]",
                          locale === l ? "text-amber-300" : "text-foreground/80 hover:text-foreground"
                        )}
                      >
                        <span>{l === "en" ? "English" : "हिन्दी"}</span>
                        <span className="font-mono-display text-[0.625rem] tracking-[0.2em] opacity-70">{localeNames[l]}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button type="button" onClick={() => onOpenPortal?.()} className={chip}>
              <Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              <span className="font-mono-display text-[0.625rem] tracking-[0.2em]">{t.nav.portal}</span>
            </button>

            <Button href={nav.cta.href} size="sm" withArrow>
              {t.nav.cta}
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-foreground lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-[#050505] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-8">
              <div className="relative h-7 w-[150px] sm:h-8 sm:w-[170px]">
                <Image src="/images/logo-white.png" alt="Serial Exit" fill className="object-contain object-left" sizes="170px" />
              </div>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center text-foreground"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
              </button>
            </div>

            <ul className="flex flex-1 flex-col justify-center gap-2 px-5 sm:px-8">
              {nav.links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.07 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-white/[0.07] py-5"
                  >
                    <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">0{i + 1}</span>
                    <span className="font-sans text-3xl font-medium tracking-[-0.02em] text-foreground sm:text-4xl">
                      {navLabelMap[l.label] ?? l.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="flex shrink-0 items-center gap-3 px-5 py-4 sm:px-8">
              <div className="flex border border-white/10" role="group" aria-label={t.nav.language}>
                {(Object.keys(localeNames) as Locale[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    lang={l}
                    aria-pressed={locale === l}
                    onClick={() => setLocale(l)}
                    className={cn(
                      "min-h-11 px-4 font-mono-display text-[0.625rem] tracking-[0.2em]",
                      locale === l ? "bg-amber-500/10 text-amber-300" : "text-foreground/70"
                    )}
                  >
                    {localeNames[l]}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onOpenPortal?.();
                }}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 border border-white/10 px-4 text-[0.75rem] text-foreground/80 hover:border-amber-500/60"
              >
                <Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                <span className="font-mono-display text-[0.625rem] tracking-[0.2em]">{t.nav.portal}</span>
              </button>
            </div>

            <div className="shrink-0 px-5 pb-10 sm:px-8">
              <Button href={nav.cta.href} size="lg" withArrow className="w-full" onClick={() => setOpen(false)}>
                {t.nav.cta}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
