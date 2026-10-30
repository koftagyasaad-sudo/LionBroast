import Link from "next/link";
import { db } from "@/db";
import { deliveryZones, categories, menuItems } from "@/db/schema";
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
import CartDrawer from "@/components/CartDrawer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [frontend, promo, rawCatsWithItems, rawZones, rawItems] = await Promise.all([
    getFrontendSettings().catch(() => null),
    getPromo().catch(() => null),
    getCategoriesWithItems().catch(() => []),
    db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder).catch(() => []),
    db.select().from(menuItems).catch(() => []),
  ]);

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

  // تجهيز مصفوفة شرائح كاملة ومحصنة تمنع خطأ s is not iterable نهائياً
  const heroSlides = [
    {
      id: "slide-1",
      title: frontend?.heroTitleAr || frontend?.hero_title_ar || "أقوى بروست مقرمش وطازج في دسوق",
      subtitle: frontend?.heroSubtitleAr || frontend?.hero_subtitle_ar || "طعم لا يُقاوم وخبرة سنوات من التتبيل السرّي الخاص!",
      image: frontend?.heroImage1 || frontend?.hero_image_1 || "/img/hero-1.png",
      imageUrl: frontend?.heroImage1 || frontend?.hero_image_1 || "/img/hero-1.png",
      tag: "الوحش الأصلي",
      badge: "NEW!",
      ctaText: "اطلب الآن",
      ctaLink: "/menu",
    },
    {
      id: "slide-2",
      title: "العزومة جاهزة",
      subtitle: "١٥ قطعة بروست، بطاطس عائلية، كول سلو و٤ مشروبات، اطلبها ووصلها السكة.",
      image: frontend?.heroImage2 || frontend?.hero_image_2 || "/img/hero-2.png",
      imageUrl: frontend?.heroImage2 || frontend?.hero_image_2 || "/img/hero-2.png",
      tag: "وجبة عائلية",
      badge: "الأكثر طلباً",
      ctaText: "اطلب العزومة",
      ctaLink: "/menu",
    },
    {
      id: "slide-3",
      title: "أكبر قطعة بروست في دسوق",
      subtitle: "قرمشة وتتبيلة ملهاش زي! اطلب دلوقتي واستمتع بأقوى عروض التوفير.",
      image: frontend?.heroImage3 || frontend?.hero_image_3 || "/img/hero-3.png",
      imageUrl: frontend?.heroImage3 || frontend?.hero_image_3 || "/img/hero-3.png",
      tag: "عروض VIP",
      badge: "توفير",
      ctaText: "شوف العروض",
      ctaLink: "/menu",
    },
  ];

  return (
    <main className="min-h-screen bg-carbon-950 text-white selection:bg-brand-500 overflow-x-hidden">
      {/* 1. الهيدر وشريط التنقل العلوي */}
      <Header frontend={frontend} settings={frontend} promo={promo} />

      {/* 2. السلايدر الرئيسي */}
      <HeroSlider frontend={frontend} slides={heroSlides} items={heroSlides} data={heroSlides} />

      {/* 3. شريط الأخبار المتحرك */}
      <MarqueeStrip text={marqueeText} items={[marqueeText, marqueeText]} />

      {/* 4. سكشن الأكثر مبيعاً */}
      {catsWithItems.length > 0 && bestItems.length > 0 && (
        <section id="best">
          <BestSellers categories={catsWithItems} items={bestItems} />
        </section>
      )}

      {/* 5. بانر العروض والمميزات VIP */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8" dir="rtl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-amber-600 to-brand-500 p-8 md:p-12 shadow-2xl">
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
        {catsWithItems.length > 0 ? (
          <MenuPreview categories={catsWithItems} />
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-16 text-center" dir="rtl">
            <div className="rounded-3xl border border-white/10 bg-carbon-900/50 p-10 max-w-xl mx-auto backdrop-blur-md">
              <span className="text-5xl">🦁</span>
              <h3 className="mt-4 text-xl font-black text-white">جاري تجهيز وتحديث قائمة الطعام بالمنيو الجديد</h3>
              <p className="mt-2 text-sm text-white/60">
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

      {/* 7. سكشن مناطق وأسعار التوصيل (بالعربي فقط) */}
      <section id="zones">
        <ZonesSection zones={zonesList} deliveryZones={zonesList} settings={frontend} />
      </section>

      {/* 8. سكشن عنوان الفرع ورابط Google Maps المباشر */}
      <LocationBlock frontend={frontend} />

      {/* 9. بانر الطلب السريع (جوعان؟ الأسد مستنيك) */}
      <ChefCta frontend={frontend} settings={frontend} />

      {/* 10. الفوتر وروابط التواصل */}
      <Footer frontend={frontend} settings={frontend} />

      {/* سلة المشتريات العامة */}
      <CartDrawer />
    </main>
  );
}
