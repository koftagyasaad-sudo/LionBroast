import { db } from "@/db";
import { categories, menuItems, deliveryZones, settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function ensureSeedDatabase() {
  try {
    const existingCats = await db.select().from(categories);
    if (existingCats.length > 0) {
      return { seeded: false, message: "قاعدة البيانات تحتوي بالفعل على بيانات." };
    }

    console.log("🌱 بدء تغذية قاعدة بيانات Neon بالبيانات الأولية لـ بروست الأسد...");

    // 1. Insert Categories
    const insertedCats = await db
      .insert(categories)
      .values([
        { nameAr: "وجبات البروست", nameEn: "Broast Meals", icon: "🍗", sortOrder: 1 },
        { nameAr: "وجبات الستريبس", nameEn: "Strips Meals", icon: "🔥", sortOrder: 2 },
        { nameAr: "الساندوتشات", nameEn: "Sandwiches", icon: "🍔", sortOrder: 3 },
        { nameAr: "المقبلات والأصناف الجانبية", nameEn: "Sides & Appetizers", icon: "🍟", sortOrder: 4 },
        { nameAr: "المشروبات والحلويات", nameEn: "Drinks & Desserts", icon: "🥤", sortOrder: 5 },
      ])
      .returning();

    const catMap = new Map<string, number>();
    insertedCats.forEach((c) => catMap.set(c.nameAr, c.id));

    // 2. Insert Menu Items
    const broastCatId = catMap.get("وجبات البروست")!;
    const stripsCatId = catMap.get("وجبات الستريبس")!;
    const sandwichCatId = catMap.get("الساندوتشات")!;
    const sidesCatId = catMap.get("المقبلات والأصناف الجانبية")!;
    const drinksCatId = catMap.get("المشروبات والحلويات")!;

    await db.insert(menuItems).values([
      // Broast
      {
        categoryId: broastCatId,
        nameAr: "وجبة بروست 4 قطع",
        nameEn: "4 Pcs Broast Meal",
        descriptionAr: "4 قطع دجاج كرسبي طازج + بطاطس + ثومية + كول سلو + خبز",
        descriptionEn: "4 pcs crispy chicken + fries + garlic dip + coleslaw + bread",
        price: 18000, // 180 EGP
        imageUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80",
        badge: "الأكثر طلباً 🔥",
        isAvailable: true,
        sortOrder: 1,
      },
      {
        categoryId: broastCatId,
        nameAr: "وجبة بروست 8 قطع عائلية",
        nameEn: "8 Pcs Family Broast Meal",
        descriptionAr: "8 قطع بروست مقرمش + بطاطس حجم عائلي + 2 ثومية + 2 كول سلو + 4 خبز",
        descriptionEn: "8 pcs crispy broast + family fries + 2 garlic + 2 coleslaw + 4 bread",
        price: 34000, // 340 EGP
        imageUrl: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
        badge: "توفير عائلي",
        isAvailable: true,
        sortOrder: 2,
      },
      {
        categoryId: broastCatId,
        nameAr: "وجبة بروست 12 قطعة الأسد",
        nameEn: "12 Pcs Lion Feast Broast",
        descriptionAr: "12 قطعة دجاج كرسبي + 2 بطاطس كبير + لتر كولا + مقبلات مشكلة",
        descriptionEn: "12 pcs crispy chicken + 2 large fries + 1L Cola + mix appetizers",
        price: 49000, // 490 EGP
        imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
        badge: "وليمة الأسد 🦁",
        isAvailable: true,
        sortOrder: 3,
      },

      // Strips
      {
        categoryId: stripsCatId,
        nameAr: "وجبة ستريبس 5 قطع نار",
        nameEn: "5 Pcs Fire Strips Meal",
        descriptionAr: "5 قطع صدور دجاج كرسبي نارية + صوص هالبينو مدخن + بطاطس + ثومية",
        descriptionEn: "5 pcs spicy chicken strips + smoked jalapeño dip + fries + garlic dip",
        price: 16500, // 165 EGP
        imageUrl: "https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=800&q=80",
        badge: "حار نار 🌶️",
        isAvailable: true,
        sortOrder: 1,
      },

      // Sandwiches
      {
        categoryId: sandwichCatId,
        nameAr: "ساندوتش بروست الأسد السوبر",
        nameEn: "Super Broast El-Assad Sandwich",
        descriptionAr: "قطعة صدور دجاج جامبو + جبنة شيدر سائبة + تركيا مدخن + صوص الأسد الخاص",
        descriptionEn: "Jumbo chicken breast + cheddar cheese + smoked turkey + special Assad sauce",
        price: 12000, // 120 EGP
        imageUrl: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",
        badge: "مميز جداً",
        isAvailable: true,
        sortOrder: 1,
      },

      // Sides
      {
        categoryId: sidesCatId,
        nameAr: "بطاطس كرسبي مع صوص الجبن",
        nameEn: "Crispy Cheese Fries",
        descriptionAr: "طبق بطاطس مقرمشة مغطاة بصوص الشيدر الذهبي الساخن",
        descriptionEn: "Crispy fries topped with warm golden cheddar cheese sauce",
        price: 4500, // 45 EGP
        imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
        sortOrder: 1,
      },
      {
        categoryId: sidesCatId,
        nameAr: "سلاطة كول سلو طازجة",
        nameEn: "Fresh Coleslaw Salad",
        descriptionAr: "كرنب وجزر طازج بصوص المايونيز والعسل الخاص",
        descriptionEn: "Fresh cabbage and carrots with honey mayonnaise dressing",
        price: 2500, // 25 EGP
        imageUrl: "https://images.unsplash.com/photo-1625938146369-ad8278f9f743?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
        sortOrder: 2,
      },

      // Drinks
      {
        categoryId: drinksCatId,
        nameAr: "كانز بيبسي / سفن أب 330 مل",
        nameEn: "Pepsi / 7Up Can 330ml",
        descriptionAr: "مشروب غازي بارد 330 مل",
        descriptionEn: "Cold carbonated drink 330ml",
        price: 2000, // 20 EGP
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
        sortOrder: 1,
      },
    ]);

    // 3. Insert Delivery Zones
    await db.insert(deliveryZones).values([
      { nameAr: "دسوق - وسط البلد وشارع الجمهورية", nameEn: "Desouk Downtown & Gomhoria St.", fee: 1500, estimatedTime: "25-35 دقيقة", isAvailable: true },
      { nameAr: "دسوق - حي المدارس والإنشاءات", nameEn: "Desouk El-Madares & Enshaat", fee: 2000, estimatedTime: "30-40 دقيقة", isAvailable: true },
      { nameAr: "دسوق - شباس الملح والمناطق المجاورة", nameEn: "Shabas El-Melh & Nearby Areas", fee: 3500, estimatedTime: "40-50 دقيقة", isAvailable: true },
    ]);

    // 4. Insert Default Frontend Settings
    const defaultSettings = [
      { key: "brand_ar", value: "بروست الأسد" },
      { key: "brand_en", value: "Broast El-Assad" },
      { key: "logo_url", value: "" },
      { key: "hero_title_ar", value: "الحار اللي يولع" },
      { key: "hero_title_en", value: "The Fire Edition" },
      { key: "hero_subtitle_ar", value: "ستريبس النار بغمسة الهالبينو المدخنة. خصم 20% طوال الأسبوع – جربها لو قدها." },
      { key: "hero_subtitle_en", value: "Fire strips with smoked jalapeño dip. 20% off all week – try it if you dare." },
      { key: "hero_image_url", value: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1200&q=80" },
      { key: "marquee_text_ar", value: "دجاج طازج يومياً 💥 تتبيلة سرية منذ 1998 💥 كرسبي 100%" },
      { key: "marquee_text_en", value: "Fresh Chicken Daily 💥 Secret Recipe since 1998 💥 100% Crispy" },
      { key: "hotline", value: "19955" },
      { key: "whatsapp", value: "201000001555" },
      { key: "address_ar", value: "شارع الجمهورية، دسوق، كفر الشيخ" },
      { key: "address_en", value: "El-Gomhoria St., Desouk, Kafr El-Sheikh" },
      { key: "working_hours_ar", value: "12:00 PM — 3:00 AM" },
      { key: "working_hours_en", value: "12:00 PM — 3:00 AM" },
      { key: "footer_about_ar", value: "بروست الأسد 🦁 أكبر قطعة بروست في دسوق 🔥 سر الطعم المقرمش والتتبيلة الأصيلة." },
      { key: "footer_about_en", value: "From the heart of Desouk to Egyptian homes — broast with a secret recipe since 1998." },
      { key: "primary_color", value: "#f97316" },
    ];

    for (const s of defaultSettings) {
      await db.insert(settings).values({ key: s.key, value: s.value, updatedAt: new Date() }).onConflictDoNothing();
    }

    console.log("✅ تم تغذية قاعدة بيانات Neon بنجاح!");
    return { success: true, message: "تمت تغذية قاعدة بيانات Neon بجميع البيانات بنجاح!" };
  } catch (err: any) {
    console.error("فشل تغذية قاعدة البيانات:", err);
    return { success: false, error: err?.message || "حدث خطأ أثناء التغذية" };
  }
}
