"use client";

import { useEffect } from "react";
import { useApp } from "@/store/app-store";

/**
 * Bootstraps client-only behavior: html lang/dir/theme attributes,
 * service-worker registration, first-visit onboarding trigger.
 */
export default function ClientBoot() {
  const lang = useApp((s) => s.lang);
  const theme = useApp((s) => s.theme);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.toggle("dark", theme === "dark");
    html.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const { onboarded, openOnboarding } = useApp.getState();
    if (!onboarded) {
      const t = setTimeout(() => openOnboarding("auto"), 1400);
      return () => clearTimeout(t);
    }
  }, []);

  return null;
}
