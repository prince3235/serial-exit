"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { coreIdea, showcase } from "@/content/site";
import { VaultLayer } from "./vault-layer";
import { SectionShell } from "./section-shell";
import { Eyebrow } from "./eyebrow";
import { Reveal } from "./reveal";
import { safeRange } from "@/lib/scroll-range";

const CUBE_WIDTHS = [640, 1024, 1536, 1920, 2560, 3840] as const;
const CUBE_AVIF = CUBE_WIDTHS.map((w) => `/images/core-idea/cube-${w}.avif ${w}w`).join(", ");
const CUBE_WEBP = CUBE_WIDTHS.map((w) => `/images/core-idea/cube-${w}.webp ${w}w`).join(", ");

/**
 * CoreIdea — large statement typography that illuminates progressively as the
 * user scrolls. Two lines: line one is muted, line two brightens word-by-word
 * based on scroll progress. Backed by the glowing-cube image (the one verified
 * cube among many).
 */
export function CoreIdea() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  // Image slow zoom on scroll
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.2]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-4%", "8%"]);

  // "Classified" lines for the flashlight vault, derived from the illustrative deals
  const vaultLines = showcase.cards.map((c) => `${c.sector} · ${c.size} · ${c.location} · NOT LISTED`.toUpperCase());

  // Split line two into words for progressive illumination
  const words = coreIdea.lineTwo.split(" ");

  return (
    <SectionShell id="core-idea" className="overflow-hidden" bleed>
      {/* Background image — cubes with one glowing amber */}
      <div className="absolute inset-0 z-0">
        <motion.div className="absolute inset-0" style={{ scale: imgScale, y: imgY }}>
          <picture>
            <source type="image/avif" srcSet={CUBE_AVIF} sizes="100vw" />
            <source type="image/webp" srcSet={CUBE_WEBP} sizes="100vw" />
            <img
              src="/images/core-idea/cube-1920.webp"
              alt={coreIdea.imageAlt}
              width={3840}
              height={2160}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </picture>
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.75) 40%, rgba(5,5,5,0.88) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, transparent 0%, rgba(5,5,5,0.7) 75%)",
          }}
        />
      </div>

      <VaultLayer lines={vaultLines} />

      <div ref={ref} className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <Eyebrow index={coreIdea.index}>{coreIdea.eyebrow}</Eyebrow>
        </Reveal>

        <div className="relative mt-12 max-w-5xl lg:mt-16">
          {/* Subtle radial dark backing to ensure 100% legibility over any background texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-[radial-gradient(ellipse_at_30%_50%,rgba(5,5,5,0.92)_0%,rgba(5,5,5,0.65)_60%,transparent_85%)] sm:-inset-10"
          />

          {/* Line one — muted, large */}
          <Reveal delay={0.1}>
            <p className="font-sans text-[1.625rem] font-medium leading-[1.18] tracking-[-0.02em] text-foreground/80 sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.75rem]">
              {coreIdea.lineOne}
            </p>
          </Reveal>

          {/* Line two — illuminates word-by-word on scroll */}
          <p className="mt-6 font-sans text-[1.625rem] font-medium leading-[1.18] tracking-[-0.02em] sm:text-[2.25rem] md:text-[2.75rem] lg:mt-10 lg:text-[3.25rem] xl:text-[3.75rem]">
            {words.map((word, i) => {
              const start = i / words.length;
              const end = start + 1 / words.length;
              return (
                <Word
                  key={i}
                  progress={scrollYProgress}
                  range={[start, end]}
                >
                  {word}
                </Word>
              );
            })}
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  // Safe scroll range clamped strictly monotonically
  const endpoints = safeRange(range) as [number, number];
  // Minimum illuminated word opacity raised to 0.35 for superior legibility
  const opacity = useTransform(progress, endpoints, [0.35, 1]);
  const isAmber = children.replace(/[^a-zA-Z]/g, "").toLowerCase() === "next";
  return (
    <motion.span
      style={{ opacity }}
      className={`mr-[0.25em] inline-block ${isAmber ? "text-amber-300" : "text-foreground"}`}
    >
      {children}
    </motion.span>
  );
}
