"use client";

import { useEffect, useRef } from "react";

/**
 * Hero3D — mounts the three.js scene when (and only when) the device can
 * afford it. Renders nothing otherwise, so the static poster stays in place.
 *
 * Gates (all must pass):
 *  - a fine pointer is available (any-pointer: touch laptops still qualify), viewport ≥ 900px wide
 *  - no `prefers-reduced-motion`, WebGL available
 *  - not a low-end machine (≤ 2 CPU cores or ≤ 2GB device memory)
 *  - `NEXT_PUBLIC_DISABLE_3D` not set to "1"
 *
 * The scene module is imported dynamically AFTER the page is idle, so
 * three.js never competes with the LCP image or hydration.
 */
export function Hero3D({ onReady, onFail }: { onReady: () => void; onFail: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (process.env.NEXT_PUBLIC_DISABLE_3D === "1") return;

    const mq = (q: string) => window.matchMedia(q).matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const capable =
      mq("(min-width: 900px)") &&
      mq("(any-pointer: fine)") &&
      !mq("(prefers-reduced-motion: reduce)") &&
      (nav.hardwareConcurrency ?? 4) > 2 &&
      (nav.deviceMemory ?? 4) > 2 &&
      hasWebGL();
    if (!capable) return;

    let handle: { dispose: () => void } | null = null;
    let cancelled = false;

    const load = () => {
      import("./hero-3d-scene").then(({ createHeroScene }) => {
        if (cancelled) return;
        handle = createHeroScene(host, { onReady, onFail });
      });
    };

    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    let idleId = 0;
    let timerId = 0;
    if (w.requestIdleCallback) idleId = w.requestIdleCallback(load, { timeout: 1800 });
    else timerId = window.setTimeout(load, 900);

    return () => {
      cancelled = true;
      if (idleId && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      if (timerId) window.clearTimeout(timerId);
      handle?.dispose();
    };
    // onReady / onFail are stable (useCallback in the parent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className="absolute inset-0" />;
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    // Release the probe context immediately so it doesn't count against the browser's context limit.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!(window.WebGLRenderingContext && gl);
  } catch {
    return false;
  }
}
