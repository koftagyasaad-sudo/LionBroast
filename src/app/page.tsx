import Link from "next/link";
import { db } from "@/db";
import { deliveryZones } from "@/db/schema";
import { getCategoriesWithItems, getFrontendSettings, getPromo } from "@/db/queries";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import MarqueeStrip from "@/components/MarqueeStrip";
import BestSellers from "@/components/BestSellers";
import MenuPreview from "@/components/MenuPreview";
import ZonesSection from "@/components/ZonesSection";
import LocationBlock from "@/components/LocationBlock";
import ChefCta from "@/components/ChefCta";
import Footer from "@/components/Footer";
import FloatingDock from "@/components/FloatingDock";
import CartDrawer from "@/components/CartDrawer";

// إيقاف التخزين المؤقت الثابت لضمان ظهور أي تعديل من غرفة التحكم لحظياً
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [frontend, promo, catsWithItems, zonesList] = await Promise.all([
    getFrontendSettings().catch(() => null),
    getPromo().catch(() => null),
    getCategoriesWithItems().catch(() => []),
    db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder).catch(() => []),
  ]);

  return (
    <main className="min-h-screen bg-carbon-950 text-white selection:bg-brand-500 overflow-x-hidden">
      {/* 1. الهيدر وشريط التنقل العلوي */}
      <Header frontend={frontend} promo={promo} />

      {/* 2. السلايدر الرئيسي */}
      <HeroSlider frontend={frontend} />

      {/* 3. شريط الأخبار والعروض المتحرك */}
      <MarqueeStrip text={frontend?.marqueeTextAr} />

      {/* 4. سكشن الأكثر مبيعاً */}
      <section id="best">
        <BestSellers />
      </section>

      {/* 5. بانر العروض والمميزات VIP */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8" dir="rtl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-amber-600 to-brand-500 p-8 md:p-12 shadow-2xl">
          {/* تأثيرات إضاءة وخلفية جمالية */}
          <div className="absolute -left-10 -top-10 size-60 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -right-10 -bottom-10 size-60 rounded-full bg-black/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-4 py-1.5 text-xs font-black text-amber-300 backdrop-blur-md border border-white/15 shadow-sm">
              🍗 {frontend?.promoBadgeAr || "عروض ومميزات بروست الأسد VIP"}
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
                href="/menu"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-black text-carbon-950 shadow-xl transition hover:bg-amber-100 hover:scale-105 active:scale-95"
              >
                <span>اطلب الآن 🍗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. سكشن المنيو وقائمة الطعام */}
      <section id="menu">
        <MenuPreview categories={catsWithItems} />
      </section>

      {/* 7. سكشن مناطق وأسعار التوصيل */}
      <section id="zones">
        <ZonesSection zones={zonesList} />
      </section>

      {/* 8. سكشن عنوان الفرع وخرائط جوجل Google Maps */}
      <LocationBlock frontend={frontend} />

      {/* 9. بانر الطلب السريع (جوعان؟ الأسد مستنيك) */}
      <ChefCta frontend={frontend} />

      {/* 10. الفوتر وروابط التواصل */}
      <Footer frontend={frontend} />

      {/* العناصر التفاعلية الثابتة */}
      <FloatingDock promo={promo} />
      <CartDrawer />
    </main>
  );
}
