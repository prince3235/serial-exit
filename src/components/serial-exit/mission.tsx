"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { mission } from "@/content/site";
import { SectionShell } from "./section-shell";
import { Eyebrow } from "./eyebrow";
import { Reveal, MaskReveal } from "./reveal";
import { cn } from "@/lib/utils";


/**
 * Mission — full-bleed boardroom-map image with dark overlay. Mission statement,
 * supporting line, and the three-line positioning displayed as large stacked
 * lines with amber accents.
 */
export function Mission() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.2]);

  return (
    <SectionShell
      id="mission"
      ref={ref}
      bleed
      className="relative overflow-hidden border-t border-white/[0.06] px-0 py-0"
    >
      {/* Full-bleed image */}
      <div className="absolute inset-0 z-0">
        <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
          <Image
            src="/images/boardroom-map.webp"
            alt={mission.imageAlt}
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.7) 40%, rgba(5,5,5,0.92) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 50%, transparent 0%, rgba(5,5,5,0.75) 70%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[110vh] w-full max-w-[1440px] flex-col justify-between px-5 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        {/* Top: eyebrow */}
        <Reveal>
          <Eyebrow index={mission.index}>{mission.eyebrow}</Eyebrow>
        </Reveal>

        {/* Middle: mission statement */}
        <div className="my-16 max-w-5xl lg:my-24">
          <Reveal delay={0.1}>
            <h2 className="font-sans text-[1.875rem] font-medium leading-[1.1] tracking-[-0.02em] text-foreground sm:text-[2.75rem] md:text-[3.25rem] lg:text-[4rem] xl:text-[4.5rem]">
              {mission.statement}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-2xl text-[0.9375rem] leading-relaxed text-foreground/65 sm:text-base lg:text-[1.0625rem]">
              {mission.supporting}
            </p>
          </Reveal>
        </div>

        {/* Bottom: three-line positioning */}
        <div className="border-t border-white/[0.08] pt-12 lg:pt-16">
          <div className="flex flex-col gap-3 lg:gap-4">
            {mission.positioningLines.map((line, i) => (
              <MaskReveal
                key={i}
                lines={[line]}
                delay={0.1 + i * 0.12}
                lineClassName={cn(
                  "font-sans text-[1.75rem] font-medium leading-[1.1] tracking-[-0.02em] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] xl:text-[4rem]",
                  i === 0 && "text-foreground",
                  i === 1 && "text-foreground/80",
                  i === 2 && "text-amber-gradient"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
