"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useCallback, useRef, useState, type CSSProperties } from "react";
import { hero } from "@/content/site";
import { useI18n } from "@/i18n/provider";
import { Button } from "./button";
import { Hero3D } from "./hero-3d";

// Ambient embers — deterministic so SSR/CSR match. Animated by CSS (compositor only).
const EMBERS = [
  { left: "8%", size: 3, dur: 14, delay: 0, o: 0.7 },
  { left: "18%", size: 2, dur: 18, delay: 3, o: 0.5 },
  { left: "27%", size: 4, dur: 16, delay: 6, o: 0.8 },
  { left: "42%", size: 2, dur: 20, delay: 1.5, o: 0.4 },
  { left: "58%", size: 3, dur: 15, delay: 4.5, o: 0.6 },
  { left: "68%", size: 2, dur: 19, delay: 7.5, o: 0.5 },
  { left: "78%", size: 4, dur: 17, delay: 2, o: 0.75 },
  { left: "88%", size: 2, dur: 21, delay: 5, o: 0.45 },
  { left: "94%", size: 3, dur: 16, delay: 8.5, o: 0.6 },
] as const;

const WIDTHS = [640, 1024, 1536, 1920, 2560, 3840] as const;
const HERO_AVIF = WIDTHS.map((w) => `/images/hero/hero-${w}.avif ${w}w`).join(", ");
const HERO_WEBP = WIDTHS.map((w) => `/images/hero/hero-${w}.webp ${w}w`).join(", ");
const HERO_SIZES = "(min-width: 1024px) 80vw, 100vw";

const d = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

/**
 * Hero — full-bleed cinematic opening.
 *
 *  - The entrance sequence is CSS-only (see .se-rise / .se-mask-up in
 *    globals.css), so it starts at first paint instead of waiting for
 *    React to hydrate. Nothing is hidden behind a preloader.
 *  - The poster photograph is the LCP element and is ALWAYS visible. On
 *    capable desktops a transparent WebGL layer (shards + dust, parallax)
 *    fades in over it when idle — additive depth, no swap, no layout shift.
 *  - Scroll parallax on the poster is transform-only.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { t } = useI18n();
  const [sceneReady, setSceneReady] = useState(false);
  const onReady = useCallback(() => setSceneReady(true), []);
  const onFail = useCallback(() => setSceneReady(false), []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.14]);

  // Headline: emphasise "before" in italic serif + amber.
  const headlineLines = [t.hero.line1, t.hero.line2, t.hero.line3].map((line) =>
    line.split(/(before)/i).map((part, i) =>
      part.toLowerCase() === "before" ? (
        <em key={i} className="font-serif-italic text-amber-gradient pr-2" style={{ fontStyle: "italic" }}>
          {part}
        </em>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  );

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-[100svh] w-full overflow-hidden bg-[#050505]"
      aria-label="Introduction"
    >
      {/* Poster (LCP) — sits to the right on desktop and feathers into the page on the left */}
      <div
        className="se-hero-poster absolute inset-y-0 right-0 z-0 w-full lg:w-[80%]"
       
        style={{ maskImage: "linear-gradient(90deg, transparent 0%, #000 38%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 38%)" }}
      >
        <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
          {/* Pre-built AVIF/WebP variants (scripts/optimize-hero.mjs): no cold runtime encode on the LCP path. */}
          <picture>
            <source type="image/avif" srcSet={HERO_AVIF} sizes={HERO_SIZES} />
            <source type="image/webp" srcSet={HERO_WEBP} sizes={HERO_SIZES} />
            <img
              src="/images/hero/hero-1536.webp"
              alt=""
              width={3840}
              height={2160}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </picture>
        </motion.div>
      </div>

      {/* WebGL scene (capable desktops only) — fades in over the poster */}
      <div className="se-hero-3d pointer-events-none absolute inset-0 z-[1]" data-ready={sceneReady} aria-hidden="true">
        <Hero3D onReady={onReady} onFail={onFail} />
      </div>

      {/* Contrast scrims (keep headline & body text ≥ 4.5:1 over imagery and 3D scene) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] lg:hidden"
        style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.72) 35%, rgba(5,5,5,0.85) 70%, #050505 100%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,0.96) 0%, rgba(5,5,5,0.85) 32%, rgba(5,5,5,0.45) 55%, rgba(5,5,5,0.1) 75%, transparent 100%), linear-gradient(180deg, rgba(5,5,5,0.6) 0%, transparent 25%, transparent 68%, #050505 100%)",
        }}
      />

      {/* Embers */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] overflow-hidden">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="se-ember"
            style={
              {
                left: e.left,
                width: e.size,
                height: e.size,
                "--dur": `${e.dur}s`,
                "--delay": `${e.delay}s`,
                "--o": e.o,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Content — vertically balanced for laptop & desktop 100svh folds */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col justify-between px-5 pb-8 pt-24 sm:px-8 sm:pb-10 sm:pt-28 lg:px-12 lg:pb-10 lg:pt-28 xl:pb-12 xl:pt-32">
        <div className="se-rise flex items-center gap-3" style={d(0.1)}>
          <span className="h-px w-8 bg-amber-500/80" aria-hidden="true" />
          <span className="font-mono-display text-[0.75rem] font-medium tracking-[0.28em] text-amber-300 sm:text-[0.8125rem]">{t.hero.eyebrow}</span>
        </div>

        <div className="flex max-w-4xl flex-col gap-6 py-4 sm:py-6 lg:gap-6 lg:py-5 xl:gap-8 xl:py-8">
          <h1 className="font-sans text-[2rem] font-medium leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[3.25rem] md:text-[4rem] lg:text-[4.75rem] xl:text-[5.5rem]">
            {headlineLines.map((line, i) => (
              // padding/negative-margin keeps descenders (g, y) from being clipped by the mask
              <span key={i} className="mask-line -mb-[0.1em] pb-[0.1em]">
                <span className="se-mask-up" style={d(0.08 + i * 0.12)}>
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="se-rise max-w-xl text-[0.9375rem] leading-relaxed text-foreground/85 sm:text-base lg:text-[1.0625rem]"
            style={d(0.5)}
          >
            {t.hero.subtext}
          </p>

          <div className="se-rise flex flex-col gap-3" style={d(0.65)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Button href={hero.ctas.primary.href} variant="solid" size="lg" withArrow className="w-full sm:w-auto">
                {t.hero.ctaPrimary}
              </Button>
              <Button href={hero.ctas.secondary.href} variant="ghost" size="lg" className="w-full sm:w-auto">
                {t.hero.ctaSecondary}
              </Button>
            </div>
            <p className="font-mono-display text-[0.6875rem] tracking-[0.24em] text-foreground/75">
              {t.hero.ctaMicro}
            </p>
          </div>
        </div>

        <div className="se-fade flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" style={d(0.9)}>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 sm:gap-x-10">
            {t.hero.strip.map((label) => (
              <li
                key={label}
                className="flex items-center gap-2 font-mono-display text-[0.6875rem] tracking-[0.26em] text-foreground/85 sm:text-[0.75rem]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <a href="#core-idea" aria-label="Scroll to content" className="group hidden flex-col items-center gap-2 sm:flex">
            <span className="font-mono-display text-[0.6875rem] tracking-[0.28em] text-foreground/75 group-hover:text-amber-400">
              {t.hero.scroll}
            </span>
            <span className="relative flex h-8 w-4.5 items-start justify-center rounded-full border border-white/25">
              <span className="mt-1 h-1.5 w-1 rounded-full bg-amber-400 animate-scroll-dot" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
