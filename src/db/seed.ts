import { db } from "./index";
import { categories, menuItems, deliveryZones, settings } from "./schema";

export async function ensureSeedDatabase() {
  try {
    const existingCats = await db.select().from(categories).limit(1);
    if (existingCats.length > 0) return;

    // Seed Settings
    await db.insert(settings).values([
      { key: "brand_name_ar", value: "بروست الأسد" },
      { key: "brand_name_en", value: "Lion Broast" },
      { key: "logo_url", value: "" },
      { key: "hero_title_ar", value: "أقوى بروست مقرمش وطازج في دسوق" },
      { key: "hero_subtitle_ar", value: "طعم لا يُقاوم وخبرة سنوات من التتبيل السرّي الخاص!" },
      { key: "marquee_text_ar", value: "🔥 توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥" },
      { key: "footer_text_ar", value: "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر." },
      { key: "address_ar", value: "دسوق - شارع الجلاء - بجوار مسجد الإبراهيمي" },
      { key: "working_hours_ar", value: "يومياً من 12 ظهراً حتى 2 صباحاً" },
      { key: "hotline", value: "01000000000" },
      { key: "whatsapp", value: "201000000000" },
      { key: "delivery_fee", value: "15" },
      { key: "tax_percent", value: "0" },
    ]);

    // Seed Categories
    await db.insert(categories).values([
      { id: "cat-broast", nameAr: "وجبات البروست", nameEn: "Broast Meals", sortOrder: 1 },
      { id: "cat-strips", nameAr: "وجبات الاستريبس", nameEn: "Strips Meals", sortOrder: 2 },
      { id: "cat-sandwiches", nameAr: "السندوتشات", nameEn: "Sandwiches", sortOrder: 3 },
      { id: "cat-sides", nameAr: "المقبلات والجانبية", nameEn: "Sides & Extras", sortOrder: 4 },
    ]);

    // Seed Delivery Zones
    await db.insert(deliveryZones).values([
      { id: "zone-desouk-center", nameAr: "وسط البلد - دسوق", nameEn: "Desouk Center", fee: 15, estimatedMinutes: 25, sortOrder: 1 },
      { id: "zone-galaa", nameAr: "شارع الجلاء والشركات", nameEn: "Galaa St", fee: 15, estimatedMinutes: 20, sortOrder: 2 },
      { id: "zone-ibrahimi", nameAr: "محيط المسجد الإبراهيمي", nameEn: "Ibrahimi Mosque Area", fee: 15, estimatedMinutes: 20, sortOrder: 3 },
      { id: "zone-outskirts", nameAr: "أطراف دسوق والقرى المجاورة", nameEn: "Outskirts", fee: 25, estimatedMinutes: 40, sortOrder: 4 },
    ]);

    // Seed Menu Items
    await db.insert(menuItems).values([
      {
        id: "item-broast-4",
        categoryId: "cat-broast",
        nameAr: "وجبة بروست 4 قطع",
        nameEn: "4 Pcs Broast Meal",
        descriptionAr: "4 قطع دجاج بروست مقرمش + بطاطس + ثومية + خبز + كول سلو",
        descriptionEn: "4 pcs crispy broast chicken + fries + garlic sauce + bun + coleslaw",
        price: 160,
        imageUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=600",
        badge: "bestseller",
        sortOrder: 1,
        isAvailable: 1,
      },
      {
        id: "item-broast-8",
        categoryId: "cat-broast",
        nameAr: "وجبة عائلية 8 قطع",
        nameEn: "8 Pcs Family Meal",
        descriptionAr: "8 قطع بروست مقرمش + بطاطس عائلي + 2 ثومية + 2 كول سلو + 4 خبز",
        descriptionEn: "8 pcs crispy broast + large fries + 2 garlic + 2 coleslaw + 4 buns",
        price: 310,
        imageUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=600",
        badge: "bestseller",
        sortOrder: 2,
        isAvailable: 1,
      },
      {
        id: "item-strips-5",
        categoryId: "cat-strips",
        nameAr: "وجبة استريبس 5 قطع",
        nameEn: "5 Pcs Strips Meal",
        descriptionAr: "5 قطع صدور دجاج مقرمشة حار/عادي + بطاطس + ثومية + خبز",
        descriptionEn: "5 pcs crispy chicken strips + fries + garlic + bun",
        price: 140,
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=600",
        badge: "spicy",
        sortOrder: 3,
        isAvailable: 1,
      },
      {
        id: "item-zinger-burger",
        categoryId: "cat-sandwiches",
        nameAr: "ساندوتش زينجر الأسد",
        nameEn: "Lion Zinger Sandwich",
        descriptionAr: "قطعة دجاج حار كبيرة + جبنة شيدر + خس + صوص أسد خاص",
        descriptionEn: "Large spicy chicken breast + cheddar + lettuce + lion sauce",
        price: 90,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
        badge: "bestseller",
        sortOrder: 4,
        isAvailable: 1,
      },
    ]);
  } catch (err) {
    console.error("Error running seed:", err);
  }
}

export const ensureSeed = ensureSeedDatabase;
