import { Suspense } from "react";
import { getMenuData, getPromo } from "@/db/queries";
import StoreChrome from "@/components/StoreChrome";
import MenuExplorer from "@/components/MenuExplorer";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "المنيو | Menu",
  description: "منيو بروست الأسد الكامل — بروست، كومبوهات، ساندوتشات، مقبلات ومشروبات.",
};

export default async function MenuPage() {
  const [{ categories, items, zones }, promo] = await Promise.all([getMenuData(), getPromo()]);
  return (
    <StoreChrome zones={zones} promo={promo}>
      <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 md:px-8">
        <Suspense fallback={null}>
          <MenuExplorer categories={categories} items={items.filter((i) => i.isAvailable)} />
        </Suspense>
      </div>
    </StoreChrome>
  );
}
