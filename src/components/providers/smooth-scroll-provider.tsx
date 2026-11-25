"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

/**
 * Lenis smooth scroll + in-page anchor handling.
 *
 *  - Disabled entirely for `prefers-reduced-motion` users (native scroll).
 *  - Lenis drives its own rAF loop (`autoRaf`), which the browser pauses in
 *    background tabs.
 *  - Elements (or ancestors) with `data-lenis-prevent` keep native scrolling —
 *    used by the mobile menu and the partner portal.
 *  - Anchor clicks scroll to the section AND move keyboard focus to it, so
 *    screen-reader / keyboard users land where sighted users do.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduce
      ? null
      : new Lenis({
          lerp: 0.1, // frame-rate independent easing toward the target: crisper than duration/easing
          smoothWheel: true,
          autoRaf: true,
        });

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      const targetSelector = hash.split("?")[0];
      const target = document.querySelector<HTMLElement>(targetSelector);
      if (!target) return;
      e.preventDefault();

      const offset = targetSelector === "#top" ? 0 : -64;
      if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
      else target.scrollIntoView();

      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      history.replaceState(null, "", hash);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
