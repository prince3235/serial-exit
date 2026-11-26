"use client";

import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { dictionaries, type Dictionary, type Locale } from "./messages";

export type { Locale, Dictionary };

/**
 * I18nProvider — English UI dictionary provider for Serial Exit.
 * Locale is locked to "en" (language switcher removed per site specification).
 */
type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "se-locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = "en";
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage access errors
    }
  }, []);

  const setLocale = useCallback((_l: Locale) => {}, []);
  const value = useMemo<Ctx>(() => ({ locale: "en", setLocale, t: dictionaries.en }), [setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
