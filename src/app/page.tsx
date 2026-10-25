import StoreChrome from "@/components/StoreChrome";
import HeroSlider from "@/components/HeroSlider";
import QuickBar from "@/components/QuickBar";
import MarqueeStrip from "@/components/MarqueeStrip";
import MenuExplorer from "@/components/MenuExplorer";
import PassWidget from "@/components/PassWidget";
import LocationBlock from "@/components/LocationBlock";

import {
  getPromo,
  getFrontendSettings,
  getMenuData,
} from "@/db/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// بيانات افتراضية آمنة تحمي الموقع من الانهيار إذا كانت قاعدة البيانات غير متصلة أو فارغة
const FALLBACK_FRONTEND = {
  restaurantNameAr: "بروست الأسد",
  restaurantNameEn: "Lion Broast",
  sloganAr: "أكبر قطعة بروست في دسوق 🔥",
  sloganEn: "Biggest Broast Piece in Desouk",
  marqueeAr: "بروست الأسد 🦁 أكبر قطعة بروست في دسوق 🔥 قرمشة وتتبيلة ملهاش زي!",
  marqueeTextAr: "بروست الأسد 🦁 أكبر قطعة بروست في دسوق 🔥 قرمشة وتتبيلة ملهاش زي!",
  marqueeEn: "Lion Broast 🦁 The Biggest Broast Piece in Desouk 🔥",
  marqueeTextEn: "Lion Broast 🦁 The Biggest Broast Piece in Desouk 🔥",
  phone: "01068390982",
  whatsapp: "201068390982",
  whatsappNumber: "201068390982",
  addressAr: "دسوق - كفر الشيخ",
  address: "دسوق - كفر الشيخ",
  workingHoursAr: "يومياً من 11:00 صباحاً حتى 3:00 فجراً",
  heroSlides: [],
  banners: [],
  socialLinks: {},
};

const FALLBACK_PROMO = {
  isActive: false,
  titleAr: "",
  descriptionAr: "",
  discountPercent: 0,
  code: "",
};

export default async function HomePage() {
  let categories: any[] = [];
  let items: any[] = [];
  let zones: any[] = [];
  let promo: any = FALLBACK_PROMO;
  let frontend: any = FALLBACK_FRONTEND;

  try {
    const [menuDataResult, promoResult, frontendResult] = await Promise.all([
      getMenuData().catch((err) => {
        console.error("Error in getMenuData():", err);
        return { categories: [], items: [], zones: [] };
      }),
      getPromo().catch((err) => {
        console.error("Error in getPromo():", err);
        return FALLBACK_PROMO;
      }),
      getFrontendSettings().catch((err) => {
        console.error("Error in getFrontendSettings():", err);
        return FALLBACK_FRONTEND;
      }),
    ]);

    categories = Array.isArray(menuDataResult?.categories) ? menuDataResult.categories : [];
    items = Array.isArray(menuDataResult?.items) ? menuDataResult.items : [];
    zones = Array.isArray(menuDataResult?.zones) ? menuDataResult.zones : [];
    promo = promoResult ? { ...FALLBACK_PROMO, ...promoResult } : FALLBACK_PROMO;
    frontend = frontendResult ? { ...FALLBACK_FRONTEND, ...frontendResult } : FALLBACK_FRONTEND;
  } catch (error) {
    console.error("Critical HomePage Data Fetch Error:", error);
  }

  return (
    <StoreChrome zones={zones} promo={promo} settings={frontend} frontend={frontend}>
      <HeroSlider frontend={frontend} />
      <QuickBar />
      <MarqueeStrip
        marqueeAr={frontend?.marqueeAr || frontend?.marqueeTextAr || FALLBACK_FRONTEND.marqueeAr}
        marqueeEn={frontend?.marqueeEn || frontend?.marqueeTextEn || FALLBACK_FRONTEND.marqueeEn}
      />

      <div id="menu" className="mx-auto max-w-7xl px-4 py-12 md:px-8 space-y-16">
        <MenuExplorer
          categories={categories}
          items={items.filter((i: any) => i?.isAvailable !== false)}
        />
        <PassWidget />
        <LocationBlock settings={frontend} />
      </div>
    </StoreChrome>
  );
}
