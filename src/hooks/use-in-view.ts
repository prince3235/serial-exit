"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element is on screen.
 *  - `inView`: currently intersecting (use it to pause looping animations)
 *  - `seen`:   has intersected at least once (use it to fire entrance animations once)
 * One IntersectionObserver per call; disconnects on unmount.
 */
export function useInView<T extends Element>(rootMargin = "0px") {
  const ref = useRef<T>(null);
  const [state, setState] = useState({ inView: false, seen: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) =>
        setState((s) => {
          const inView = entry.isIntersecting;
          return s.inView === inView && (s.seen || !inView) ? s : { inView, seen: s.seen || inView };
        }),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, ...state };
}
