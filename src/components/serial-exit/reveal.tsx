"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Reveal — fade + 24px rise, staggered via delay prop.
 * Reduced motion is handled globally by <MotionConfig reducedMotion="user"> in AppProviders.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span" | "li" | "p" | "h2" | "h3";
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  const variants: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.9, ease: EASE, delay },
    },
  };

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as never}
      className={cn(className)}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

/**
 * MaskReveal — masked line reveal for headlines.
 * Each child line slides up from behind an overflow-hidden mask.
 */
export function MaskReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.12,
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px -5% 0px" });

  return (
    <div ref={ref} className={cn(className)}>
      {lines.map((line, i) => (
        <span key={i} className="mask-line block">
          <motion.span
            className={cn("block", lineClassName)}
            initial={{ y: "110%" }}
            animate={inView ? { y: "0%" } : { y: "110%" }}
            transition={{
              duration: 1.0,
              ease: EASE,
              delay: delay + i * stagger,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
