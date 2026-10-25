import { getMenuData, getPromo, getFrontendSettings } from "@/db/queries";
import StoreChrome from "@/components/StoreChrome";
import HeroSlider from "@/components/HeroSlider";
import QuickBar from "@/components/QuickBar";
import MarqueeStrip from "@/components/MarqueeStrip";
import BestSellers from "@/components/BestSellers";
import MenuPreview from "@/components/MenuPreview";
import ZonesSection from "@/components/ZonesSection";
import ChefCta from "@/components/ChefCta";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ categories, items, zones }, promo, frontend] = await Promise.all([
    getMenuData(), 
    getPromo(),
    getFrontendSettings()
  ]);
  const best = items.filter((i) => i.isBestSeller && i.isAvailable);

  return (
    <StoreChrome zones={zones} promo={promo} frontend={frontend}>
      <HeroSlider frontend={frontend} />
      <QuickBar />
      <MarqueeStrip marqueeAr={frontend.marqueeAr} marqueeEn={frontend.marqueeEn} />
      <BestSellers items={best} />
      <div className="border-t border-line bg-surface">
        <MenuPreview categories={categories} items={items.filter((i) => i.isAvailable)} />
      </div>
      <ZonesSection zones={zones} />
      <ChefCta />
    </StoreChrome>
  );
}
