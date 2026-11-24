"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Magnetic — wraps a child (usually a button) and applies a subtle magnetic
 * pull toward the cursor on desktop. Disabled on touch / coarse pointers.
 */
export function Magnetic({
  children,
  className,
  strength = 0.35,
  radius = 90,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  // Layout is read once on enter, not on every mousemove (avoids forced reflow).
  const rectRef = useRef<DOMRect | null>(null);
  const handleEnter = () => {
    rectRef.current = ref.current?.getBoundingClientRect() ?? null;
  };

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const rect = rectRef.current ?? el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius * 2) return;
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const reset = () => {
    rectRef.current = null;
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={{ x: sx, y: sy }}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
