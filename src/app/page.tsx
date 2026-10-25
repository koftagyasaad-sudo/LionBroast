import { getMenuData, getPromo, getFrontendSettings } from "@/db/queries";
import StoreChrome from "@/components/StoreChrome";
import HeroSlider from "@/components/HeroSlider";
import QuickBar from "@/components/QuickBar";
import MarqueeStrip from "@/components/MarqueeStrip";
import BestSellers from "@/components/BestSellers";
import MenuPreview from "@/components/MenuPreview";
import ZonesSection from "@/components/ZonesSection";
import ChefCta from "@/components/ChefCta";
import PassWidget from "@/components/PassWidget";
import LocationBlock from "@/components/LocationBlock";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [{ categories, items, zones }, promo, frontend] = await Promise.all([
    getMenuData(),
    getPromo(),
    getFrontendSettings(),
  ]);

  const best = (items || []).filter((i) => i.isBestSeller && i.isAvailable);

  return (
    <StoreChrome zones={zones} promo={promo} settings={frontend} frontend={frontend}>
      <HeroSlider frontend={frontend} />
      <QuickBar />
      <MarqueeStrip
        marqueeAr={frontend?.marqueeAr || frontend?.marqueeTextAr}
        marqueeEn={frontend?.marqueeEn || frontend?.marqueeTextAr}
      />

      <BestSellers items={best} />

      <div className="border-t border-line bg-surface">
        <MenuPreview categories={categories} items={(items || []).filter((i) => i.isAvailable)} />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-16">
        <PassWidget />
        <LocationBlock settings={frontend} />
      </div>

      <ZonesSection zones={zones} />
      <ChefCta />
    </StoreChrome>
  );
}
