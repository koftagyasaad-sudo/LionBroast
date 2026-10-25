"use client";

import type { ReactNode } from "react";
import type { ZoneDTO } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import OnboardingModal from "@/components/OnboardingModal";
import LionPassDrawer from "@/components/CustomerQRCode";
import ItemDialog from "@/components/ItemDialog";
import FloatingDock from "@/components/FloatingDock";
import TrackerModal from "@/components/TrackerModal";

interface Promo {
  enabled: boolean;
  textAr?: string;
  textEn?: string;
  title?: string;
}

interface StoreChromeProps {
  children: ReactNode;
  zones?: ZoneDTO[];
  zonesList?: ZoneDTO[];
  promo?: Promo;
  settings?: any;
  frontend?: any;
}

/** Shared storefront chrome: header, footer, drawers, modals, floating dock. */
export default function StoreChrome({
  children,
  zones = [],
  zonesList = [],
  promo,
  settings,
  frontend,
}: StoreChromeProps) {
  const resolvedZones = zones.length > 0 ? zones : zonesList;
  const storeData = frontend || settings || {};

  return (
    <>
      <Header settings={storeData} frontend={storeData} promo={promo} />
      <main className="min-h-screen bg-carbon-950 text-white">{children}</main>
      <Footer settings={storeData} frontend={storeData} />
      <CartDrawer zones={resolvedZones} />
      <OnboardingModal zones={resolvedZones} />
      <LionPassDrawer />
      <ItemDialog />
      <TrackerModal />
      <FloatingDock promo={promo} settings={storeData} />
    </>
  );
}
