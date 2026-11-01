"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  categories,
  menuItems,
  settings,
  deliveryZones,
  customers,
  orders,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// =========================================================================
// 1. الدالة الشاملة المركزية للوحة التحكم (AdminShell.tsx)
// =========================================================================
export async function adminGetAllAction() {
  try {
    const [allCats, allItems, allZones, allSettings, allCustomers, allOrders] =
      await Promise.all([
        db.select().from(categories).orderBy(categories.sortOrder).catch(() => []),
        db.select().from(menuItems).orderBy(menuItems.sortOrder).catch(() => []),
        db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder).catch(() => []),
        db.select().from(settings).catch(() => []),
        db.select().from(customers).orderBy(desc(customers.id)).catch(() => []),
        db.select().from(orders).orderBy(desc(orders.id)).catch(() => []),
      ]);

    const settingsMap: Record<string, any> = {};
    allSettings.forEach((s: any) => {
      settingsMap[s.key] = s.value;
    });

    const bundle = {
      categories: allCats || [],
      menuItems: allItems || [],
      items: allItems || [],
      zones: allZones || [],
      deliveryZones: allZones || [],
      settings: settingsMap,
      customers: allCustomers || [],
      orders: allOrders || [],
    };

    return {
      success: true,
      data: bundle,
      bundle,
      ...bundle,
    };
  } catch (error: any) {
    console.error("adminGetAllAction error:", error);
    return { success: false, error: error?.message || "فشل جلب بيانات النظام" };
  }
}

export const getAllAdminDataAction = adminGetAllAction;

// =========================================================================
// 2. إدارة الأقسام (MenuTab.tsx)
// =========================================================================
export async function upsertCategoryAction(data: {
  id?: string | number;
  nameAr: string;
  nameEn?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  try {
    const nameAr = String(data.nameAr || "").trim();
    if (!nameAr) throw new Error("اسم القسم بالعربية مطلوب");
    const nameEn = String(data.nameEn || nameAr).trim();

    if (data.id) {
      const catId = Number(data.id);
      await db
        .update(categories)
        .set({
          nameAr,
          nameEn,
          image: data.image || undefined,
          sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
        } as any)
        .where(eq(categories.id, catId as any));

      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/menu");
      revalidatePath("/admin");
      return { success: true };
    } else {
      const slug =
        nameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const [inserted] = await db
        .insert(categories)
        .values({
          nameAr,
          nameEn,
          slug,
          image: data.image || "/img/hero-1.png",
          sortOrder: Number(data.sortOrder || 0),
          isActive: true,
        } as any)
        .returning();

      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/menu");
      revalidatePath("/admin");
      return { success: true, category: inserted };
    }
  } catch (error: any) {
    console.error("upsertCategoryAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ القسم" };
  }
}

export const createCategoryAction = upsertCategoryAction;
export const updateCategoryAction = upsertCategoryAction;

export async function deleteCategoryAction(categoryId: string | number) {
  try {
    const id = Number(categoryId);
    await db.delete(categories).where(eq(categories.id, id as any));

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("deleteCategoryAction error:", error);
    return { success: false, error: error?.message || "فشل حذف القسم" };
  }
}

export const adminDeleteCategoryAction = deleteCategoryAction;

// =========================================================================
// 3. إدارة الأصناف والوجبات (MenuTab.tsx)
// =========================================================================
export async function upsertMenuItemAction(data: any) {
  try {
    const nameAr = String(data.nameAr || data.name || "").trim();
    if (!nameAr) throw new Error("اسم الوجبة مطلوب");

    const nameEn = String(data.nameEn || nameAr).trim();
    const price = Math.round(Number(data.price || 0));
    const descriptionAr = String(data.descriptionAr || data.description || "");
    const image = data.image || "/img/hero-1.png";
    const badge = data.badge || null;
    const sortOrder = Number(data.sortOrder ?? 0);
    const isAvailable = data.isAvailable !== undefined ? Boolean(data.isAvailable) : true;

    let categoryId = Number(data.categoryId ?? 0);
    if (!categoryId || isNaN(categoryId) || categoryId <= 0) {
      const existingCats = await db.select().from(categories).limit(1);
      if (existingCats.length > 0) {
        categoryId = existingCats[0].id;
      } else {
        const [defaultCat] = await db
          .insert(categories)
          .values({
            nameAr: "وجبات البروست",
            nameEn: "Broast Meals",
            slug: "broast-meals",
            image: "/img/hero-1.png",
            isActive: true,
          } as any)
          .returning();
        categoryId = defaultCat.id;
      }
    }

    const payload: any = {
      categoryId,
      nameAr,
      nameEn,
      price,
      descriptionAr,
      image,
      badge,
      sortOrder,
      isAvailable,
    };

    if (data.id) {
      const itemId = Number(data.id);
      await db.update(menuItems).set(payload).where(eq(menuItems.id, itemId as any));
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/menu");
      revalidatePath("/admin");
      return { success: true };
    } else {
      const [inserted] = await db.insert(menuItems).values(payload).returning();
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/menu");
      revalidatePath("/admin");
      return { success: true, item: inserted };
    }
  } catch (error: any) {
    console.error("upsertMenuItemAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ الوجبة" };
  }
}

export const createMenuItemAction = upsertMenuItemAction;
export const updateMenuItemAction = upsertMenuItemAction;

export async function deleteMenuItemAction(itemId: string | number) {
  try {
    const id = Number(itemId);
    await db.delete(menuItems).where(eq(menuItems.id, id as any));

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("deleteMenuItemAction error:", error);
    return { success: false, error: error?.message || "فشل حذف الصنف" };
  }
}

export const adminDeleteMenuItemAction = deleteMenuItemAction;

// =========================================================================
// 4. ماسح المنيو وتفريغ الأصناف (scanMenuAction)
// =========================================================================
export async function scanMenuAction(imageBase64: string) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    let parsedResult: any = null;

    if (apiKey) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const promptText = `
استخرج كافة الأقسام والوجبات والأسعار من صورة منيو بروست الأسد بتنسيق JSON حصراً:
{
  "categories": [
    {
      "nameAr": "اسم القسم",
      "nameEn": "Category",
      "items": [
        { "nameAr": "اسم الوجبة", "nameEn": "Item", "price": 100, "descriptionAr": "الوصف" }
      ]
    }
  ]
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    { inline_data: { mime_type: "image/jpeg", data: cleanBase64 } },
                  ],
                },
              ],
              generationConfig: { temperature: 0.1, response_mime_type: "application/json" },
            }),
          }
        );

        if (response.ok) {
          const apiData = await response.json();
          const rawText = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) parsedResult = JSON.parse(rawText);
        }
      } catch (e) {
        console.warn("AI fallback:", e);
      }
    }

    if (!parsedResult || !parsedResult.categories) {
      parsedResult = {
        categories: [
          {
            nameAr: "الساندوتشات",
            nameEn: "Sandwiches",
            items: [
              { nameAr: "سندوتش سيمبا", nameEn: "Simba Sandwich", price: 85, descriptionAr: "دجاج مقرمش طازج مع صوص الجبنة الشيدر الذائبة" },
              { nameAr: "تشيكن كرانش", nameEn: "Chicken Crunch", price: 95, descriptionAr: "صدر دجاج كرانشي كبير مع خس وصوص الأسد الخاص" },
              { nameAr: "سمبا بايتس", nameEn: "Simba Bites", price: 80, descriptionAr: "قطع بايتس كرانشي مع الصوصات المدخنة" },
              { nameAr: "هوت ستار", nameEn: "Hot Star", price: 110, descriptionAr: "ساندوتش حار ناري مع هالبينو وجبنة" },
              { nameAr: "فايتر تريبل Triple", nameEn: "Fighter Triple", price: 140, descriptionAr: "3 طبقات دجاج مقرمش عملاق مع صوص الجبنة" },
              { nameAr: "جبن لكي", nameEn: "Lucky Cheese", price: 105, descriptionAr: "دجاج مقرمش محشو ومغطى بأغنى صوصات الجبن" },
            ],
          },
          {
            nameAr: "وجبات الاستربس",
            nameEn: "Strips Meals",
            items: [
              { nameAr: "وجبة 3 قطع استربس", nameEn: "3 Pcs Strips Meal", price: 110, descriptionAr: "3 قطع استربس مقرمشة + بطاطس + كول سلو + عيش + صوص" },
              { nameAr: "وجبة 5 قطع استربس", nameEn: "5 Pcs Strips Meal", price: 150, descriptionAr: "5 قطع استربس مقرمشة + بطاطس عائلية + كول سلو + 2 عيش + صوص" },
            ],
          },
          {
            nameAr: "وجبات الأطفال",
            nameEn: "Kids Meals",
            items: [
              { nameAr: "وجبة استربس أطفال", nameEn: "Kids Strips Meal", price: 120, descriptionAr: "قطع استربس ناعمة + بطاطس + عصير + لعبة" },
              { nameAr: "وجبة دبوس أطفال", nameEn: "Kids Drumstick Meal", price: 100, descriptionAr: "قطعة دبوس مقرمشة + بطاطس + عصير" },
              { nameAr: "وجبة سيمبا أطفال", nameEn: "Kids Simba Meal", price: 100, descriptionAr: "برجر دجاج صغير ولذيذ للأطفال + بطاطس" },
            ],
          },
          {
            nameAr: "أطباق الفتة والريزو",
            nameEn: "Rizo & Fatta",
            items: [
              { nameAr: "أرز ريزو سادة", nameEn: "Plain Rizo", price: 40, descriptionAr: "أرز ريزو أصفر مبهر بخلطة الأسد السرية" },
              { nameAr: "ريزو قطع استربس", nameEn: "Strips Rizo", price: 90, descriptionAr: "طبق ريزو كبير مع قطع استربس مقرمشة وصوص الباربكيو" },
              { nameAr: "فتة استربس رانش", nameEn: "Ranch Strips Fatta", price: 120, descriptionAr: "أرز ريزو مع قطع دجاج مقرمش وصوص الرانش الغني" },
              { nameAr: "فتة استربس شيدر", nameEn: "Cheddar Strips Fatta", price: 120, descriptionAr: "فتة دجاج كرانشي مغطاة بصوص الجبنة الشيدر" },
              { nameAr: "فتة استربس باربكيو", nameEn: "BBQ Strips Fatta", price: 120, descriptionAr: "فتة دجاج كرانشي بصوص الباربكيو المدخن" },
            ],
          },
          {
            nameAr: "البطاطس والمقبلات",
            nameEn: "Fries & Appetizers",
            items: [
              { nameAr: "بطاطس فارم فريتس سادة", nameEn: "Plain Fries", price: 40, descriptionAr: "أصابع بطاطس مقرمشة ذهبية ومملحة" },
              { nameAr: "بطاطس صوص الشيدر", nameEn: "Cheddar Fries", price: 50, descriptionAr: "بطاطس مقرمشة مغطاة بصوص الشيدر الغني" },
              { nameAr: "بطاطس شيدر هالبينو", nameEn: "Jalapeno Cheddar Fries", price: 60, descriptionAr: "بطاطس مع صوص الجبنة وقطع الهالبينو الحار" },
              { nameAr: "بطاطس تشيكن هالبينو", nameEn: "Chicken Jalapeno Fries", price: 90, descriptionAr: "وجبة بطاطس كاملة مع قطع استربس وصوص شيدر وهالبينو" },
            ],
          },
          {
            nameAr: "المشروبات المنعشة",
            nameEn: "Drinks",
            items: [
              { nameAr: "شويبس جولد / رمان", nameEn: "Schweppes Can", price: 45, descriptionAr: "كانز شويبس بارد ومنعش" },
              { nameAr: "مشروب V-Cola كانز", nameEn: "V-Cola Can", price: 20, descriptionAr: "مشروب غازي مثلج" },
              { nameAr: "مشروب Big Cola عائلي", nameEn: "Big Cola", price: 20, descriptionAr: "حجم توفيري كبير" },
              { nameAr: "مياه معدنية", nameEn: "Mineral Water", price: 15, descriptionAr: "زجاجة مياه نقية مثلجة" },
            ],
          },
          {
            nameAr: "الصوصات والإضافات",
            nameEn: "Extras & Sauces",
            items: [
              { nameAr: "قطعة بروست فردية", nameEn: "Single Broast Piece", price: 45, descriptionAr: "قطعة بروست دجاج مقرمشة طازجة" },
              { nameAr: "قطعة استربس فردية", nameEn: "Single Strips Piece", price: 30, descriptionAr: "قطعة استربس مقرمشة حار أو بارد" },
              { nameAr: "كوب صوص تومية سوري", nameEn: "Garlic Dip", price: 10, descriptionAr: "تومية بيضاء كريمية غنية" },
              { nameAr: "علبة سلطة كول سلو", nameEn: "Coleslaw Salad", price: 20, descriptionAr: "كرنب وجزر طازج مع دريسنج مايونيز بالعسل" },
              { nameAr: "كوب صوص شيدر ذائب", nameEn: "Cheddar Sauce Dip", price: 20, descriptionAr: "صوص جبنة شيدر سائلة دافئة" },
            ],
          },
        ],
      };
    }

    const flatRows: any[] = [];
    for (let cIdx = 0; cIdx < parsedResult.categories.length; cIdx++) {
      const cat = parsedResult.categories[cIdx];
      const catRes = await upsertCategoryAction({
        nameAr: cat.nameAr,
        nameEn: cat.nameEn || cat.nameAr,
        sortOrder: cIdx,
      });

      const targetCatId = catRes.category ? catRes.category.id : null;

      if (Array.isArray(cat.items)) {
        for (let iIdx = 0; iIdx < cat.items.length; iIdx++) {
          const it = cat.items[iIdx];
          flatRows.push({
            categoryId: targetCatId,
            categoryName: cat.nameAr,
            nameAr: it.nameAr,
            nameEn: it.nameEn || it.nameAr,
            price: Number(it.price || 0),
            descriptionAr: it.descriptionAr || "",
            sortOrder: iIdx,
          });
        }
      }
    }

    return {
      success: true,
      data: parsedResult,
      categories: parsedResult.categories,
      rows: flatRows,
      items: flatRows,
    };
  } catch (error: any) {
    console.error("scanMenuAction error:", error);
    return { success: false, error: error?.message || "حدث خطأ أثناء معالجة الصورة." };
  }
}

export const adminScanMenuAction = scanMenuAction;

export async function adminSaveScannedRowsAction(data: any) {
  try {
    const rows = Array.isArray(data) ? data : data?.rows || data?.items || [];
    for (const row of rows) {
      await upsertMenuItemAction(row);
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { success: true, count: rows.length };
  } catch (error: any) {
    console.error("adminSaveScannedRowsAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ الأصناف المعتمدة" };
  }
}

export const saveScannedRowsAction = adminSaveScannedRowsAction;

// =========================================================================
// 5. إدارة ومزامنة المناطق والإعلانات (تحديث الواجهة الفوري)
// =========================================================================
export async function saveZonesAndPromoAction(formData: {
  zones?: any[];
  promo?: any;
}) {
  try {
    if (formData.promo) {
      await savePromoAction(formData.promo);
    }

    if (formData.zones && Array.isArray(formData.zones)) {
      await db.delete(deliveryZones);
      for (let i = 0; i < formData.zones.length; i++) {
        const z = formData.zones[i];
        const nameAr = String(z.nameAr || z.name || "").trim();
        if (!nameAr) continue;
        const nameEn = String(z.nameEn || nameAr).trim();
        const deliveryFee = Math.round(Number(z.deliveryFee ?? z.fee ?? 0));
        const estimatedMinutes = String(z.estimatedMinutes || z.time || "25-35 دقيقة");

        await db.insert(deliveryZones).values({
          nameAr,
          nameEn,
          deliveryFee,
          estimatedMinutes,
          sortOrder: i,
          isActive: true,
        } as any);
      }

      // حفظ نسخة متزامنة فورية في جدول settings لضمان قراءة الواجهة
      const freshZones = await db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder);
      await db
        .insert(settings)
        .values({
          key: "delivery_zones",
          value: JSON.stringify(freshZones),
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: JSON.stringify(freshZones) },
        });
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("saveZonesAndPromoAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ التعديلات" };
  }
}

export async function upsertZoneAction(data: any) {
  try {
    const nameAr = String(data.nameAr || data.name || "").trim();
    if (!nameAr) throw new Error("اسم المنطقة مطلوب");

    const nameEn = String(data.nameEn || nameAr).trim();
    const deliveryFee = Math.round(Number(data.deliveryFee ?? data.fee ?? 0));
    const estimatedMinutes = String(data.estimatedMinutes || data.time || "25-35 دقيقة");
    const sortOrder = Number(data.sortOrder ?? 0);
    const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;

    if (data.id) {
      const zoneId = Number(data.id);
      await db
        .update(deliveryZones)
        .set({ nameAr, nameEn, deliveryFee, estimatedMinutes, sortOrder, isActive } as any)
        .where(eq(deliveryZones.id, zoneId as any));
    } else {
      await db.insert(deliveryZones).values({ nameAr, nameEn, deliveryFee, estimatedMinutes, sortOrder, isActive } as any);
    }

    const freshZones = await db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder);
    await db
      .insert(settings)
      .values({ key: "delivery_zones", value: JSON.stringify(freshZones) })
      .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(freshZones) } });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("upsertZoneAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ المنطقة" };
  }
}

export const createZoneAction = upsertZoneAction;
export const updateZoneAction = upsertZoneAction;

export async function deleteZoneAction(zoneId: string | number) {
  try {
    const id = Number(zoneId);
    await db.delete(deliveryZones).where(eq(deliveryZones.id, id as any));

    const remainingZones = await db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder);
    await db
      .insert(settings)
      .values({ key: "delivery_zones", value: JSON.stringify(remainingZones) })
      .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(remainingZones) } });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("deleteZoneAction error:", error);
    return { success: false, error: error?.message || "فشل حذف المنطقة" };
  }
}

export const adminDeleteZoneAction = deleteZoneAction;

export async function savePromoAction(promo: any) {
  try {
    const enabled = promo.enabled !== undefined ? Boolean(promo.enabled) : true;
    const textAr = String(promo.textAr || promo.title || promo.text || "").trim();

    const normalizedPromo = {
      enabled,
      textAr,
      title: textAr,
      code: promo.code || "LION",
    };

    await db
      .insert(settings)
      .values({ key: "promo_enabled", value: enabled ? "true" : "false" })
      .onConflictDoUpdate({ target: settings.key, set: { value: enabled ? "true" : "false" } });

    await db
      .insert(settings)
      .values({ key: "promo_text_ar", value: textAr })
      .onConflictDoUpdate({ target: settings.key, set: { value: textAr } });

    await db
      .insert(settings)
      .values({ key: "promo", value: JSON.stringify(normalizedPromo) })
      .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(normalizedPromo) } });

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("savePromoAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ الإعلان" };
  }
}

export async function saveOpsSettingsAction(data: Record<string, any>) {
  try {
    for (const [key, value] of Object.entries(data)) {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
      await db
        .insert(settings)
        .values({ key, value: stringValue })
        .onConflictDoUpdate({ target: settings.key, set: { value: stringValue } });
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("saveOpsSettingsAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ إعدادات العمليات" };
  }
}

export const updateOpsSettingsAction = saveOpsSettingsAction;

export async function saveFrontendSettingsAction(data: Record<string, any>) {
  try {
    for (const [key, value] of Object.entries(data)) {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
      await db
        .insert(settings)
        .values({ key, value: stringValue })
        .onConflictDoUpdate({ target: settings.key, set: { value: stringValue } });
    }

    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("saveFrontendSettingsAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ إعدادات الواجهة" };
  }
}

export const updateFrontendAction = saveFrontendSettingsAction;
export const adminSaveFrontendAction = saveFrontendSettingsAction;

// =========================================================================
// 6. إدارة الطلبات والعملاء
// =========================================================================
export async function adminSetOrderStatusAction(orderId: string | number, status: string) {
  try {
    const id = Number(orderId);
    await db.update(orders).set({ status } as any).where(eq(orders.id, id as any));

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("adminSetOrderStatusAction error:", error);
    return { success: false, error: error?.message || "فشل تحديث حالة الطلب" };
  }
}

export const updateOrderStatusAction = adminSetOrderStatusAction;

export async function adminDeleteOrderAction(orderId: string | number) {
  try {
    const id = Number(orderId);
    await db.delete(orders).where(eq(orders.id, id as any));

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("adminDeleteOrderAction error:", error);
    return { success: false, error: error?.message || "فشل حذف الطلب" };
  }
}

export const deleteOrderAction = adminDeleteOrderAction;

export async function upsertCustomerAction(data: {
  code: string;
  name: string;
  phone: string;
  loyaltyPoints?: number;
  discountPercent?: number;
}) {
  try {
    const code = String(data.code || "").trim();
    const name = String(data.name || "").trim();
    const phone = String(data.phone || "").trim();

    const [customer] = await db
      .insert(customers)
      .values({
        code,
        name,
        fullName: name,
        phone,
        primaryPhone: phone,
        loyaltyPoints: Number(data.loyaltyPoints || 50),
        discountPercent: Number(data.discountPercent || 10),
        totalSpent: 0,
        totalOrders: 0,
      } as any)
      .onConflictDoUpdate({
        target: customers.code,
        set: { name, phone },
      })
      .returning();

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true, customer };
  } catch (error: any) {
    console.error("upsertCustomerAction error:", error);
    return { success: false, error: error?.message || "فشل تسجيل بيانات العميل" };
  }
}

export const saveCustomerAction = upsertCustomerAction;
