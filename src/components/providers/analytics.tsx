"use client";

import { useEffect } from "react";

/**
 * Privacy-friendly product analytics (PostHog), loaded lazily.
 *
 *  - Does nothing (and ships no analytics code) unless NEXT_PUBLIC_POSTHOG_KEY is set.
 *  - posthog-js is dynamically imported after the page is idle, so it never
 *    competes with LCP.
 *  - Cookieless (`persistence: "memory"`), honours Do-Not-Track, no autocapture,
 *    no session recording, no IP-based geo — so no consent banner is needed
 *    for basic page-view counts. If your legal counsel requires opt-in
 *    consent, gate the `init` call on your consent UI instead.
 */
export function Analytics() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    const start = () => {
      import("posthog-js").then(({ default: posthog }) => {
        posthog.init(key, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
          persistence: "memory",
          respect_dnt: true,
          autocapture: false,
          disable_session_recording: true,
          capture_pageview: true,
          capture_pageleave: false,
          ip: false,
        });
      });
    };

    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 4000 });
    else window.setTimeout(start, 2500);
  }, []);

  return null;
}
