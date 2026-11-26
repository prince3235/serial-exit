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

    const parseTab = (hash: string): "owner" | "partner" | null => {
      const query = hash.split("?")[1];
      if (!query) return null;
      const tab = new URLSearchParams(query).get("tab");
      return tab === "owner" || tab === "partner" ? tab : null;
    };

    const scrollToHash = (hash: string) => {
      if (!hash || hash === "#") return false;
      const targetId = hash.split("?")[0].replace(/^#/, "");
      if (!targetId) return false;
      const target = document.getElementById(targetId);
      if (!target) return false;

      const offset = targetId === "top" ? 0 : window.innerWidth < 1024 ? -68 : -80;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(target, { offset, duration: 0.9 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      }

      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });

      const tab = parseTab(hash);
      if (tab) {
        window.dispatchEvent(new CustomEvent("serial-exit:tab", { detail: tab }));
      }
      return true;
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const targetId = hash.split("?")[0].replace(/^#/, "");
      if (!targetId || !document.getElementById(targetId)) return;

      e.preventDefault();
      if (window.location.hash !== hash) {
        history.pushState(null, "", hash);
      }
      window.dispatchEvent(new HashChangeEvent("hashchange"));

      // If a modal/drawer (e.g. mobile nav) just locked <html> overflow and is closing
      // in this click's React state update, wait for overflow unlock before scrolling.
      if (document.documentElement.style.overflow === "hidden") {
        requestAnimationFrame(() => requestAnimationFrame(() => scrollToHash(hash)));
      } else {
        scrollToHash(hash);
      }
    };

    const onScrollTop = () => {
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(0, { duration: 0.9 });
      } else {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }
    };

    const onPopState = () => {
      if (window.location.hash && window.location.hash !== "#") {
        scrollToHash(window.location.hash);
      }
    };

    document.addEventListener("click", onClick);
    window.addEventListener("serial-exit:scroll-top", onScrollTop);
    window.addEventListener("popstate", onPopState);

    // Handle initial hash on page landing (e.g. /#contact?tab=owner)
    const initialHash = window.location.hash;
    if (initialHash && initialHash !== "#") {
      const tryInitial = (attempts: number) => {
        if (!scrollToHash(initialHash) && attempts > 0) {
          setTimeout(() => tryInitial(attempts - 1), 80);
        }
      };
      requestAnimationFrame(() => tryInitial(15));
    }

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("serial-exit:scroll-top", onScrollTop);
      window.removeEventListener("popstate", onPopState);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
