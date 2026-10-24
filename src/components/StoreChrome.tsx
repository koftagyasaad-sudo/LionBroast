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
  textAr: string;
  textEn: string;
}

/** Shared storefront chrome: header, footer, drawers, modals, floating dock. */
export default function StoreChrome({ children, zones, promo }: { children: ReactNode; zones: ZoneDTO[]; promo: Promo }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer zones={zones} />
      <OnboardingModal zones={zones} />
      <LionPassDrawer />
      <ItemDialog />
      <TrackerModal />
      <FloatingDock promo={promo} />
    </>
  );
}
