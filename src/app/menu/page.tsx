import { Suspense } from "react";
import StoreChrome from "@/components/StoreChrome";
import MenuExplorer from "@/components/MenuExplorer";
import { getMenuData, getPromo, getFrontendSettings } from "@/db/queries";

export const revalidate = 0;

export default async function MenuPage() {
  const [{ categories, items, zones }, promo, settings] = await Promise.all([
    getMenuData(),
    getPromo(),
    getFrontendSettings(),
  ]);

  return (
    <StoreChrome zones={zones} promo={promo} settings={settings}>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
        <Suspense fallback={null}>
          <MenuExplorer categories={categories} items={items.filter((i) => i.isAvailable)} />
        </Suspense>
      </div>
    </StoreChrome>
  );
}
