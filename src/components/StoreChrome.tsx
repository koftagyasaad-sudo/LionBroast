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
  aboutAr,
  aboutEn,
  dbHotline,
  dbWhatsapp
}: { 
  children: ReactNode; 
  zones: ZoneDTO[]; 
  promo: Promo;
  aboutAr?: string;
  aboutEn?: string;
  dbHotline?: string;
  dbWhatsapp?: string;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer aboutAr={aboutAr} aboutEn={aboutEn} dbHotline={dbHotline} dbWhatsapp={dbWhatsapp} />
      <CartDrawer zones={zones} />
      <OnboardingModal zones={zones} />
      <LionPassDrawer />
      <ItemDialog />
      <TrackerModal />
      <FloatingDock promo={promo} />
    </>
  );
}
