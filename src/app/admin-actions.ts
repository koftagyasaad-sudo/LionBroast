"use server";

import { db } from "@/db";
import { categories, items, orders, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FrontendSettings } from "@/db/queries";

export interface ScannedRow {
  categoryNameAr: string;
  categoryNameEn: string;
  itemNameAr: string;
  itemNameEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
}

// 1. AI Menu Scanner Action using Google Gemini REST API
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
        error: "مفتاح GEMINI_API_KEY غير مضاف في إعدادات البيئة على Vercel (Environment Variables). يرجى إضافته ثم عمل Redeploy للموقع.",
      };
    }

    if (!apiKey.startsWith("AIzaSy")) {
      return {
        success: false,
        error: `المفتاح الحالي GEMINI_API_KEY يبدو غير صحيح (يبدأ بـ "${apiKey.slice(0, 6)}..."). يجب استخدام API Key من Google AI Studio والذي يبدأ بـ "AIzaSy".`,
      };
    }

    // Prepare clean Base64 string
    const base64Data = payload.imageBase64.includes(",")
      ? payload.imageBase64.split(",")[1]
      : payload.imageBase64;

    const mimeType = payload.mimeType || "image/jpeg";

    const promptText = `أنت مساعد متخصص في قراءة وتفكيك قوائم الطعام (المينيو) من الصور.
قم بتحليل صورة المينيو المرفقة واستخرج جميع الأصناف والأقسام منها بدقة متناهية.
يجب إرجاع النتيجة حصراً في صيغة JSON Array بدون أي كلام إضافي أو تنسيق Markdown (لا تضع \`\`\`json).

كل عنصر في القائمة يجب أن يكون كالتالي:
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
]

شروط:
1. السعر عدد فقط بدون عملة.
2. إذا غاب السعر ضع 0.
3. ترجم الأسماء بدقة للغتين العربية والإنجليزية.`;

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
        error: `فشل استجابة نموذج جوجل الذكي: ${lastApiError || "خطأ غير معروف"}`,
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
        error: "لم يتم العثور على أطباق قابلة للقراءة في صورة المينيو. يرجى استخدام صورة أوضح.",
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

// 2. Save Scanned Rows to DB
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

      await db.insert(items).values({
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

// 3. Save Frontend Settings Action
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

// 4. CRUD Actions for Categories
export async function adminCreateCategoryAction(formData: FormData) {
  try {
    const nameAr = formData.get("nameAr") as string;
    const nameEn = formData.get("nameEn") as string;
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

    if (!nameAr || !nameEn) throw new Error("الأسماء مطلوبة بالعربية والإنجليزية");

    await db.insert(categories).values({ nameAr, nameEn, sortOrder });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminUpdateCategoryAction(id: number, formData: FormData) {
  try {
    const nameAr = formData.get("nameAr") as string;
    const nameEn = formData.get("nameEn") as string;
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);

    await db
      .update(categories)
      .set({ nameAr, nameEn, sortOrder })
      .where(eq(categories.id, id));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminDeleteCategoryAction(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 5. CRUD Actions for Items
export async function adminCreateItemAction(formData: FormData) {
  try {
    const categoryId = parseInt(formData.get("categoryId") as string, 10);
    const nameAr = formData.get("nameAr") as string;
    const nameEn = formData.get("nameEn") as string;
    const descriptionAr = (formData.get("descriptionAr") as string) || "";
    const descriptionEn = (formData.get("descriptionEn") as string) || "";
    const pricePiasters = Math.round(parseFloat((formData.get("price") as string) || "0") * 100);
    const imageUrl = (formData.get("imageUrl") as string) || "";

    await db.insert(items).values({
      categoryId,
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      price: pricePiasters,
      imageUrl,
      isAvailable: true,
      sortOrder: 0,
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminUpdateItemAction(id: number, formData: FormData) {
  try {
    const categoryId = parseInt(formData.get("categoryId") as string, 10);
    const nameAr = formData.get("nameAr") as string;
    const nameEn = formData.get("nameEn") as string;
    const descriptionAr = (formData.get("descriptionAr") as string) || "";
    const descriptionEn = (formData.get("descriptionEn") as string) || "";
    const pricePiasters = Math.round(parseFloat((formData.get("price") as string) || "0") * 100);
    const imageUrl = (formData.get("imageUrl") as string) || "";

    await db
      .update(items)
      .set({
        categoryId,
        nameAr,
        nameEn,
        descriptionAr,
        descriptionEn,
        price: pricePiasters,
        imageUrl,
      })
      .where(eq(items.id, id));

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminDeleteItemAction(id: number) {
  try {
    await db.delete(items).where(eq(items.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function adminToggleItemAvailableAction(id: number, currentStatus: boolean) {
  try {
    await db
      .update(items)
      .set({ isAvailable: !currentStatus })
      .where(eq(items.id, id));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 6. Order Status Action
export async function adminUpdateOrderStatusAction(orderId: number, status: string) {
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, orderId));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}
