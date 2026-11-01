import Link from "next/link";
import { db } from "@/db";
import { deliveryZones, menuItems, categories, settings } from "@/db/schema";
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
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const [rawCats, rawItems, rawZones, rawSettings] = await Promise.all([
    db.select().from(categories).orderBy(categories.sortOrder).catch(() => []),
    db.select().from(menuItems).orderBy(menuItems.sortOrder).catch(() => []),
    db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder).catch(() => []),
    db.select().from(settings).catch(() => []),
  ]);

  const settingsMap: Record<string, any> = {};
  rawSettings.forEach((s: any) => {
    settingsMap[s.key] = s.value;
  });

  // تجميع الأقسام والأصناف لضمان ظهور المنيو فوراً
  const catsWithItems = rawCats.map((cat: any) => ({
    ...cat,
    id: String(cat.id),
    nameAr: String(cat.nameAr || ""),
    nameEn: String(cat.nameEn || cat.nameAr || ""),
    items: rawItems.filter((it: any) => Number(it.categoryId) === Number(cat.id)),
  })).filter((cat: any) => cat.items.length > 0);

  const bestItems = rawItems.length > 0 ? rawItems : catsWithItems.flatMap((c: any) => c.items || []);

  // قراءة مناطق التوصيل سواء من الجدول المباشر أو النسخة المتزامنة
  let zonesList = rawZones;
  if (!zonesList || zonesList.length === 0) {
    try {
      if (settingsMap.delivery_zones) {
        zonesList = JSON.parse(settingsMap.delivery_zones);
      }
    } catch {}
  }

  // قراءة الإعلان الترويجي النشط
  let activePromo: any = null;
  try {
    if (settingsMap.promo) {
      activePromo = JSON.parse(settingsMap.promo);
    }
  } catch {}
  if (!activePromo && settingsMap.promo_text_ar) {
    activePromo = {
      enabled: settingsMap.promo_enabled !== "false",
      textAr: settingsMap.promo_text_ar,
      title: settingsMap.promo_text_ar,
      code: "LION",
    };
  }

  const isPromoVisible =
    Boolean(activePromo) &&
    activePromo.enabled !== false &&
    Boolean(activePromo.textAr || activePromo.title);

  const marqueeText =
    settingsMap.marquee_text_ar ||
    settingsMap.marqueeTextAr ||
    "توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي";

  return (
    <main className="min-h-screen bg-carbon-950 text-white selection:bg-brand-500 overflow-x-hidden">
      <ClientBoot />

      {/* 1. الهيدر */}
      <Header frontend={settingsMap} settings={settingsMap} promo={activePromo} />

      {/* 2. السلايدر السينمائي */}
      <HeroSlider frontend={settingsMap} />

      {/* 3. شريط الأخبار الأفقي */}
      <MarqueeStrip marqueeAr={marqueeText} text={marqueeText} />

      {/* 4. إعلان الواجهة المؤقت */}
      {isPromoVisible && (
        <section className="mx-auto max-w-7xl px-4 pt-6 pb-2 md:px-8" dir="rtl">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-carbon-950 via-amber-950/30 to-carbon-950 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center md:text-right">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30 text-xl">
                  <Megaphone className="size-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/30 mb-1">
                    <Sparkles className="size-3 text-amber-400" />
                    <span>عرض مؤقت وحصري · Limited Time</span>
                  </div>
                  <h3 className="text-base md:text-xl font-black text-white leading-relaxed">
                    {activePromo.textAr || activePromo.title}
                  </h3>
                </div>
              </div>

              <Link
                href="/menu"
                className="shrink-0 rounded-2xl bg-gradient-to-r from-amber-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 px-6 py-3 text-xs md:text-sm font-black text-white shadow-xl transition active:scale-95"
              >
                اطلب العرض الآن 🍗
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 5. سكشن مميزات وعروض VIP */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 text-white" dir="rtl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-amber-600 to-brand-500 p-8 md:p-12 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-4 py-1.5 text-xs font-black text-amber-300 backdrop-blur-md border border-white/15">
              عروض ومميزات بروست الأسد VIP 🍗
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight drop-shadow-md">
              أكبر قطعة بروست في دسوق.. قرمشة وتتبيلة ملهاش زي! 🍗
            </h2>
            <p className="text-xs sm:text-sm md:text-base font-semibold text-white/90 leading-relaxed">
              اطلب دلوقتي من المنيو واستمتع بأقوى عروض التوفير العائلية والفردية، توصيل سريع وسخن لحد باب بيتك في دسوق وجميع القرى المجاورة.
            </p>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3 text-xs md:text-sm font-black text-carbon-950 shadow-xl transition hover:bg-amber-100 active:scale-95"
              >
                <span>اطلب الآن 🍗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. الأكثر مبيعاً */}
      {bestItems.length > 0 && (
        <section id="best">
          <BestSellers categories={catsWithItems} items={bestItems} data={bestItems} />
        </section>
      )}

      {/* 7. سكشن المنيو */}
      <section id="menu">
        {catsWithItems.length > 0 ? (
          <MenuPreview categories={catsWithItems} />
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-16 text-center" dir="rtl">
            <div className="rounded-3xl border border-white/10 bg-carbon-900/50 p-10 max-w-xl mx-auto backdrop-blur-md shadow-sm">
              <span className="text-5xl">🦁</span>
              <h3 className="mt-4 text-xl font-black text-white">جاري تجهيز وتحديث قائمة الطعام بالمنيو الجديد</h3>
              <p className="mt-2 text-xs text-white/60">
                يمكنك إضافة وتحديث الأصناف بسهولة عبر ماسح المنيو الذكي أو لوحة التحكم.
              </p>
              <div className="mt-6">
                <Link
                  href="/admin"
                  className="inline-block rounded-2xl bg-brand-500 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-brand-600"
                >
                  فتح غرفة التحكم
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 8. مناطق التوصيل الميدانية */}
      <section id="zones">
        <ZonesSection zones={zonesList} deliveryZones={zonesList} settings={settingsMap} />
      </section>

      {/* 9. الفرع واللوكيشن */}
      <LocationBlock frontend={settingsMap} settings={settingsMap} />

      {/* 10. الفوتر */}
      <Footer frontend={settingsMap} settings={settingsMap} />

      {/* سلة المشتريات */}
      <CartDrawer zones={zonesList} deliveryZones={zonesList} items={bestItems} menuItems={bestItems} categories={catsWithItems} />
    </main>
  );
}
