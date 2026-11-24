"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary';

/**
 * Trailing ring cursor (desktop / fine pointer only).
 *
 *  - The NATIVE cursor stays visible (hiding it hurts low-vision users and
 *    makes the page feel broken if JS is slow). The ring is an accent only.
 *  - The rAF loop runs only while the ring is still catching up with the
 *    pointer, then stops — no permanent idle loop burning CPU.
 *  - Elements with data-cursor="View" (etc.) turn the ring into a labelled pill.
 *    The label is decorative (aria-hidden); the element itself keeps its real name.
 */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let tx = -100;
    let ty = -100;
    let cx = tx;
    let cy = ty;
    let raf = 0;
    let label = "";

    const tick = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    // Applies the ring state for whatever element is under the pointer.
    const apply = (target: HTMLElement | null) => {
      el.dataset.active = String(!!target?.closest?.(INTERACTIVE));
      const next = (target?.closest?.("[data-cursor]") as HTMLElement | null)?.dataset.cursor ?? "";
      if (next !== label) {
        label = next;
        if (labelRef.current) labelRef.current.textContent = next;
        el.dataset.label = String(next !== "");
      }
    };

    const onMove = (e: PointerEvent) => {
      if (el.style.opacity !== "1") {
        cx = e.clientX;
        cy = e.clientY;
        el.style.opacity = "1";
      }
      tx = e.clientX;
      ty = e.clientY;
      apply(e.target as HTMLElement | null);
      kick();
    };

    // Content slides under a stationary pointer while scrolling (no pointermove fires), so
    // drop the label immediately and re-check what is under the pointer once scrolling settles.
    let settle = 0;
    const onScroll = () => {
      if (label) apply(null);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => apply(document.elementFromPoint(tx, ty) as HTMLElement | null), 120);
    };
    const onDown = () => (el.dataset.down = "true");
    const onUp = () => (el.dataset.down = "false");
    const onLeave = () => (el.style.opacity = "0");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="se-cursor-ring" data-active="false" data-label="false">
      <span />
      <b ref={labelRef} className="se-cursor-label" />
    </div>
  );
}
