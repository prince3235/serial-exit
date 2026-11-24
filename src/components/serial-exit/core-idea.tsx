"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { coreIdea, showcase } from "@/content/site";
import { VaultLayer } from "./vault-layer";
import { SectionShell } from "./section-shell";
import { Eyebrow } from "./eyebrow";
import { Reveal } from "./reveal";

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
          <Image
            src="/images/glowing-cube.webp"
            alt={coreIdea.imageAlt}
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
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

        <div className="mt-12 max-w-5xl lg:mt-16">
          {/* Line one — muted, large */}
          <Reveal delay={0.1}>
            <p className="font-sans text-[1.625rem] font-medium leading-[1.18] tracking-[-0.02em] text-foreground/65 sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] xl:text-[3.75rem]">
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
  // One compositor-friendly property per word. (Previously opacity AND two
  // colour interpolations were evaluated for every word on every frame.)
  const opacity = useTransform(progress, range, [0.2, 1]);
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
