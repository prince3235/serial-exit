"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/use-in-view";

const R = 170; // lens radius (px)

/**
 * Flashlight Vault — a decorative layer of faint "classified" lines (aria-hidden) that a
 * cursor-following lens lights up in amber.
 *
 * Compositor-only: the lens (circular, overflow-hidden, statically masked) is moved with
 * `transform`, and the bright copy of the text inside it is moved by the exact opposite
 * offset, so the two copies stay registered with the base layer. Nothing repaints.
 *  - fine pointer: lens follows the cursor (rAF only while it is still catching up)
 *  - touch / no hover: lens drifts slowly on its own (motion allowed) while on screen
 *  - reduced motion: no lens, base layer only
 */
export function VaultLayer({ lines }: { lines: string[] }) {
  const { ref, inView } = useInView<HTMLDivElement>("0px");
  const lensRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const lens = lensRef.current;
    const inner = innerRef.current;
    if (!root || !lens || !inner || !inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fine = window.matchMedia("(any-pointer: fine) and (hover: hover)").matches;
    const section = root.closest("section") ?? root;
    let W = 0;
    let H = 0;
    let raf = 0;
    let rect: DOMRect | null = null;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const t0 = performance.now();

    const measure = () => {
      W = root.clientWidth;
      H = root.clientHeight;
      root.style.setProperty("--vw", `${W}px`);
      root.style.setProperty("--vh", `${H}px`);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    measure();
    tx = cx = W * 0.72;
    ty = cy = H * 0.5;

    const place = (x: number, y: number) => {
      lens.style.transform = `translate3d(${(x - R).toFixed(1)}px, ${(y - R).toFixed(1)}px, 0)`;
      inner.style.transform = `translate3d(${(R - x).toFixed(1)}px, ${(R - y).toFixed(1)}px, 0)`;
    };

    const loop = (now: number) => {
      if (!fine) {
        const t = (now - t0) / 1000;
        tx = W * (0.5 + 0.34 * Math.sin(t * 0.21));
        ty = H * (0.5 + 0.3 * Math.sin(t * 0.17 + 1.3));
      }
      cx += (tx - cx) * 0.1;
      cy += (ty - cy) * 0.1;
      place(cx, cy);
      raf = !fine || Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    const onEnter = () => {
      rect = root.getBoundingClientRect();
      lens.style.opacity = "1";
    };
    const onMove = (e: Event) => {
      const pe = e as PointerEvent;
      rect ??= root.getBoundingClientRect(); // measured once, not on every move
      tx = pe.clientX - rect.left;
      ty = pe.clientY - rect.top;
      kick();
    };
    const onLeave = () => {
      lens.style.opacity = "0";
      rect = null;
    };
    const onScroll = () => {
      rect = null;
    };

    place(cx, cy);
    if (fine) {
      lens.style.opacity = "0";
      section.addEventListener("pointerenter", onEnter);
      section.addEventListener("pointermove", onMove, { passive: true });
      section.addEventListener("pointerleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      lens.style.opacity = "1";
      kick(); // continuous drift while on screen
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [ref, inView]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      {/* base layer: barely visible */}
      <VaultText lines={lines} className="text-brass/[0.07]" />

      {/* lens: bright copy, counter-translated so it stays registered */}
      <div
        ref={lensRef}
        className="absolute left-0 top-0 overflow-hidden rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
        style={{
          width: R * 2,
          height: R * 2,
          WebkitMaskImage: "radial-gradient(circle, #000 28%, transparent 70%)",
          maskImage: "radial-gradient(circle, #000 28%, transparent 70%)",
        }}
      >
        <div ref={innerRef} className="absolute left-0 top-0 will-change-transform">
          <VaultText lines={lines} className="text-[#ffb37a]/70" />
        </div>
      </div>
    </div>
  );
}

/** Identical text layout in both copies (same width/height from CSS vars, deterministic rows). */
function VaultText({ lines, className }: { lines: string[]; className: string }) {
  const rows = 14;
  return (
    <div className={`flex flex-col justify-between py-8 font-mono-display text-[0.6875rem] tracking-[0.24em] ${className}`} style={{ width: "var(--vw, 100%)", height: "var(--vh, 100%)" }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="overflow-hidden whitespace-nowrap" style={{ paddingLeft: `${(i * 37) % 23}%` }}>
          {`${lines[i % lines.length]} — ${lines[(i + 2) % lines.length]}`}
        </div>
      ))}
    </div>
  );
}
