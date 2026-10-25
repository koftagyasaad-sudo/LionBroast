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

export default function StoreChrome({ 
  children, 
  zones, 
  promo,
  frontend
}: { 
  children: ReactNode; 
  zones: ZoneDTO[]; 
  promo: Promo;
  frontend?: any;
}) {
  return (
    <>
      <Header frontend={frontend} />
      <main>{children}</main>
      <Footer frontend={frontend} />
      <CartDrawer zones={zones} />
      <OnboardingModal zones={zones} />
      <LionPassDrawer />
      <ItemDialog />
      <TrackerModal />
      <FloatingDock promo={promo} />
    </>
  );
}
