import Link from "next/link";
import { db } from "@/db";
import { deliveryZones, menuItems } from "@/db/schema";
import { getCategoriesWithItems, getFrontendSettings, getPromo } from "@/db/queries";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import MarqueeStrip from "@/components/MarqueeStrip";
import BestSellers from "@/components/BestSellers";
import MenuPreview from "@/components/MenuPreview";
import ZonesSection from "@/components/ZonesSection";
import LocationBlock from "@/components/LocationBlock";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ClientBoot from "@/components/ClientBoot";
import { Sparkles, Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [frontend, rawPromo, rawCatsWithItems, rawZones, rawItems] = await Promise.all([
    getFrontendSettings().catch(() => null),
    getPromo().catch(() => null),
    getCategoriesWithItems().catch(() => []),
    db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder).catch(() => []),
    db.select().from(menuItems).catch(() => []),
  ]);

  const promo: any = rawPromo;
  const zonesList = Array.isArray(rawZones) ? rawZones : [];
  const itemsList = Array.isArray(rawItems) ? rawItems : [];

  const catsWithItems = Array.isArray(rawCatsWithItems)
    ? rawCatsWithItems.map((c: any) => ({
        ...c,
        id: String(c?.id || ""),
        nameAr: String(c?.nameAr || ""),
        nameEn: String(c?.nameEn || ""),
        items: Array.isArray(c?.items) ? c.items : [],
      }))
    : [];

  const allItems = catsWithItems.flatMap((c: any) => c.items || []);
  const bestItems = allItems.length > 0 ? allItems : itemsList;

  const marqueeText =
    frontend?.marqueeTextAr ||
    frontend?.marquee_text_ar ||
    "🔥 أقوى بروست مقرمش وطازج في دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥";

  // فحص حالة ظهور الإعلان المؤقت مع تجاوز قيود TypeScript بأمان
  const isPromoVisible =
    Boolean(promo) &&
    promo?.enabled !== false &&
    promo?.visible !== false &&
    Boolean(promo?.textAr || promo?.title);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-carbon-950 text-zinc-900 dark:text-white selection:bg-brand-500 overflow-x-hidden transition-colors duration-300">
      {/* 0. تهيئة المتجر */}
      <ClientBoot
        categories={catsWithItems}
        items={bestItems}
        menuItems={bestItems}
        zones={zonesList}
        deliveryZones={zonesList}
        settings={frontend}
        frontend={frontend}
        promo={promo}
      />

      {/* 1. الهيدر */}
      <Header frontend={frontend} settings={frontend} promo={promo} />

      {/* 2. السلايدر الرئيسي */}
      <HeroSlider frontend={frontend} />

      {/* 3. شريط الأخبار المتحرك */}
      <MarqueeStrip text={marqueeText} items={[marqueeText, marqueeText]} />

      {/* 4. لوحة الإعلانات الترويجية والعروض المؤقتة */}
      {isPromoVisible && (
        <section className="mx-auto max-w-7xl px-4 pt-6 pb-2 md:px-8" dir="rtl">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/50 bg-gradient-to-r from-carbon-950 via-amber-950/40 to-carbon-950 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
            <div className="absolute -left-10 -top-10 size-40 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-right">
                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/40 text-2xl animate-pulse">
                  <Megaphone className="size-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-black text-amber-300 border border-amber-500/30 mb-1.5">
                    <Sparkles className="size-3 text-amber-400" />
                    <span>عرض مؤقت وحصري · Limited Time</span>
                  </div>
                  <h3 className="text-lg md:text-2xl font-black text-white leading-relaxed">
                    {promo.textAr || promo.title}
                  </h3>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <Link
                  href="/menu"
                  className="rounded-2xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 px-7 py-3.5 text-sm font-black text-white shadow-xl transition hover:scale-105 active:scale-95"
                >
                  اطلب العرض الآن 🍗
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. سكشن الأكثر مبيعاً */}
      {bestItems.length > 0 && (
        <section id="best">
          <BestSellers categories={catsWithItems} items={bestItems} data={bestItems} />
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. المكان 1: بانر العروض والمميزات VIP (أكبر قطعة بروست في دسوق) */}
      {/* ========================================================================= */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 text-white" dir="rtl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-amber-600 to-brand-500 p-8 md:p-12 shadow-2xl">
          <div className="absolute -left-10 -top-10 size-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 size-60 rounded-full bg-black/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-4 py-1.5 text-xs font-black text-amber-300 backdrop-blur-md border border-white/15 shadow-sm">
              {frontend?.promoBadgeAr || "عروض ومميزات بروست الأسد VIP 🍗"}
            </span>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black leading-tight drop-shadow-md">
              {frontend?.promoTitleAr || "أكبر قطعة بروست في دسوق.. قرمشة وتتبيلة ملهاش زي! 🍗"}
            </h2>

            <p className="text-sm sm:text-base font-semibold text-white/90 leading-relaxed drop-shadow-sm">
              {frontend?.promoSubtitleAr ||
                "اطلب دلوقتي من المنيو واستمتع بأقوى عروض التوفير العائلية والفردية، توصيل سريع وسخن لحد باب بيتك في دسوق وجميع القرى المجاورة."}
            </p>

            <div className="pt-2">
              <Link
                href={frontend?.promoBtnLink || "/menu"}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-black text-carbon-950 shadow-xl transition hover:bg-amber-100 hover:scale-105 active:scale-95"
              >
                <span>{frontend?.promoBtnTextAr || "اطلب الآن 🍗"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. سكشن المنيو */}
      <section id="menu">
        {catsWithItems.length > 0 ? (
          <MenuPreview categories={catsWithItems} />
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-16 text-center" dir="rtl">
            <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-carbon-900/50 p-10 max-w-xl mx-auto backdrop-blur-md shadow-sm">
              <span className="text-5xl">🦁</span>
              <h3 className="mt-4 text-xl font-black text-zinc-900 dark:text-white">جاري تجهيز وتحديث قائمة الطعام بالمنيو الجديد</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-white/60">
                يمكنك إضافة وتحديث الأصناف بسهولة عبر ماسح المنيو الذكي أو لوحة التحكم.
              </p>
              <div className="mt-6">
                <Link
                  href="/admin"
                  className="inline-block rounded-xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-brand-600"
                >
                  فتح غرفة التحكم
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 8. سكشن مناطق وأسعار التوصيل الميدانية */}
      <section id="zones">
        <ZonesSection zones={zonesList} deliveryZones={zonesList} settings={frontend} />
      </section>

      {/* ========================================================================= */}
      {/* 9. سكشن الفرع واللوكيشن + بانر الطلب والواتساب (برتقالي موحد) */}
      {/* ========================================================================= */}
      <LocationBlock frontend={frontend} settings={frontend} />

      {/* 10. الفوتر وروابط التواصل */}
      <Footer frontend={frontend} settings={frontend} />

      {/* سلة المشتريات */}
      <CartDrawer zones={zonesList} deliveryZones={zonesList} items={bestItems} menuItems={bestItems} categories={catsWithItems} />
    </main>
  );
}
