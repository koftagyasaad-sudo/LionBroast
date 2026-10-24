import { db } from "@/db";
import { categories, deliveryZones, menuItems, settings } from "@/db/schema";
import { ensureSchema } from "@/db/ensure";
import { IMG } from "@/lib/img";
import { sql } from "drizzle-orm";

/** Idempotent bootstrap seed — runs once on first data request. */
export async function ensureSeed(): Promise<void> {
  await ensureSchema();
  const c = await db.execute(sql`SELECT count(*)::int AS n FROM categories`);
  const n = (c.rows?.[0] as { n?: number } | undefined)?.n ?? 0;
  if (n > 0) return;

  const cats = await db
    .insert(categories)
    .values([
      { nameAr: "البروست الأسطوري", nameEn: "Legendary Broast", image: IMG.broast, sortOrder: 0 },
      { nameAr: "الوجبات والكومبو", nameEn: "Meals & Combos", image: IMG.bucket, sortOrder: 1 },
      { nameAr: "ساندوتشات كرانشي", nameEn: "Crunchy Sandwiches", image: IMG.burger, sortOrder: 2 },
      { nameAr: "المقبلات والصوصات", nameEn: "Sides & Sauces", image: IMG.fries, sortOrder: 3 },
      { nameAr: "المشروبات", nameEn: "Beverages", image: IMG.dips, sortOrder: 4 },
    ])
    .returning();

  const byEn = Object.fromEntries(cats.map((c) => [c.nameEn, c.id]));
  const cat = (en: string) => byEn[en];

  await db.insert(menuItems).values([
    // ---------------- Broast ----------------
    {
      categoryId: cat("Legendary Broast"),
      nameAr: "بروست 4 قطع",
      nameEn: "4-Pc Lion Broast",
      descriptionAr: "أربع قطع دجاج طازة متبلة ١٢ ساعة في تتبيلة الأسد السرية ثم مكبوسة لتطلع كرسبي من بره وهشة من جوه.",
      descriptionEn: "Four fresh chicken cuts, marinated 12 hours in the secret Lion blend, pressure-fried for a shattering crust.",
      price: 165,
      sizes: [
        { id: "single", ar: "سنجل", en: "Single", price: 165 },
        { id: "meal", ar: "وجبة (+ بطاطس ومشروب)", en: "Meal (+fries & drink)", price: 199 },
      ],
      spicyOption: true,
      isBestSeller: true,
      image: IMG.broast,
      sortOrder: 0,
    },
    {
      categoryId: cat("Legendary Broast"),
      nameAr: "ربع دجاجة بروست",
      nameEn: "Quarter Broast",
      descriptionAr: "ربع دجاجة كامل بجلد ذهبي مقرمش، يقدم مع عيش بلدي وصوص الثوم.",
      descriptionEn: "A full quarter chicken with a golden crust, served with baladi bread and garlic sauce.",
      price: 98,
      sizes: [
        { id: "single", ar: "سنجل", en: "Single", price: 98 },
        { id: "meal", ar: "وجبة (+ بطاطس ومشروب)", en: "Meal (+fries & drink)", price: 128 },
      ],
      spicyOption: true,
      image: IMG.drumsticks,
      sortOrder: 1,
    },
    {
      categoryId: cat("Legendary Broast"),
      nameAr: "أجنحة الأسد",
      nameEn: "Lion Wings",
      descriptionAr: "أجنحة متبلة بخلطة الشطة المدخنة، مقلية مرتين لأقصى كرانش.",
      descriptionEn: "Wings marinated in smoked chili blend, double-fried for maximum crunch.",
      price: 118,
      sizes: [
        { id: "8pc", ar: "٨ قطع", en: "8 pcs", price: 118 },
        { id: "12pc", ar: "١٢ قطعة", en: "12 pcs", price: 168 },
      ],
      spicyOption: true,
      isBestSeller: true,
      image: IMG.wings,
      sortOrder: 2,
    },
    {
      categoryId: cat("Legendary Broast"),
      nameAr: "ستريبس النار",
      nameEn: "Fire Strips",
      descriptionAr: "شرائح صدور دجاج كرسبي بغمسة الهالبينو الحارة — للي بيحب اللعب بالنار.",
      descriptionEn: "Crispy chicken-breast strips tossed in hot jalapeño glaze — play with fire.",
      price: 125,
      sizes: [
        { id: "5pc", ar: "٥ قطع", en: "5 pcs", price: 125 },
        { id: "8pc", ar: "٨ قطع", en: "8 pcs", price: 185 },
      ],
      isBestSeller: true,
      image: IMG.strips,
      sortOrder: 3,
    },
    // ---------------- Combos ----------------
    {
      categoryId: cat("Meals & Combos"),
      nameAr: "كومبو الأسد الملكي",
      nameEn: "Royal Lion Combo",
      descriptionAr: "٩ قطع بروست + بطاطس عائلية + كول سلو + ٢ مشروب غازي + عيش بلدي. يكفي ٣-٤ أفراد.",
      descriptionEn: "9 broast pcs + family fries + coleslaw + 2 soft drinks + baladi bread. Feeds 3–4.",
      price: 345,
      spicyOption: true,
      isBestSeller: true,
      image: IMG.bucket,
      sortOrder: 0,
    },
    {
      categoryId: cat("Meals & Combos"),
      nameAr: "وليمة العيلة",
      nameEn: "Family Feast",
      descriptionAr: "١٥ قطعة بروست + بطاطس عائلية + ٢ كول سلو + ٤ مشروبات + ٤ صوصات. العزومة جاهزة.",
      descriptionEn: "15 broast pcs + family fries + 2 coleslaw + 4 drinks + 4 sauces. The full spread.",
      price: 485,
      spicyOption: true,
      isBestSeller: true,
      image: IMG.heroCombo,
      sortOrder: 1,
    },
    {
      categoryId: cat("Meals & Combos"),
      nameAr: "توينز بوكس",
      nameEn: "Twins Box",
      descriptionAr: "٢ ساندوتش زنجر + بطاطس وسط + ٢ مشروب غازي. خيار السهرة السريع.",
      descriptionEn: "2 zinger sandwiches + medium fries + 2 soft drinks. The quick night fix.",
      price: 225,
      image: IMG.burger4,
      sortOrder: 2,
    },
    // ---------------- Sandwiches ----------------
    {
      categoryId: cat("Crunchy Sandwiches"),
      nameAr: "زنجر الأسد",
      nameEn: "Lion Zinger",
      descriptionAr: "فيليه دجاجة حار متبل ومقرمش، صوص خاص، خس وشيدر في عيش بريوش محمص.",
      descriptionEn: "Hot marinated crispy fillet, house sauce, lettuce and cheddar in a toasted brioche bun.",
      price: 95,
      sizes: [
        { id: "single", ar: "سنجل", en: "Single", price: 95 },
        { id: "double", ar: "دبل لحم", en: "Double fillet", price: 145 },
      ],
      spicyOption: true,
      isBestSeller: true,
      image: IMG.burger,
      sortOrder: 0,
    },
    {
      categoryId: cat("Crunchy Sandwiches"),
      nameAr: "تشيزي كرانش",
      nameEn: "Cheesy Crunch",
      descriptionAr: "فيليه كرسبي مغطى بشلل صوص الشيدر الذهبي مع شرائح الجبنة المذابة.",
      descriptionEn: "Crispy fillet drowned in golden cheddar sauce with molten cheese slices.",
      price: 108,
      image: IMG.burger2,
      sortOrder: 1,
    },
    {
      categoryId: cat("Crunchy Sandwiches"),
      nameAr: "كرانشي رانش",
      nameEn: "Crunchy Ranch",
      descriptionAr: "فيليه مقرمش بصوص الرانش الكريمي، خس طازة وبصل كراميل.",
      descriptionEn: "Crunchy fillet with creamy ranch, fresh lettuce and caramelized onions.",
      price: 102,
      image: IMG.burger3,
      sortOrder: 2,
    },
    {
      categoryId: cat("Crunchy Sandwiches"),
      nameAr: "تورنادو راب",
      nameEn: "Tornado Wrap",
      descriptionAr: "راب شيلا محشي ستريبس كرسبي، صوص ديناميت وخضار مقرمشة — يلف في إيدك صح.",
      descriptionEn: "Tortilla wrap stuffed with crispy strips, dynamite sauce and crunchy veggies.",
      price: 78,
      spicyOption: true,
      image: IMG.burger4,
      sortOrder: 3,
    },
    // ---------------- Sides ----------------
    {
      categoryId: cat("Sides & Sauces"),
      nameAr: "بطاطس الأسد",
      nameEn: "Lion Fries",
      descriptionAr: "أصابع بطاطس ذهبية متبلة ببهارات الكرسبي، مقلية على درجة حرارة مظبوطة.",
      descriptionEn: "Golden fries seasoned with crispy spice blend, fried at the perfect temp.",
      price: 45,
      sizes: [
        { id: "m", ar: "وسط", en: "Medium", price: 45 },
        { id: "l", ar: "كبير", en: "Large", price: 62 },
      ],
      image: IMG.fries,
      sortOrder: 0,
    },
    {
      categoryId: cat("Sides & Sauces"),
      nameAr: "حلقات البصل",
      nameEn: "Onion Rings",
      descriptionAr: "حلقات بصل حلوة في كساء كرسبي ذهبي سميك.",
      descriptionEn: "Sweet onion rings in a thick golden crispy coating.",
      price: 55,
      image: IMG.rings,
      sortOrder: 1,
    },
    {
      categoryId: cat("Sides & Sauces"),
      nameAr: "كول سلو",
      nameEn: "Coleslaw",
      descriptionAr: "كرنب وجزر طازة بصوص كريمي خفيف — التوازن المثالي مع الحار.",
      descriptionEn: "Fresh cabbage & carrots in a light creamy sauce — the perfect heat balance.",
      price: 28,
      image: IMG.dips,
      sortOrder: 2,
    },
    {
      categoryId: cat("Sides & Sauces"),
      nameAr: "صوص الأسد الحار",
      nameEn: "Lion Fire Sauce",
      descriptionAr: "الصوص اللي بينتهي قبل الأكل. حرقته متدرجة وطعمه مدمن.",
      descriptionEn: "The sauce that finishes before the food. Layered heat, addictive flavor.",
      price: 15,
      image: IMG.ketchup,
      sortOrder: 3,
    },
    // ---------------- Beverages ----------------
    {
      categoryId: cat("Beverages"),
      nameAr: "مشروب غازي",
      nameEn: "Soft Drink",
      descriptionAr: "بيبسي، ميرندا، سفن أب — كانز مثلج ٣٣٠ مل.",
      descriptionEn: "Pepsi, Mirinda, 7Up — chilled 330ml can.",
      price: 25,
      image: IMG.dips,
      sortOrder: 0,
    },
    {
      categoryId: cat("Beverages"),
      nameAr: "عصير مانجو طازج",
      nameEn: "Fresh Mango Juice",
      descriptionAr: "مانجو بلدي مصفى طازة يومياً.",
      descriptionEn: "Local mango, freshly strained daily.",
      price: 38,
      image: IMG.dips,
      sortOrder: 1,
    },
    {
      categoryId: cat("Beverages"),
      nameAr: "ليمون بالنعناع",
      nameEn: "Mint Lemon Slush",
      descriptionAr: "سلاش ليمون نعناع ساقع — بيطفي النار.",
      descriptionEn: "Icy mint-lemon slush — puts out the fire.",
      price: 35,
      image: IMG.dips,
      sortOrder: 2,
    },
    {
      categoryId: cat("Beverages"),
      nameAr: "مياه معدنية",
      nameEn: "Mineral Water",
      descriptionAr: "زجاجة مياه ٦٠٠ مل.",
      descriptionEn: "600ml bottled water.",
      price: 12,
      image: IMG.dips,
      sortOrder: 3,
    },
  ]);

  await db.insert(deliveryZones).values([
    { nameAr: "وسط دسوق", nameEn: "Central Desouk", price: 15, sortOrder: 0 },
    { nameAr: "حي الجمهورية", nameEn: "El-Gomhoria District", price: 20, sortOrder: 1 },
    { nameAr: "منطقة كوبري السيالة", nameEn: "El-Seyala Bridge Area", price: 25, sortOrder: 2 },
    { nameAr: "الطريق الزراعي", nameEn: "Agricultural Road", price: 30, sortOrder: 3 },
    { nameAr: "القرى المجاورة", nameEn: "Nearby Villages", price: 45, sortOrder: 4 },
  ]);

  await db.insert(settings).values([
    { key: "promo_enabled", value: "true" },
    {
      key: "promo_text_ar",
      value: "عرض الأسبوع: خصم 20% على ستريبس النار + توصيل مجاني داخل وسط دسوق",
    },
    {
      key: "promo_text_en",
      value: "Deal of the week: 20% off Fire Strips + free delivery inside Central Desouk",
    },
  ]);
}
