"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app-store";
import { dict, type Lang } from "@/lib/i18n";

export function useLang(): Lang {
  return useApp((s) => s.lang);
}

export function useDict() {
  const lang = useApp((s) => s.lang);
  return dict[lang];
}

export function useIsAr(): boolean {
  return useApp((s) => s.lang) === "ar";
}

/** True only after client mount — protects SSR from persisted-state mismatches. */
export function useMounted(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
