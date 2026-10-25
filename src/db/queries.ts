import { db } from "@/db";
import { categories, items, orders, orderItems, settings } from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";

export interface FrontendSettings {
  brand_ar: string;
  brand_en: string;
  logo_url: string;
  hero_title_ar: string;
  hero_title_en: string;
  hero_subtitle_ar: string;
  hero_subtitle_en: string;
  hero_image_url: string;
  marquee_text_ar: string;
  marquee_text_en: string;
  hotline: string;
  whatsapp: string;
  address_ar: string;
  address_en: string;
  working_hours_ar: string;
  working_hours_en: string;
  footer_about_ar: string;
  footer_about_en: string;
  primary_color: string;
}

export const DEFAULT_FRONTEND_SETTINGS: FrontendSettings = {
  brand_ar: "مطعمنا",
  brand_en: "Our Restaurant",
  logo_url: "",
  hero_title_ar: "أشهى المأكولات الطازجة تصلك أينما كنت",
  hero_title_en: "Delicious Fresh Food Delivered To Your Door",
  hero_subtitle_ar: "استمتع بأفضل الأطباق المحضرة بأجود المكونات يومياً",
  hero_subtitle_en: "Enjoy the finest dishes prepared daily with quality ingredients",
  hero_image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  marquee_text_ar: "⚡ خصم 20% على طلبك الأول | 🛵 توصيل سريع وسريع | 🍔 أطباق جديدة يومياً",
  marquee_text_en: "⚡ 20% OFF Your First Order | 🛵 Fast Delivery | 🍔 New Specials Daily",
  hotline: "19000",
  whatsapp: "201000000000",
  address_ar: "القاهرة، مصر",
  address_en: "Cairo, Egypt",
  working_hours_ar: "يومياً من 10 صباحاً حتى 2 صباحاً",
  working_hours_en: "Daily 10:00 AM - 02:00 AM",
  footer_about_ar: "نقدم لكم أفضل تجربة طعام شرقي وغربي بأعلى معايير الجودة والنظافة.",
  footer_about_en: "Providing you with the best dining experience with top quality standards.",
  primary_color: "#e11d48",
};

export async function getFrontendSettings(): Promise<FrontendSettings> {
  try {
    const allSettings = await db.select().from(settings);
    const settingsMap: Record<string, string> = {};
    for (const row of allSettings) {
      settingsMap[row.key] = row.value;
    }

    return {
      brand_ar: settingsMap["brand_ar"] || DEFAULT_FRONTEND_SETTINGS.brand_ar,
      brand_en: settingsMap["brand_en"] || DEFAULT_FRONTEND_SETTINGS.brand_en,
      logo_url: settingsMap["logo_url"] || DEFAULT_FRONTEND_SETTINGS.logo_url,
      hero_title_ar: settingsMap["hero_title_ar"] || DEFAULT_FRONTEND_SETTINGS.hero_title_ar,
      hero_title_en: settingsMap["hero_title_en"] || DEFAULT_FRONTEND_SETTINGS.hero_title_en,
      hero_subtitle_ar: settingsMap["hero_subtitle_ar"] || DEFAULT_FRONTEND_SETTINGS.hero_subtitle_ar,
      hero_subtitle_en: settingsMap["hero_subtitle_en"] || DEFAULT_FRONTEND_SETTINGS.hero_subtitle_en,
      hero_image_url: settingsMap["hero_image_url"] || DEFAULT_FRONTEND_SETTINGS.hero_image_url,
      marquee_text_ar: settingsMap["marquee_text_ar"] || DEFAULT_FRONTEND_SETTINGS.marquee_text_ar,
      marquee_text_en: settingsMap["marquee_text_en"] || DEFAULT_FRONTEND_SETTINGS.marquee_text_en,
      hotline: settingsMap["hotline"] || DEFAULT_FRONTEND_SETTINGS.hotline,
      whatsapp: settingsMap["whatsapp"] || DEFAULT_FRONTEND_SETTINGS.whatsapp,
      address_ar: settingsMap["address_ar"] || DEFAULT_FRONTEND_SETTINGS.address_ar,
      address_en: settingsMap["address_en"] || DEFAULT_FRONTEND_SETTINGS.address_en,
      working_hours_ar: settingsMap["working_hours_ar"] || DEFAULT_FRONTEND_SETTINGS.working_hours_ar,
      working_hours_en: settingsMap["working_hours_en"] || DEFAULT_FRONTEND_SETTINGS.working_hours_en,
      footer_about_ar: settingsMap["footer_about_ar"] || DEFAULT_FRONTEND_SETTINGS.footer_about_ar,
      footer_about_en: settingsMap["footer_about_en"] || DEFAULT_FRONTEND_SETTINGS.footer_about_en,
      primary_color: settingsMap["primary_color"] || DEFAULT_FRONTEND_SETTINGS.primary_color,
    };
  } catch (err) {
    console.error("Failed to fetch settings from DB, using defaults:", err);
    return DEFAULT_FRONTEND_SETTINGS;
  }
}

export async function getCategoriesWithItems() {
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
  const result = [];

  for (const cat of cats) {
    const categoryItems = await db
      .select()
      .from(items)
      .where(eq(items.categoryId, cat.id))
      .orderBy(asc(items.sortOrder));

    result.push({
      ...cat,
      items: categoryItems,
    });
  }

  return result;
}

export async function getAllOrders() {
  const rawOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const result = [];

  for (const o of rawOrders) {
    const itemsList = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        notes: orderItems.notes,
        itemNameAr: items.nameAr,
        itemNameEn: items.nameEn,
      })
      .from(orderItems)
      .leftJoin(items, eq(orderItems.itemId, items.id))
      .where(eq(orderItems.orderId, o.id));

    result.push({
      ...o,
      items: itemsList,
    });
  }

  return result;
}
