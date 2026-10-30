import { db } from "@/db";
import { categories, menuItems, settings, deliveryZones, customers, orders } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

// =========================================================================
// 1. استعلام بطاقة كارت العميل والولاء (حل الخطأ الأحمر نهائياً)
// =========================================================================
export async function getPassData(code: string) {
  try {
    const cleanCode = String(code || "").trim();
    if (!cleanCode) return null;

    const customerRows = await db
      .select()
      .from(customers)
      .where(eq(customers.code, cleanCode))
      .limit(1);

    const customer = customerRows[0] || null;
    if (!customer) {
      return null;
    }

    return {
      customer,
      code: customer.code,
      name: customer.name || customer.fullName || "عميل الأسد VIP",
      loyaltyPoints: Number(customer.loyaltyPoints || 0),
      discountPercent: Number(customer.discountPercent || 0),
      totalSpent: Number(customer.totalSpent || 0),
      totalOrders: Number(customer.totalOrders || 0),
    };
  } catch (err) {
    console.error("getPassData error:", err);
    return null;
  }
}

// دالة رديفة لدعم استدعاءات الكارت والعملاء
export const getCustomerByCode = getPassData;

// =========================================================================
// 2. إعدادات الواجهة (مباشرة ولحظية 100% بدون أي كاش)
// =========================================================================
export async function getFrontendSettings() {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, any> = {};

    for (let i = 0; i < rows.length; i++) {
      const { key, value } = rows[i];
      try {
        if (value && (value.startsWith("{") || value.startsWith("["))) {
          map[key] = JSON.parse(value);
        } else {
          map[key] = value;
        }
      } catch {
        map[key] = value;
      }
    }

    return {
      brandNameAr: map.brand_name_ar || map.brandNameAr || "بروست الأسد",
      brandNameEn: map.brand_name_en || map.brandNameEn || "Broast El-Assad",
      logoUrl: map.logo_url || map.logoUrl || "/img/icon-512.png",
      heroSlides: map.hero_slides || map.heroSlides || null,
      heroImage1: map.hero_image_1 || map.heroImage1 || "/img/hero-1.png",
      heroImage2: map.hero_image_2 || map.heroImage2 || "/img/hero-2.png",
      heroImage3: map.hero_image_3 || map.heroImage3 || "/img/hero-3.png",
      marqueeTextAr:
        map.marquee_text_ar ||
        map.marqueeTextAr ||
        "🔥 أقوى بروست مقرمش وطازج في دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥",
      addressAr:
        map.address_ar ||
        map.addressAr ||
        "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية",
      workingHoursAr: map.working_hours_ar || map.workingHoursAr || "يومياً من 10 صباحا حتى 4 فجرا",
      hotline: map.hotline || "0248813666",
      whatsapp: map.whatsapp || "201034419424",
      branchMapsUrl:
        map.branch_maps_url ||
        map.branchMapsUrl ||
        "https://maps.google.com/?q=دسوق+شارع+الجيش",
      locationTitleAr: map.location_title_ar || map.locationTitleAr || "شرفنا في فرع بروست الأسد 🦁",
      locationSubtitleAr:
        map.location_subtitle_ar ||
        map.locationSubtitleAr ||
        "نقدم لك أعلى جودة وأسرع خدمة تيك واي ودليفري في دسوق والمناطق المجاورة.",
      promoBadgeAr: map.promo_badge_ar || map.promoBadgeAr || "عروض ومميزات بروست الأسد VIP 🍗",
      promoTitleAr:
        map.promo_title_ar ||
        map.promoTitleAr ||
        "أكبر قطعة بروست في دسوق.. قرمشة وتتبيلة ملهاش زي! 🍗",
      promoSubtitleAr:
        map.promo_subtitle_ar ||
        map.promoSubtitleAr ||
        "اطلب دلوقتي من المنيو واستمتع بأقوى عروض التوفير العائلية والفردية...",
      promoBtnTextAr: map.promo_btn_text_ar || map.promoBtnTextAr || "اطلب الآن 🍗",
      promoBtnLink: map.promo_btn_link || map.promoBtnLink || "/menu",
      ctaTitleAr: map.cta_title_ar || map.ctaTitleAr || "جوعان؟ الأسد مستنيك.",
      ctaSubtitleAr:
        map.cta_subtitle_ar ||
        map.ctaSubtitleAr ||
        "اطلب على واتساب في ٣٠ ثانية – أو كلم الخط الساخن والفرن يولّع على طول.",
      footerAboutAr:
        map.footer_about_ar ||
        map.footerAboutAr ||
        "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر.",
      footerCopyrightAr:
        map.footer_copyright_ar ||
        map.footerCopyrightAr ||
        "© 2026 بروست الأسد . جميع الحقوق محفوظة.",
      footerSloganAr:
        map.footer_slogan_ar ||
        map.footerSloganAr ||
        "توصيل سريع داخل دسوق • طعم أسدي أصلي",
      ...map,
    };
  } catch (err) {
    console.error("getFrontendSettings error:", err);
    return null;
  }
}

// =========================================================================
// 3. التصنيفات وقائمة الطعام الحية
// =========================================================================
export async function getCategoriesWithItems() {
  try {
    const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    const items = await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));

    return cats.map((cat) => ({
      ...cat,
      items: items.filter((item) => String(item.categoryId) === String(cat.id)),
    }));
  } catch (err) {
    console.error("getCategoriesWithItems error:", err);
    return [];
  }
}

export async function getMenuItems() {
  try {
    return await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));
  } catch (err) {
    console.error("getMenuItems error:", err);
    return [];
  }
}

export async function getDeliveryZones() {
  try {
    return await db.select().from(deliveryZones).orderBy(asc(deliveryZones.sortOrder));
  } catch (err) {
    console.error("getDeliveryZones error:", err);
    return [];
  }
}

// =========================================================================
// 4. استعلام لوحة الإعلانات الترويجية
// =========================================================================
export async function getPromo() {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, string> = {};
    for (let i = 0; i < rows.length; i++) {
      map[rows[i].key] = rows[i].value;
    }

    if (map["promo"]) {
      try {
        return JSON.parse(map["promo"]);
      } catch {}
    }

    const enabled = map["promo_enabled"] !== "false" && map["bulletin_enabled"] !== "false";
    const textAr = map["promo_text_ar"] || map["bulletin_text_ar"] || "";

    return {
      enabled,
      visible: enabled,
      textAr,
      title: textAr,
      code: map["promo_code"] || "LION15",
    };
  } catch (err) {
    console.error("getPromo error:", err);
    return null;
  }
}
