"use client";

import React, { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import type { ZoneDTO, Promo, FrontendSettings } from "@/lib/types";

export interface StoreChromeProps {
  children: ReactNode;
  zones?: ZoneDTO[];
  promo?: Promo | null;
  settings?: FrontendSettings;
  frontend?: FrontendSettings;
}

export default function StoreChrome({
  children,
  zones = [],
  promo,
  settings,
  frontend,
}: StoreChromeProps) {
  const activeSettings = settings || frontend;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      <Header zones={zones} promo={promo} settings={activeSettings} />
      <main className="flex-1">{children}</main>
      <Footer settings={activeSettings} />
    </div>
  );
}
