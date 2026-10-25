import StoreChrome from "@/components/StoreChrome";
import HeroSlider from "@/components/HeroSlider";
import QuickBar from "@/components/QuickBar";
import MarqueeStrip from "@/components/MarqueeStrip";
import MenuExplorer from "@/components/MenuExplorer";
import PassWidget from "@/components/PassWidget";
import LocationBlock from "@/components/LocationBlock";

import {
  getDeliveryZones,
  getPromo,
  getFrontendSettings,
  getCategoriesWithItems,
  getMenuData,
} from "@/db/queries";

export const revalidate = 0;

export default async function HomePage() {
  const [{ categories, items, zones }, promo, frontend] = await Promise.all([
    getMenuData(),
    getPromo(),
    getFrontendSettings(),
  ]);

  return (
    <StoreChrome zones={zones} promo={promo} settings={frontend} frontend={frontend}>
      <HeroSlider frontend={frontend} />
      <QuickBar />
      <MarqueeStrip marqueeAr={frontend.marqueeAr || frontend.marqueeTextAr} marqueeEn={frontend.marqueeEn || frontend.marqueeTextAr} />

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-16">
        <MenuExplorer categories={categories} items={items.filter((i) => i.isAvailable)} />
        <PassWidget />
        <LocationBlock settings={frontend} />
      </div>
    </StoreChrome>
  );
}
