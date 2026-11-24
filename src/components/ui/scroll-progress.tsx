"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * ScrollProgress — a 2px amber bar fixed to the top of the viewport that
 * fills as the user scrolls down. Subtle premium detail.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-[80] h-[2px] w-full origin-left bg-amber-500"
      style={{
        scaleX,
        boxShadow: "0 0 10px rgba(255,122,26,0.6)",
      }}
    />
  );
}
