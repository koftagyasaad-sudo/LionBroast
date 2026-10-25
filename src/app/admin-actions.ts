"use server";

import { db } from "@/db";
import { categories, menuItems, deliveryZones, settings, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ensureSeedDatabase } from "@/db/seed";
import { mapCategoryToDTO, mapMenuItemToDTO, mapZoneToDTO } from "@/db/queries";

export async function adminScanMenuAction(formData: FormData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GEMINI_API_KEY غير معرف في بيئة العمل Vercel" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "لم يتم اختيار أي صورة" };
  }

  const buffer = await file.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString("base64");
  const mimeType = file.type || "image/jpeg";

  const promptText = `أنت خبير في تحليلات قوائم الطعام للمطاعم. قم بتحليل صورة قائمة الطعام المرفقة واستخرج جميع الأصناف والأقسام باللغة العربية.
أرجع النتيجة بصيغة JSON فقط، بدون أي نص إضافي أو ماركداون، وفق الهيكل التالي:
{
  "items": [
    {
      "categoryName": "اسم القسم (مثل: وجبات البروست, السندوتشات, العروض)",
      "nameAr": "اسم الوجبة/الصنف بالعربية",
      "descriptionAr": "وصف الوجبة أو المكونات إن وجدت",
      "price": 120,
      "spicyOption": false,
      "isBestSeller": false
    }
  ]
}`;

  const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
  let resultText = "";
  let lastErr = "";

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!res.ok) {
        const errJson = await res.json();
        lastErr = errJson.error?.message || res.statusText;
        continue;
      }

      const jsonRes = await res.json();
      resultText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (resultText) break;
    } catch (err: any) {
      lastErr = err.message;
    }
  }

  if (!resultText) {
    return { success: false, error: `فشل الاتصال بـ Gemini API: ${lastErr}` };
  }

  try {
    const cleanedText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedText);
    return { success: true, data: parsed.items || [] };
  } catch {
    return { success: false, error: "تعذر استخراج بيانات JSON صحيحة من الصورة" };
  }
}

export async function adminSaveSettingsAction(payload: Record<string, string>) {
  await ensureSeedDatabase();
  try {
    for (const [key, val] of Object.entries(payload)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(settings).set({ value: String(val) }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value: String(val) });
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminGetAllAction() {
  await ensureSeedDatabase();
  const [cats, items, zonesList, settingsList, ordersList] = await Promise.all([
    db.select().from(categories).orderBy(categories.sortOrder),
    db.select().from(menuItems).orderBy(menuItems.sortOrder),
    db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder),
    db.select().from(settings),
    db.select().from(orders),
  ]);

  return {
    categories: cats.map(mapCategoryToDTO),
    items: items.map(mapMenuItemToDTO),
    zones: zonesList.map(mapZoneToDTO),
    settings: settingsList,
    orders: ordersList,
  };
}

export async function adminSaveCategoryAction(data: { id?: string; nameAr: string; nameEn?: string; sortOrder?: number }) {
  await ensureSeedDatabase();
  if (data.id) {
    await db
      .update(categories)
      .set({
        nameAr: data.nameAr,
        nameEn: data.nameEn || data.nameAr,
        sortOrder: data.sortOrder || 0,
      })
      .where(eq(categories.id, data.id));
  } else {
    const newId = `cat-${Date.now()}`;
    await db.insert(categories).values({
      id: newId,
      nameAr: data.nameAr,
      nameEn: data.nameEn || data.nameAr,
      sortOrder: data.sortOrder || 0,
    });
  }
  return { success: true };
}

export async function adminDeleteCategoryAction(id: string) {
  await ensureSeedDatabase();
  await db.delete(categories).where(eq(categories.id, id));
  return { success: true };
}

export async function adminSaveItemAction(data: any) {
  await ensureSeedDatabase();
  const badgeParts = [];
  if (data.spicyOption) badgeParts.push("spicy");
  if (data.isBestSeller) badgeParts.push("bestseller");
  const badgeVal = badgeParts.join(",") || null;

  if (data.id) {
    await db
      .update(menuItems)
      .set({
        categoryId: data.categoryId,
        nameAr: data.nameAr,
        nameEn: data.nameEn || data.nameAr,
        descriptionAr: data.descriptionAr || "",
        descriptionEn: data.descriptionEn || "",
        price: Number(data.price || 0),
        imageUrl: data.image || data.imageUrl || "",
        badge: badgeVal,
        isAvailable: data.isAvailable ? 1 : 0,
        sortOrder: data.sortOrder || 0,
      })
      .where(eq(menuItems.id, data.id));
  } else {
    const newId = `item-${Date.now()}`;
    await db.insert(menuItems).values({
      id: newId,
      categoryId: data.categoryId,
      nameAr: data.nameAr,
      nameEn: data.nameEn || data.nameAr,
      descriptionAr: data.descriptionAr || "",
      descriptionEn: data.descriptionEn || "",
      price: Number(data.price || 0),
      imageUrl: data.image || data.imageUrl || "",
      badge: badgeVal,
      isAvailable: data.isAvailable ? 1 : 0,
      sortOrder: data.sortOrder || 0,
    });
  }
  return { success: true };
}

export async function adminDeleteItemAction(id: string) {
  await ensureSeedDatabase();
  await db.delete(menuItems).where(eq(menuItems.id, id));
  return { success: true };
}

export async function adminUpdateOrderStatusAction(orderId: string | number, status: string) {
  await ensureSeedDatabase();
  const numericId = Number(orderId);
  await db.update(orders).set({ status }).where(eq(orders.id, numericId));
  return { success: true };
}

export async function adminDeleteOrderAction(id: string | number) {
  await ensureSeedDatabase();
  const numericId = Number(id);
  await db.delete(orders).where(eq(orders.id, numericId));
  return { success: true };
}

export async function adminSaveZoneAction(data: { id?: string; nameAr: string; nameEn?: string; fee: number; estimatedMinutes: number }) {
  await ensureSeedDatabase();
  if (data.id) {
    await db
      .update(deliveryZones)
      .set({
        nameAr: data.nameAr,
        nameEn: data.nameEn || data.nameAr,
        fee: Number(data.fee || 0),
        estimatedMinutes: Number(data.estimatedMinutes || 30),
      })
      .where(eq(deliveryZones.id, data.id));
  } else {
    const newId = `zone-${Date.now()}`;
    await db.insert(deliveryZones).values({
      id: newId,
      nameAr: data.nameAr,
      nameEn: data.nameEn || data.nameAr,
      fee: Number(data.fee || 0),
      estimatedMinutes: Number(data.estimatedMinutes || 30),
    });
  }
  return { success: true };
}

export async function adminDeleteZoneAction(id: string) {
  await ensureSeedDatabase();
  await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
  return { success: true };
}

export const saveFrontendSettingsAction = adminSaveSettingsAction;
export const adminSaveSettings = adminSaveSettingsAction;
export const adminGetSettingsAction = adminGetAllAction;
export const adminSetSettingAction = adminSaveSettingsAction;
export const adminSetOrderStatusAction = adminUpdateOrderStatusAction;

export async function adminSaveScannedRowsAction(rows: any[]) {
  await ensureSeedDatabase();
  for (const row of rows) {
    let cat = await db.select().from(categories).where(eq(categories.nameAr, row.categoryName)).limit(1);
    let catId = cat[0]?.id;
    if (!catId) {
      catId = `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await db.insert(categories).values({
        id: catId,
        nameAr: row.categoryName,
        nameEn: row.categoryName,
      });
    }

    const itemId = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const badgeParts = [];
    if (row.spicyOption) badgeParts.push("spicy");
    if (row.isBestSeller) badgeParts.push("bestseller");

    await db.insert(menuItems).values({
      id: itemId,
      categoryId: catId,
      nameAr: row.nameAr,
      nameEn: row.nameAr,
      descriptionAr: row.descriptionAr || "",
      descriptionEn: "",
      price: Number(row.price || 0),
      badge: badgeParts.join(",") || null,
      isAvailable: 1,
    });
  }
  return { success: true };
}

export async function adminTriggerSeedAction() {
  await ensureSeedDatabase();
  return { success: true };
}
