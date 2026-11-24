"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

let lockCount = 0;

/** Reference-counted page scroll lock, so stacked overlays don't unlock each other. */
function lockScroll() {
  if (lockCount++ === 0) document.documentElement.style.overflow = "hidden";
}
function unlockScroll() {
  if (--lockCount <= 0) {
    lockCount = 0;
    document.documentElement.style.overflow = "";
  }
}

/**
 * Accessible modal behaviour (WCAG 2.1.2 / 2.4.3):
 *  - moves focus into the container when it opens
 *  - keeps Tab / Shift+Tab cycling inside it
 *  - closes on Escape
 *  - locks page scroll while open
 *  - restores focus to the previously focused element on close
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
  onEscape: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    lockScroll();

    const focusTimer = window.setTimeout(() => {
      const target = initialFocusRef?.current ?? container.querySelector<HTMLElement>(FOCUSABLE) ?? container;
      target.focus({ preventScroll: true });
    }, 30);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key !== "Tab") return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      unlockScroll();
      previouslyFocused?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
