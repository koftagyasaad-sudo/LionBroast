// src/db/seed.ts

import { db } from "./index";
import { categories, menuItems, deliveryZones, settings } from "./schema";

export async function ensureSeedDatabase() {
  try {
    const existingCats = await db.select().from(categories).limit(1);
    if (existingCats && existingCats.length > 0) {
      return;
    }

    console.log("Seeding initial data for Broast El-Assad...");

    await db.insert(categories).values([
      { id: "broast", nameAr: "وجبات البروست", nameEn: "Broast Meals", sortOrder: 1 },
      { id: "sandwiches", nameAr: "الساندوتشات", nameEn: "Sandwiches", sortOrder: 2 },
      { id: "sides", nameAr: "المقبلات والإضافات", nameEn: "Sides & Extras", sortOrder: 3 },
      { id: "drinks", nameAr: "المشروبات", nameEn: "Drinks", sortOrder: 4 },
    ]);

    await db.insert(menuItems).values([
      {
        id: "broast-4pcs",
        categoryId: "broast",
        nameAr: "وجبة بروست 4 قطع",
        nameEn: "4 Pcs Broast Meal",
        descriptionAr: "4 قطع دجاج مقرمش + بطاطس + ثومية + خبز + كول سلو",
        descriptionEn: "4 Pcs Crispy Chicken + Fries + Garlic Dip + Bread + Coleslaw",
        price: 160,
        imageUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?q=80&w=600&auto=format&fit=crop",
        badge: "الأكثر مبيعاً",
        sortOrder: 1,
        isAvailable: 1,
      },
      {
        id: "broast-8pcs",
        categoryId: "broast",
        nameAr: "وجبة بروست 8 قطع (عائلية)",
        nameEn: "8 Pcs Family Broast Meal",
        descriptionAr: "8 قطع دجاج مقرمش + 2 بطاطس + 2 ثومية + 4 خبز + كول سلو كبير",
        descriptionEn: "8 Pcs Crispy Chicken + 2 Fries + 2 Garlic Dips + 4 Bread + Large Coleslaw",
        price: 310,
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=600&auto=format&fit=crop",
        badge: "عائلي",
        sortOrder: 2,
        isAvailable: 1,
      },
      {
        id: "broast-12pcs",
        categoryId: "broast",
        nameAr: "وجبة بروست 12 قطعة (الأسد)",
        nameEn: "12 Pcs Lion Broast Meal",
        descriptionAr: "12 قطعة دجاج مقرمش + 3 بطاطس + 3 ثومية + 6 خبز + 2 كول سلو",
        descriptionEn: "12 Pcs Crispy Chicken + 3 Fries + 3 Garlic Dips + 6 Bread + 2 Coleslaw",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=600&auto=format&fit=crop",
        badge: "عرض التوفير",
        sortOrder: 3,
        isAvailable: 1,
      },
      {
        id: "zinger-burger",
        categoryId: "sandwiches",
        nameAr: "ساندوتش زنوجير أسد",
        nameEn: "Zinger Assad Sandwich",
        descriptionAr: "صدر دجاج حار مقرمش + جبنة شيدر + خس + صوص أسد خاص",
        descriptionEn: "Spicy Crispy Chicken Breast + Cheddar Cheese + Lettuce + Special Assad Sauce",
        price: 85,
        imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?q=80&w=600&auto=format&fit=crop",
        badge: "حار",
        sortOrder: 4,
        isAvailable: 1,
      },
      {
        id: "french-fries",
        categoryId: "sides",
        nameAr: "بطاطس محمرة عائلية",
        nameEn: "Family French Fries",
        descriptionAr: "بطاطس طازجة مقرمشة مع بهارات الأسد الخاصة",
        descriptionEn: "Fresh Crispy Fries with Special Assad Seasoning",
        price: 40,
        imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop",
        badge: "",
        sortOrder: 5,
        isAvailable: 1,
      },
      {
        id: "pepsi-can",
        categoryId: "drinks",
        nameAr: "بيبسي كانز",
        nameEn: "Pepsi Can",
        descriptionAr: "مشروب غازي منعش 330 مل",
        descriptionEn: "Refreshing Soft Drink 330ml",
        price: 20,
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop",
        badge: "",
        sortOrder: 6,
        isAvailable: 1,
      },
    ]);

    await db.insert(deliveryZones).values([
      { id: "center", nameAr: "وسط البلد - شارع الجيش", nameEn: "Downtown - El Gaish St", fee: 15, estimatedMinutes: 25, sortOrder: 1 },
      { id: "dahr-el-temsah", nameAr: "ظهر التمساح والكرنيش", nameEn: "Dahr El-Temsah & Corniche", fee: 20, estimatedMinutes: 30, sortOrder: 2 },
      { id: "el-moalemin", nameAr: "حي المعلمين والمستشفى", nameEn: "El-Moalemin & Hospital Zone", fee: 25, estimatedMinutes: 35, sortOrder: 3 },
      { id: "outskirts", nameAr: "ضواحي دسوق والقرى المجاورة", nameEn: "Desouk Outskirts & Villages", fee: 35, estimatedMinutes: 45, sortOrder: 4 },
    ]);

    await db.insert(settings).values([
      { key: "brand_name", value: "بروست الأسد" },
      { key: "logo_url", value: "" },
      { key: "hero_title_ar", value: "أفضل بروستد في دسوق" },
      { key: "hero_title_en", value: "Best Broast in Desouk" },
      { key: "hero_desc_ar", value: "دجاج طازج يومياً، تتبيلة سرية، وقرمشة لا تقاوم!" },
      { key: "hero_desc_en", value: "Fresh daily chicken, secret seasoning, irresistible crunch!" },
      { key: "marquee_ar", value: "🔥 خصم 10% على الطلب الأول عبر الموقع! | 🚀 توصيل سريع لجميع مناطق دسوق | 🍗 جرب البروست الحار الآن!" },
      { key: "marquee_en", value: "🔥 10% OFF your first order! | 🚀 Fast delivery across Desouk | 🍗 Try our Spicy Broast now!" },
      { key: "footer_text_ar", value: "بروست الأسد - طعم القرمشة الحقيقية في دسوق." },
      { key: "footer_text_en", value: "Broast El-Assad - Real Crispy Taste in Desouk." },
      { key: "address_ar", value: "دسوق - شارع الجيش - بجوار عمر أفندي" },
      { key: "address_en", value: "Desouk - El-Gaish St - Next to Omar Effendi" },
      { key: "working_hours_ar", value: "يومياً من 12 ظهراً حتى 2 صباحاً" },
      { key: "working_hours_en", value: "Daily from 12:00 PM to 2:00 AM" },
      { key: "hotline", value: "19999" },
      { key: "whatsapp_number", value: "201012345678" },
    ]);

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Error in ensureSeedDatabase:", err);
  }
}

export const ensureSeed = ensureSeedDatabase;
