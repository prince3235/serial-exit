"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/content/site";
import { useI18n } from "@/i18n/provider";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { Button } from "./button";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Navbar() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const { scrollY } = useScroll();
  const menuRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Scroll-spy — accurately highlights active section; clears when none in view
  useEffect(() => {
    const sections = nav.links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter(Boolean) as HTMLElement[];
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        setActive(visible ? "#" + visible.target.id : "");
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0, 0.15, 0.3, 0.5] }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Mobile menu: focus trap, Escape, scroll lock, focus restore
  useFocusTrap(menuRef, open, () => setOpen(false));

  const navLabelMap: Record<string, string> = {
    Platform: t.nav.platform,
    "What We Do": t.nav.whatWeDo,
    "How It Works": t.nav.howItWorks,
    Deals: t.nav.deals,
    Partners: t.nav.partners,
  };

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
          <a
            href="#top"
            className="relative h-7 w-[150px] shrink-0 sm:h-8 sm:w-[170px] lg:h-9 lg:w-[190px]"
            aria-label="Serial Exit — home"
          >
            <Image
              src="/images/logo-white.png"
              alt="Serial Exit"
              fill
              priority
              unoptimized
              className="object-contain object-left"
              sizes="190px"
            />
          </a>

          <ul className="hidden items-center gap-6 lg:flex">
            {nav.links.map((l) => {
              const isActive = active === l.href;
              return (
                <li key={l.href} className="relative">
                  <a
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
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
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
                <Image src="/images/logo-white.png" alt="Serial Exit" fill unoptimized className="object-contain object-left" sizes="170px" />
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
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-white/[0.07] py-5"
                  >
                    <span className="font-mono-display text-[0.625rem] tracking-[0.3em] text-amber-500">0{i + 1}</span>
                    <span className="font-sans text-3xl font-medium tracking-[-0.02em] text-foreground sm:text-4xl">
                      {navLabelMap[l.label] ?? l.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>



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
