// src/app/admin-actions.ts

"use server";

import { db } from "@/db/index";
import {
  categories,
  menuItems,
  orders,
  deliveryZones,
  settings,
  orderLines,
} from "@/db/schema";
import { eq, inArray, desc, asc } from "drizzle-orm";
import { ensureSeedDatabase } from "@/db/seed";

export async function saveFrontendSettingsAction(data: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(data)) {
      await db
        .insert(settings)
        .values({ key, value })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value },
        });
    }

    return {
      success: true,
      message: "تم حفظ إعدادات الهوية والـ CMS بنجاح!",
    };
  } catch (err: any) {
    console.error("Error in saveFrontendSettingsAction:", err);
    return {
      success: false,
      error: err?.message || "فشل حفظ إعدادات الـ CMS",
    };
  }
}

export async function adminScanMenuAction(formData: FormData) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !apiKey.startsWith("AIzaSy")) {
      return {
        success: false,
        error: "مفتاح Gemini API غير معرف أو غير صحيح في بيئة العمل.",
      };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "لم يتم اختيار صورة المنيو" };
    }

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");

    const promptText = `
أنت خبير في قراءة وقوائم طعام المطاعم (Menu Parser).
قم بتحليل صورة منيو المطعم المرفقة واستخراج جميع الوجبات والأصناف بدقة 100%.

يجب أن ترجع النتيجة كـ JSON Array فقط بالشكل التالي دون أي نصوص إضافية:
[
  {
    "categoryAr": "وجبات البروست",
    "categoryEn": "Broast Meals",
    "nameAr": "وجبة 4 قطع",
    "nameEn": "4 Pcs Meal",
    "descriptionAr": "قطع دجاج مقرمش + بطاطس + ثومية",
    "descriptionEn": "Crispy chicken + fries + garlic dip",
    "price": 160
  }
]
`;

    const models = [
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-pro",
    ];

    let jsonResponseText = "";

    for (const modelName of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inline_data: {
                      mime_type: file.type || "image/jpeg",
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (res.ok) {
          const result = await res.json();
          const textRes =
            result.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (textRes) {
            jsonResponseText = textRes;
            break;
          }
        }
      } catch (e) {
        console.warn(`Failed model ${modelName}, trying next...`);
      }
    }

    if (!jsonResponseText) {
      return {
        success: false,
        error: "لم ينجح ذكاء Gemini في استخراج بيانات المنيو، يرجى إعادة المحاولة برفع صورة أوضح.",
      };
    }

    const cleanedJson = jsonResponseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsedItems = JSON.parse(cleanedJson);

    return {
      success: true,
      items: parsedItems,
    };
  } catch (err: any) {
    console.error("Error in adminScanMenuAction:", err);
    return {
      success: false,
      error: "حدث خطأ أثناء تحليل الصورة بالذكاء الاصطناعي",
    };
  }
}

export async function adminSaveScannedRowsAction(items: any[]) {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: "لا توجد عناصر للحفظ" };
    }

    const existingCats = await db.select().from(categories);
    const catMap = new Map<string, string>();
    existingCats.forEach((c) => catMap.set(c.nameAr, c.id));

    let maxSort = existingCats.length;

    for (const item of items) {
      const catNameAr = item.categoryAr || "أصناف أخرى";
      let catId = catMap.get(catNameAr);

      if (!catId) {
        catId = `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        maxSort++;
        await db.insert(categories).values({
          id: catId,
          nameAr: catNameAr,
          nameEn: item.categoryEn || catNameAr,
          sortOrder: maxSort,
        });
        catMap.set(catNameAr, catId);
      }

      const itemId = `item-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      await db.insert(menuItems).values({
        id: itemId,
        categoryId: catId,
        nameAr: item.nameAr,
        nameEn: item.nameEn || item.nameAr,
        descriptionAr: item.descriptionAr || "",
        descriptionEn: item.descriptionEn || "",
        price: Number(item.price) || 0,
        imageUrl: "",
        badge: "",
        sortOrder: 1,
        isAvailable: 1,
      });
    }

    return { success: true, message: "تمت إضافة الأصناف المستخرجة للمنيو بنجاح!" };
  } catch (err: any) {
    console.error("Error in adminSaveScannedRowsAction:", err);
    return { success: false, error: "حدث خطأ أثناء حفظ أصناف المنيو" };
  }
}

export async function adminGetAllAction() {
  try {
    let cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    if (!cats || cats.length === 0) {
      await ensureSeedDatabase();
      cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    }

    const items = await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));
    const ords = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const zones = await db.select().from(deliveryZones).orderBy(asc(deliveryZones.sortOrder));
    const setts = await db.select().from(settings);

    return {
      success: true,
      categories: cats,
      items,
      orders: ords,
      zones,
      settings: setts,
    };
  } catch (err: any) {
    console.error("Error in adminGetAllAction:", err);
    return { success: false, error: "فشل جلب بيانات لوحة التحكم" };
  }
}

export async function adminTriggerSeedAction() {
  try {
    await ensureSeedDatabase();
    return { success: true, message: "تمت إعادة تغذية قاعدة البيانات بنجاح!" };
  } catch (err: any) {
    return { success: false, error: err?.message || "فشل التغذية التلقائية" };
  }
}

// Category Actions
export async function adminSaveCategoryAction(cat: any) {
  try {
    if (cat.id) {
      await db
        .update(categories)
        .set({
          nameAr: cat.nameAr,
          nameEn: cat.nameEn,
          sortOrder: cat.sortOrder || 0,
        })
        .where(eq(categories.id, cat.id));
    } else {
      const id = `cat-${Date.now()}`;
      await db.insert(categories).values({
        id,
        nameAr: cat.nameAr,
        nameEn: cat.nameEn,
        sortOrder: cat.sortOrder || 0,
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminDeleteCategoryAction(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// Item Actions
export async function adminSaveItemAction(item: any) {
  try {
    if (item.id) {
      await db
        .update(menuItems)
        .set({
          categoryId: item.categoryId,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          descriptionAr: item.descriptionAr,
          descriptionEn: item.descriptionEn,
          price: Number(item.price),
          imageUrl: item.imageUrl || "",
          badge: item.badge || "",
          sortOrder: item.sortOrder || 0,
          isAvailable: item.isAvailable ? 1 : 0,
        })
        .where(eq(menuItems.id, item.id));
    } else {
      const id = `item-${Date.now()}`;
      await db.insert(menuItems).values({
        id,
        categoryId: item.categoryId,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        descriptionAr: item.descriptionAr || "",
        descriptionEn: item.descriptionEn || "",
        price: Number(item.price),
        imageUrl: item.imageUrl || "",
        badge: item.badge || "",
        sortOrder: item.sortOrder || 0,
        isAvailable: item.isAvailable ? 1 : 0,
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminDeleteItemAction(id: string) {
  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// Order Actions
export async function adminUpdateOrderStatusAction(id: number, status: string) {
  try {
    await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminDeleteOrderAction(id: number) {
  try {
    await db.delete(orders).where(eq(orders.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// Zone Actions
export async function adminSaveZoneAction(zone: any) {
  try {
    if (zone.id) {
      await db
        .update(deliveryZones)
        .set({
          nameAr: zone.nameAr,
          nameEn: zone.nameEn,
          fee: Number(zone.fee),
          estimatedMinutes: Number(zone.estimatedMinutes || 30),
          sortOrder: zone.sortOrder || 0,
        })
        .where(eq(deliveryZones.id, zone.id));
    } else {
      const id = `zone-${Date.now()}`;
      await db.insert(deliveryZones).values({
        id,
        nameAr: zone.nameAr,
        nameEn: zone.nameEn,
        fee: Number(zone.fee),
        estimatedMinutes: Number(zone.estimatedMinutes || 30),
        sortOrder: zone.sortOrder || 0,
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminDeleteZoneAction(id: string) {
  try {
    await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminGetSettingsAction() {
  try {
    const rows = await db.select().from(settings);
    return { success: true, settings: rows };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminSaveSettingsAction(setts: Record<string, string>) {
  return saveFrontendSettingsAction(setts);
}
