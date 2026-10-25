"use server";

import { db } from "@/db";
import { categories, menuItems, orders, settings, deliveryZones, customers } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { FrontendSettings, getFrontendSettings } from "@/db/queries";

export interface ScannedRow {
  categoryNameAr: string;
  categoryNameEn: string;
  itemNameAr: string;
  itemNameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
}

// 1. Fetch All Admin Data
export async function adminGetAllAction() {
  try {
    const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    const itemsList = await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));
    const ordersList = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const zonesList = await db.select().from(deliveryZones);
    const settingsList = await db.select().from(settings);

    return {
      success: true,
      data: {
        categories: cats,
        items: itemsList,
        orders: ordersList,
        zones: zonesList,
        settings: settingsList,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "فشل جلب البيانات" };
  }
}

// 2. Gemini AI Menu Scanner Action
export async function adminScanMenuAction(payload: {
  fileName: string;
  imageBase64: string;
  mimeType: string;
}): Promise<{ success: boolean; data?: ScannedRow[]; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return {
        success: false,
        error: "مفتاح GEMINI_API_KEY غير مضاف في Vercel Environment Variables. يرجى إضافته ثم عمل Redeploy للموقع.",
      };
    }

    if (!apiKey.startsWith("AIzaSy")) {
      return {
        success: false,
        error: `المفتاح الحالي GEMINI_API_KEY يبدو غير صحيح. يجب استخدام API Key المولد من Google AI Studio والذي يبدأ بـ "AIzaSy".`,
      };
    }

    const base64Data = payload.imageBase64.includes(",")
      ? payload.imageBase64.split(",")[1]
      : payload.imageBase64;

    const mimeType = payload.mimeType || "image/jpeg";

    const promptText = `أنت مساعد متخصص في قراءة وتفكيك قوائم الطعام (المينيو) من الصور.
قم بتحليل صورة المينيو المرفقة واستخرج جميع الأصناف والأقسام منها بدقة متناهية.
يجب إرجاع النتيجة حصراً في صيغة JSON Array بدون أي كلام إضافي أو تنسيق Markdown.

[
  {
    "categoryNameAr": "اسم القسم بالعربي",
    "categoryNameEn": "اسم القسم بالإنجليزي",
    "itemNameAr": "اسم الصنف بالعربي",
    "itemNameEn": "اسم الصنف بالإنجليزي",
    "descriptionAr": "الوصف بالعربي إن وجد",
    "descriptionEn": "الوصف بالإنجليزي إن وجد",
    "price": 150
  }
]`;

    const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    let responseText = "";
    let lastApiError = "";

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
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
              generationConfig: {
                temperature: 0.1,
                response_mime_type: "application/json",
              },
            }),
          }
        );

        const resData = await response.json();

        if (!response.ok) {
          lastApiError = resData?.error?.message || response.statusText;
          continue;
        }

        const candidateText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          responseText = candidateText;
          break;
        }
      } catch (err: any) {
        lastApiError = err?.message || "فشل الاتصال بـ Google API";
      }
    }

    if (!responseText) {
      return {
        success: false,
        error: `فشل استجابة نموذج الذكاء الاصطناعي: ${lastApiError || "خطأ غير معروف"}`,
      };
    }

    let cleaned = responseText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return {
        success: false,
        error: "لم يتم العثور على أطباق قابلة للقراءة في صورة المينيو. يرجى رفع صورة أكثر وضوحاً.",
      };
    }

    return { success: true, data: parsed };
  } catch (err: any) {
    return {
      success: false,
      error: `خطأ في المعالجة: ${err?.message || "حدث خلل أثناء تحليل الصورة"}`,
    };
  }
}

// 3. Save Scanned AI Rows
export async function adminSaveScannedRowsAction(rows: ScannedRow[]) {
  try {
    const existingCats = await db.select().from(categories);
    const catMap = new Map<string, number>();

    for (const cat of existingCats) {
      catMap.set(cat.nameAr.toLowerCase().trim(), cat.id);
      catMap.set(cat.nameEn.toLowerCase().trim(), cat.id);
    }

    let itemsInserted = 0;

    for (const row of rows) {
      const catAr = (row.categoryNameAr || "أصناف أخرى").trim();
      const catEn = (row.categoryNameEn || "Other Items").trim();
      const key = catAr.toLowerCase();

      let categoryId = catMap.get(key);

      if (!categoryId) {
        const [insertedCat] = await db
          .insert(categories)
          .values({
            nameAr: catAr,
            nameEn: catEn,
            sortOrder: 99,
          })
          .returning({ id: categories.id });

        categoryId = insertedCat.id;
        catMap.set(key, categoryId);
      }

      await db.insert(menuItems).values({
        categoryId,
        nameAr: row.itemNameAr || "صنف جديد",
        nameEn: row.itemNameEn || "New Item",
        descriptionAr: row.descriptionAr || "",
        descriptionEn: row.descriptionEn || "",
        price: row.price ? Math.round(row.price * 100) : 0,
        isAvailable: true,
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
        sortOrder: 99,
      });

      itemsInserted++;
    }

    return { success: true, count: itemsInserted };
  } catch (err: any) {
    return { success: false, error: err?.message || "فشل حفظ الأصناف في قاعدة البيانات" };
  }
}

// 4. Save Frontend Dynamic Content Settings
export async function saveFrontendSettingsAction(data: FrontendSettings) {
  try {
    const entries = Object.entries(data);

    for (const [key, value] of entries) {
      const strVal = String(value ?? "");

      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key));

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({ value: strVal, updatedAt: new Date() })
          .where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({
          key,
          value: strVal,
          updatedAt: new Date(),
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "فشل حفظ الإعدادات" };
  }
}

// 5. Category Management Actions
export async function adminSaveCategoryAction(data: any) {
  try {
    if (data.id) {
      await db
        .update(categories)
        .set({
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          sortOrder: data.sortOrder || 0,
        })
        .where(eq(categories.id, data.id));
    } else {
      await db.insert(categories).values({
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        sortOrder: data.sortOrder || 0,
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminCreateCategoryAction(formData: FormData) {
  return adminSaveCategoryAction({
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn"),
    sortOrder: parseInt((formData.get("sortOrder") as string) || "0", 10),
  });
}

export async function adminUpdateCategoryAction(id: number, formData: FormData) {
  return adminSaveCategoryAction({
    id,
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn"),
    sortOrder: parseInt((formData.get("sortOrder") as string) || "0", 10),
  });
}

export async function adminDeleteCategoryAction(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 6. Items Management Actions
export async function adminSaveItemAction(data: any) {
  try {
    const pricePiasters = typeof data.price === "number" ? Math.round(data.price * 100) : 0;

    if (data.id) {
      await db
        .update(menuItems)
        .set({
          categoryId: data.categoryId,
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          descriptionAr: data.descriptionAr || "",
          descriptionEn: data.descriptionEn || "",
          price: pricePiasters,
          imageUrl: data.imageUrl || "",
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
          sortOrder: data.sortOrder || 0,
        })
        .where(eq(menuItems.id, data.id));
    } else {
      await db.insert(menuItems).values({
        categoryId: data.categoryId,
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        descriptionAr: data.descriptionAr || "",
        descriptionEn: data.descriptionEn || "",
        price: pricePiasters,
        imageUrl: data.imageUrl || "",
        isAvailable: true,
        sortOrder: 0,
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminCreateItemAction(formData: FormData) {
  return adminSaveItemAction({
    categoryId: parseInt(formData.get("categoryId") as string, 10),
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn"),
    descriptionAr: formData.get("descriptionAr"),
    descriptionEn: formData.get("descriptionEn"),
    price: parseFloat((formData.get("price") as string) || "0"),
    imageUrl: formData.get("imageUrl"),
  });
}

export async function adminUpdateItemAction(id: number, formData: FormData) {
  return adminSaveItemAction({
    id,
    categoryId: parseInt(formData.get("categoryId") as string, 10),
    nameAr: formData.get("nameAr"),
    nameEn: formData.get("nameEn"),
    descriptionAr: formData.get("descriptionAr"),
    descriptionEn: formData.get("descriptionEn"),
    price: parseFloat((formData.get("price") as string) || "0"),
    imageUrl: formData.get("imageUrl"),
  });
}

export async function adminDeleteItemAction(id: number) {
  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminToggleItemAvailableAction(id: number, currentStatus: boolean) {
  try {
    await db
      .update(menuItems)
      .set({ isAvailable: !currentStatus })
      .where(eq(menuItems.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 7. Order Status Actions
export async function adminSetOrderStatusAction(orderId: number, status: string) {
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminUpdateOrderStatusAction(orderId: number, status: string) {
  return adminSetOrderStatusAction(orderId, status);
}

// 8. Delivery Zone Actions
export async function adminSaveZoneAction(data: any) {
  try {
    const feePiasters = typeof data.fee === "number" ? Math.round(data.fee * 100) : 0;

    if (data.id) {
      await db
        .update(deliveryZones)
        .set({
          nameAr: data.nameAr,
          nameEn: data.nameEn,
          fee: feePiasters,
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        })
        .where(eq(deliveryZones.id, data.id));
    } else {
      await db.insert(deliveryZones).values({
        nameAr: data.nameAr,
        nameEn: data.nameEn,
        fee: feePiasters,
        isAvailable: true,
      });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminDeleteZoneAction(id: number) {
  try {
    await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 9. General Settings Action
export async function adminSetSettingAction(key: string, value: string) {
  try {
    const existing = await db.select().from(settings).where(eq(settings.key, key));
    if (existing.length > 0) {
      await db.update(settings).set({ value, updatedAt: new Date() }).where(eq(settings.key, key));
    } else {
      await db.insert(settings).values({ key, value, updatedAt: new Date() });
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
