"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/types";

const SettingsContext = createContext<SiteSettings | null>(null);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: ReactNode;
}) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSiteSettings phải dùng trong SiteSettingsProvider");
  return ctx;
}

export function useMoneyFormatter() {
  const settings = useSiteSettings();
  return (amount: number) =>
    new Intl.NumberFormat(settings.currencyLocale || "en-AU", {
      style: "currency",
      currency: settings.currencyCode || "AUD",
      maximumFractionDigits: 0,
    }).format(amount);
}
