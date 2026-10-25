import { db } from "@/db";
import { categories, menuItems, orders, orderLines, settings, customers, deliveryZones } from "@/db/schema";
import { eq, desc, asc, inArray } from "drizzle-orm";

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
  brand_ar: "بروست الأسد",
  brand_en: "Broast El-Assad",
  logo_url: "",
  hero_title_ar: "الحار اللي يولع",
  hero_title_en: "The Fire Edition",
  hero_subtitle_ar: "ستريبس النار بغمسة الهالبينو المدخنة. خصم 20% طوال الأسبوع – جربها لو قدها.",
  hero_subtitle_en: "Fire strips with smoked jalapeño dip. 20% off all week – try it if you dare.",
  hero_image_url: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1200&q=80",
  marquee_text_ar: "دجاج طازج يومياً 💥 تتبيلة سرية 💥 كرسبي 100%",
  marquee_text_en: "Fresh Chicken Daily 💥 Secret Recipe since 1998 💥 100% Crispy",
  hotline: "19955",
  whatsapp: "201000001555",
  address_ar: "شارع الجمهورية، دسوق، كفر الشيخ",
  address_en: "El-Gomhoria St., Desouk, Kafr El-Sheikh",
  working_hours_ar: "12:00 PM — 3:00 AM",
  working_hours_en: "12:00 PM — 3:00 AM",
  footer_about_ar: "بروست الأسد 🦁 أكبر قطعة بروست في دسوق 🔥",
  footer_about_en: "From the heart of Desouk to Egyptian homes — broast with a secret recipe since 1998.",
  primary_color: "#f97316",
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
    return DEFAULT_FRONTEND_SETTINGS;
  }
}

export async function getCategoriesWithItems() {
  try {
    const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    const result = [];

    for (const cat of cats) {
      const itemsList = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.categoryId, cat.id))
        .orderBy(asc(menuItems.sortOrder));

      result.push({
        ...cat,
        items: itemsList,
      });
    }

    return result;
  } catch (err) {
    return [];
  }
}

export async function getMenuData() {
  return await getCategoriesWithItems();
}

export async function getPromo() {
  try {
    const allSettings = await db.select().from(settings);
    const map: Record<string, string> = {};
    for (const s of allSettings) map[s.key] = s.value;

    return {
      marqueeTextAr: map["marquee_text_ar"] || DEFAULT_FRONTEND_SETTINGS.marquee_text_ar,
      marqueeTextEn: map["marquee_text_en"] || DEFAULT_FRONTEND_SETTINGS.marquee_text_en,
      isAvailable: true,
    };
  } catch {
    return {
      marqueeTextAr: DEFAULT_FRONTEND_SETTINGS.marquee_text_ar,
      marqueeTextEn: DEFAULT_FRONTEND_SETTINGS.marquee_text_en,
      isAvailable: true,
    };
  }
}

export async function getAllOrders() {
  try {
    const rawOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const result = [];

    for (const o of rawOrders) {
      const itemsList = await db
        .select()
        .from(orderLines)
        .where(eq(orderLines.orderId, o.id));

      result.push({
        ...o,
        items: itemsList,
      });
    }

    return result;
  } catch (err) {
    return [];
  }
}

export async function getOrdersByNumbers(orderNumbers: string[]) {
  if (!orderNumbers || orderNumbers.length === 0) return [];
  try {
    return await db.select().from(orders).where(inArray(orders.orderNumber, orderNumbers));
  } catch (err) {
    return [];
  }
}

export async function getPassData(code: string) {
  try {
    const [cust] = await db.select().from(customers).where(eq(customers.code, code));
    if (!cust) return null;

    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerCode, code))
      .orderBy(desc(orders.createdAt));

    return {
      customer: cust,
      orders: customerOrders,
    };
  } catch (err) {
    return null;
  }
}
