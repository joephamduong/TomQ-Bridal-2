"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dictionary, type Locale, type DictShape } from "./dictionary";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: DictShape;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("vi");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ba_locale") as Locale | null;
      if (saved === "vi" || saved === "en") {
        queueMicrotask(() => setLocaleState(saved));
      }
    } catch {
      // localStorage có thể không khả dụng — bỏ qua, dùng mặc định "vi"
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("ba_locale", l);
    } catch {
      // ignore
    }
  };

  const value = useMemo(() => ({ locale, setLocale, t: dictionary[locale] }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage phải dùng trong LanguageProvider");
  return ctx;
}
