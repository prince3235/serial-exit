"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { I18nProvider } from "@/i18n/provider";
import { SmoothScrollProvider } from "./smooth-scroll-provider";

/**
 * Client-side providers.
 *
 * `MotionConfig reducedMotion="user"` is what actually makes Framer Motion
 * honour `prefers-reduced-motion` (its default is "never"): transform and
 * layout animations are disabled for those users, opacity fades remain.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <I18nProvider>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </I18nProvider>
    </MotionConfig>
  );
}
