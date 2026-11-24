"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, localeNames, type Dictionary, type Locale } from "./messages";

export type { Locale, Dictionary };
export { localeNames };

/**
 * I18nProvider — lightweight client-side locale switcher (EN / HI).
 * Persists the choice in localStorage and reflects it on <html lang>.
 *
 * Not full next-intl routing — the site is a single page, so a context-based
 * approach keeps things simple and fast. Swap for next-intl App Router if you
 * need locale-prefixed routes later.
 */

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "se-locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Load saved preference on mount (deferred to avoid synchronous setState in effect)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved === "en" || saved === "hi") {
        setLocaleState(saved);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Reflect on <html lang> and persist
  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const t = dictionaries[locale];

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
