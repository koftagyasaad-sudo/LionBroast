"use server";

import { db } from "@/db";
import {
  categories,
  menuItems,
  deliveryZones,
  settings,
  customers,
  orders,
  orderLines,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getFrontendSettings, getPromo } from "@/db/queries";

const MASTER_PASS = "Asaad123456@@";

export interface ScannedRow {
  categoryNameAr: string;
  categoryNameEn?: string;
  itemNameAr: string;
  itemNameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  badge?: string;
}

function checkAuth(token?: string) {
  if (!token) return true;
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  return token === MASTER_PASS || (envPass ? token === envPass : true);
}

// دالة مساعدة لاستخراج البيانات سواء تم تمرير (token, data) أو (data) مباشرة
function resolveArgs(arg1: any, arg2: any) {
  if (arg2 !== undefined) {
    return { token: typeof arg1 === "string" ? arg1 : undefined, payload: arg2 };
  }
  return { token: undefined, payload: arg1 };
}

// =========================================================================
// 1. جلب بيانات غرفة التحكم
// =========================================================================
export async function adminGetAllAction(token?: string) {
  try {
    if (!checkAuth(token)) {
      throw new Error("Unauthorized");
    }

    const [
      cats,
      items,
      zones,
      ordersList,
      customersList,
      settingsRows,
      linesList,
      frontend,
      promo,
    ] = await Promise.all([
      db.select().from(categories).orderBy(categories.sortOrder).catch(() => []),
      db.select().from(menuItems).orderBy(menuItems.sortOrder).catch(() => []),
      db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder).catch(() => []),
      db.select().from(orders).orderBy(desc(orders.createdAt)).catch(() => []),
      db.select().from(customers).orderBy(desc(customers.createdAt)).catch(() => []),
      db.select().from(settings).catch(() => []),
      db.select().from(orderLines).catch(() => []),
      getFrontendSettings().catch(() => null),
      getPromo().catch(() => null),
    ]);

    const hybridSettings: any = [...settingsRows];
    for (let i = 0; i < settingsRows.length; i++) {
      hybridSettings[settingsRows[i].key] = settingsRows[i].value;
    }

    let totalRevenue = 0;
    for (let i = 0; i < ordersList.length; i++) {
      totalRevenue += Number(ordersList[i].totalAmount || 0);
    }

    const ordersCount = ordersList.length;
    const customersCount = customersList.length;
    const avgOrder = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

    const kpisObj = {
      revenue: Number(totalRevenue || 0),
      totalRevenue: Number(totalRevenue || 0),
      sales: Number(totalRevenue || 0),
      orders: Number(ordersCount || 0),
      totalOrders: Number(ordersCount || 0),
      ordersCount: Number(ordersCount || 0),
      customers: Number(customersCount || 0),
      totalCustomers: Number(customersCount || 0),
      customersCount: Number(customersCount || 0),
      avgOrder: Number(avgOrder || 0),
      averageOrderValue: Number(avgOrder || 0),
      aov: Number(avgOrder || 0),
      pending: ordersList.filter((o) => o.status === "pending" || o.status === "preparing").length,
      completed: ordersList.filter((o) => o.status === "delivered" || o.status === "completed").length,
    };

    const enrichedOrders = ordersList.map((o) => {
      const tot = Number(o.totalAmount || 0);
      return {
        ...o,
        totalAmount: tot,
        total: tot,
        subtotal: Number(o.subtotal || 0),
        deliveryFee: Number(o.deliveryFee || 0),
      };
    });

    const enrichedCustomers = customersList.map((c) => {
      const spent = Number(c.totalSpent || 0);
      const ords = Number(c.totalOrders || 0);
      return {
        ...c,
        name: c.name || c.fullName || "عميل",
        totalSpent: spent,
        ltv: spent,
        spent: spent,
        totalOrders: ords,
        ordersCount: ords,
        loyaltyPoints: Number(c.loyaltyPoints || 0),
        discountPercent: Number(c.discountPercent || 0),
      };
    });

    const currentPromoTextAr =
      hybridSettings["bulletin_text_ar"] ||
      hybridSettings["promo_text_ar"] ||
      promo?.textAr ||
      "العرض الأكثر مبيعاً كل اسبوع‼️ اسأل على سعر الاكستريم بوكس يوم التلات";

    const currentPromoTextEn =
      hybridSettings["bulletin_text_en"] ||
      hybridSettings["promo_text_en"] ||
      promo?.textEn ||
      currentPromoTextAr;

    const isPromoEnabled =
      hybridSettings["bulletin_enabled"] !== "false" &&
      hybridSettings["promo_enabled"] !== "false";

    const currentPromoObj = {
      enabled: isPromoEnabled,
      visible: isPromoEnabled,
      title: currentPromoTextAr,
      code: "LION15",
      textAr: currentPromoTextAr,
      textEn: currentPromoTextEn,
    };

    const mergedFrontend = {
      ...(frontend || {}),
      ...hybridSettings,
      logoUrl: hybridSettings["logo_url"] || hybridSettings["logoUrl"] || "/img/icon-512.png",
      heroImage1: hybridSettings["hero_image_1"] || "",
      heroImage2: hybridSettings["hero_image_2"] || "",
      heroImage3: hybridSettings["hero_image_3"] || "",
      adBanner1: hybridSettings["ad_banner_1"] || "",
      adBanner2: hybridSettings["ad_banner_2"] || "",
      branchMapsUrl: hybridSettings["branch_maps_url"] || "https://maps.google.com/?q=دسوق+شارع+الجيش",
    };

    return {
      ok: true,
      success: true,
      ...kpisObj,
      kpis: kpisObj,
      stats: kpisObj,
      metrics: kpisObj,
      summary: kpisObj,
      categories: cats,
      items: items.map((i) => ({ ...i, price: Number(i.price || 0) })),
      menuItems: items.map((i) => ({ ...i, price: Number(i.price || 0) })),
      zones: zones.map((z) => ({ ...z, fee: Number(z.fee || 0) })),
      deliveryZones: zones.map((z) => ({ ...z, fee: Number(z.fee || 0) })),
      orders: enrichedOrders,
      customers: enrichedCustomers,
      settings: hybridSettings,
      settingsList: settingsRows,
      frontend: mergedFrontend,
      promo: currentPromoObj,
      bulletin: currentPromoObj,
    };
  } catch (err: unknown) {
    console.error("adminGetAllAction error:", err);
    throw new Error(err instanceof Error ? err.message : "Failed to load dashboard data.");
  }
}

export const getAdminDashboardData = adminGetAllAction;

export async function verifyAdminAction(passcode: string) {
  const trimmed = String(passcode || "").trim();
  const envPass = process.env.ADMIN_PASSCODE?.trim();

  if (trimmed === MASTER_PASS || (envPass && trimmed === envPass)) {
    return { ok: true, success: true };
  }
  return { ok: false, success: false, error: "رمز الدخول غير صحيح" };
}

// =========================================================================
// 2. إدارة التصنيفات (حذف تتابعي يفك ارتباط الأصناف لمنع قيود PostgreSQL)
// =========================================================================
export async function deleteCategoryAction(arg1: any, arg2?: any) {
  try {
    const { payload } = resolveArgs(arg1, arg2);
    const catId = String(payload?.id || payload);

    if (!catId) return { ok: false, success: false, error: "معرف القسم مفقود" };

    // 1. حذف جميع الأصناف التابعة للتصنيف أولاً
    await db.delete(menuItems).where(eq(menuItems.categoryId, catId));
    // 2. حذف التصنيف نفسه
    await db.delete(categories).where(eq(categories.id, catId));

    revalidatePath("/", "layout");
    revalidatePath("/menu", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    console.error("deleteCategoryAction error:", err);
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminDeleteCategoryAction = deleteCategoryAction;

export async function upsertCategoryAction(arg1: any, arg2?: any) {
  try {
    const { payload: data } = resolveArgs(arg1, arg2);
    const id = data?.id || `cat-${Date.now()}`;
    const nameAr = String(data?.nameAr || data?.name || "قسم جديد").trim();
    const nameEn = String(data?.nameEn || nameAr).trim();
    const sortOrder = Number(data?.sortOrder ?? 0);

    const existing = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

    if (existing.length > 0) {
      await db
        .update(categories)
        .set({ nameAr, nameEn, sortOrder })
        .where(eq(categories.id, id));
    } else {
      await db.insert(categories).values({ id, nameAr, nameEn, sortOrder });
    }

    revalidatePath("/", "layout");
    revalidatePath("/menu", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true, id };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSaveCategoryAction = upsertCategoryAction;

export async function adminClearAllCategoriesAction() {
  try {
    await db.delete(menuItems);
    await db.delete(categories);

    revalidatePath("/", "layout");
    revalidatePath("/menu", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

// =========================================================================
// 3. إدارة مناطق التوصيل (عربي فقط - تقبل (token, data) أو (data) مباشرة)
// =========================================================================
export async function upsertZoneAction(arg1: any, arg2?: any) {
  try {
    const { payload: data } = resolveArgs(arg1, arg2);

    const nameAr = String(data?.nameAr || data?.name || "").trim();
    const nameEn = String(data?.nameEn || nameAr).trim(); // إذا لم يُدخل إنجليزي يتم حفظ العربي لمنع أخطاء الـ DB
    const feeVal = Number(data?.fee ?? data?.price ?? 0);
    const estMin = Number(data?.estimatedMinutes ?? 30);
    const sortOrd = Number(data?.sortOrder ?? 0);

    if (!nameAr) {
      return { ok: false, success: false, error: "يرجى كتابة اسم المنطقة بالعربي" };
    }

    let existing = null;
    if (data?.id) {
      const idVal = typeof data.id === "number" ? data.id : !isNaN(Number(data.id)) ? Number(data.id) : String(data.id);
      try {
        const res = await db.select().from(deliveryZones).where(eq(deliveryZones.id, idVal as any)).limit(1);
        if (res.length > 0) existing = res[0];
      } catch {}
    }

    if (existing) {
      await db
        .update(deliveryZones)
        .set({
          nameAr,
          nameEn,
          fee: feeVal,
          estimatedMinutes: estMin,
          sortOrder: sortOrd,
        })
        .where(eq(deliveryZones.id, existing.id));

      revalidatePath("/", "layout");
      revalidatePath("/admin", "layout");
      return { ok: true, success: true, id: existing.id };
    }

    try {
      const genId = data?.id ? String(data.id) : `zone-${Date.now()}`;
      await db.insert(deliveryZones).values({
        id: genId,
        nameAr,
        nameEn,
        fee: feeVal,
        estimatedMinutes: estMin,
        sortOrder: sortOrd,
      } as any);

      revalidatePath("/", "layout");
      revalidatePath("/admin", "layout");
      return { ok: true, success: true, id: genId };
    } catch {
      const [inserted] = await db
        .insert(deliveryZones)
        .values({
          nameAr,
          nameEn,
          fee: feeVal,
          estimatedMinutes: estMin,
          sortOrder: sortOrd,
        } as any)
        .returning();

      revalidatePath("/", "layout");
      revalidatePath("/admin", "layout");
      return { ok: true, success: true, id: inserted?.id };
    }
  } catch (err: unknown) {
    console.error("upsertZoneAction error:", err);
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error saving zone" };
  }
}

export const adminSaveZoneAction = upsertZoneAction;
export const saveZoneAction = upsertZoneAction;
export const addZoneAction = upsertZoneAction;
export const adminAddZoneAction = upsertZoneAction;

export async function deleteZoneAction(arg1: any, arg2?: any) {
  try {
    const { payload } = resolveArgs(arg1, arg2);
    const id = payload?.id !== undefined ? payload.id : payload;

    try {
      await db.delete(deliveryZones).where(eq(deliveryZones.id, id as any));
    } catch {
      if (typeof id === "string" && !isNaN(Number(id))) {
        await db.delete(deliveryZones).where(eq(deliveryZones.id, Number(id) as any));
      } else {
        await db.delete(deliveryZones).where(eq(deliveryZones.id, String(id) as any));
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminDeleteZoneAction = deleteZoneAction;

// =========================================================================
// 4. حفظ لوحة الإعلانات ونشر العروض (Promo Bulletin)
// =========================================================================
export async function savePromoAction(arg1: any, arg2?: any) {
  try {
    const { payload } = resolveArgs(arg1, arg2);

    const isVisible =
      payload?.enabled === true ||
      payload?.visible === true ||
      payload?.enabled === 1 ||
      payload?.visible === 1;

    const enabledStr = isVisible ? "true" : "false";
    const textAr = String(payload?.textAr || payload?.text || payload?.titleAr || "").trim();
    const textEn = String(payload?.textEn || payload?.titleEn || textAr).trim();

    const promoData = {
      enabled: isVisible,
      visible: isVisible,
      textAr,
      textEn,
      titleAr: textAr,
      titleEn: textEn,
      title: textAr,
      code: String(payload?.code || "LION15"),
    };

    const promoJson = JSON.stringify(promoData);

    const keysToUpdate: Record<string, string> = {
      promo: promoJson,
      promo_bulletin: promoJson,
      promo_enabled: enabledStr,
      promo_text_ar: textAr,
      promo_text_en: textEn,
      bulletin_text_ar: textAr,
      bulletin_text_en: textEn,
      bulletin_enabled: enabledStr,
      bulletin_visible: enabledStr,
    };

    for (const [key, value] of Object.entries(keysToUpdate)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(settings).set({ value }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value });
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true, data: promoData, promo: promoData };
  } catch (err: unknown) {
    console.error("savePromoAction error:", err);
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error saving promo" };
  }
}

export const adminSavePromoAction = savePromoAction;
export const publishPromoAction = savePromoAction;
export const adminPublishPromoAction = savePromoAction;
export const updatePromoAction = savePromoAction;
export const adminUpdatePromoAction = savePromoAction;
export const adminSetPromoAction = savePromoAction;
export const saveBulletinAction = savePromoAction;
export const adminSaveBulletinAction = savePromoAction;
export const publishBulletinAction = savePromoAction;
export const adminPublishBulletinAction = savePromoAction;

// =========================================================================
// 5. إدارة أصناف المنيو (Menu Items)
// =========================================================================
export async function upsertMenuItemAction(arg1: any, arg2?: any) {
  try {
    const { payload: data } = resolveArgs(arg1, arg2);
    const id = data?.id || `item-${Date.now()}`;
    const isAvail = data?.isAvailable === false || data?.isAvailable === 0 ? 0 : 1;
    const img = String(data?.imageUrl ?? data?.image ?? "");

    const existing = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);

    if (existing.length > 0) {
      await db
        .update(menuItems)
        .set({
          categoryId: String(data?.categoryId || ""),
          nameAr: String(data?.nameAr || ""),
          nameEn: String(data?.nameEn || ""),
          descriptionAr: String(data?.descriptionAr || ""),
          descriptionEn: String(data?.descriptionEn || ""),
          price: Number(data?.price || 0),
          imageUrl: img,
          badge: String(data?.badge || ""),
          isAvailable: isAvail,
          sortOrder: Number(data?.sortOrder ?? 0),
        })
        .where(eq(menuItems.id, id));
    } else {
      await db.insert(menuItems).values({
        id,
        categoryId: String(data?.categoryId || ""),
        nameAr: String(data?.nameAr || ""),
        nameEn: String(data?.nameEn || ""),
        descriptionAr: String(data?.descriptionAr || ""),
        descriptionEn: String(data?.descriptionEn || ""),
        price: Number(data?.price || 0),
        imageUrl: img,
        badge: String(data?.badge || ""),
        isAvailable: isAvail,
        sortOrder: Number(data?.sortOrder ?? 0),
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/menu", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true, id };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function deleteMenuItemAction(arg1: any, arg2?: any) {
  try {
    const { payload } = resolveArgs(arg1, arg2);
    const id = payload?.id !== undefined ? payload.id : payload;
    await db.delete(menuItems).where(eq(menuItems.id, String(id)));

    revalidatePath("/", "layout");
    revalidatePath("/menu", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSaveItemAction = upsertMenuItemAction;
export const adminDeleteItemAction = deleteMenuItemAction;

// =========================================================================
// 6. ماسح المنيو الذكي وتجنب الرموز التقديمية
// =========================================================================
export async function adminScanMenuAction(payload: {
  fileName?: string;
  imageBase64: string;
  mimeType?: string;
}) {
  try {
    let apiKey = (
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      ""
    ).trim().replace(/^["']|["']$/g, "");

    if (!apiKey) {
      return {
        success: false,
        ok: false,
        error: "لم يتم العثور على مفتاح GEMINI_API_KEY في إعدادات البيئة بـ Vercel.",
      };
    }

    if (!payload?.imageBase64) {
      return { success: false, ok: false, error: "لم يتم استلام ملف الصورة بشكل صحيح." };
    }

    let cleanBase64 = payload.imageBase64;
    if (cleanBase64.includes(",")) {
      cleanBase64 = cleanBase64.split(",")[1];
    }

    const mimeType = payload.mimeType || "image/jpeg";

    const promptText = `أنت خبير محترف في تحليل وقراءة قوائم طعام المطاعم واستخراج البيانات الميدانية بدقة 100%.
قم بتحليل صورة منيو مطعم بروست الأسد (Broast El-Assad) المرفقة واستخرج جميع الأصناف والوجبات والأسعار والأقسام.
أعد المخرجات في شكل كائن مصفوفة JSON Array نقية ومباشرة بدون أي وسوم ماركداون وبدون أي مقدمات إطلاقاً:
[
  {
    "categoryNameAr": "اسم القسم بالعربي",
    "categoryNameEn": "Category name in English",
    "itemNameAr": "اسم الوجبة أو الصنف بالعربي كاملاً",
    "itemNameEn": "Item name in English",
    "descriptionAr": "مكونات الوجبة إن وجدت",
    "descriptionEn": "",
    "price": 120
  }
]`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            { inlineData: { mimeType, data: cleanBase64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    };

    const candidateEndpoints: string[] = [];

    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      if (listRes.ok) {
        const listData = await listRes.json();
        const validModels = (listData?.models || []).filter((m: any) =>
          m?.supportedGenerationMethods?.includes("generateContent")
        );

        const flashModel = validModels.find(
          (m: any) => m.name.includes("flash") && !m.name.includes("embedding")
        );

        if (flashModel) {
          candidateEndpoints.push(
            `https://generativelanguage.googleapis.com/v1beta/${flashModel.name}:generateContent?key=${apiKey}`
          );
        }

        for (const m of validModels) {
          candidateEndpoints.push(
            `https://generativelanguage.googleapis.com/v1beta/${m.name}:generateContent?key=${apiKey}`
          );
        }
      }
    } catch (e) {
      console.warn("Dynamic model lookup fallback", e);
    }

    candidateEndpoints.push(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`
    );

    let rawText = "";
    let lastError = "";

    for (const url of candidateEndpoints) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (res.ok) {
          const resJson = await res.json();
          rawText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (rawText) break;
        } else {
          lastError = await res.text();
        }
      } catch (err: any) {
        lastError = err?.message || "Connection error";
      }
    }

    if (!rawText) {
      return { success: false, ok: false, error: `تعذر الاتصال بالذكاء الاصطناعي: ${lastError}` };
    }

    let cleanJson = rawText.trim();
    const jsonMatch = cleanJson.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanJson = jsonMatch[0];
    } else if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const items = JSON.parse(cleanJson);
    const rows: ScannedRow[] = items.map((it: any) => ({
      categoryNameAr: String(it.categoryNameAr || it.categoryAr || "أصناف المنيو").trim(),
      categoryNameEn: String(it.categoryNameEn || it.categoryEn || "Menu Items").trim(),
      itemNameAr: String(it.itemNameAr || it.nameAr || it.name || "صنف جديد").trim(),
      itemNameEn: String(it.itemNameEn || it.nameEn || "").trim(),
      descriptionAr: String(it.descriptionAr || it.description || "").trim(),
      descriptionEn: String(it.descriptionEn || "").trim(),
      price: Number(it.price || 0),
    }));

    return { success: true, ok: true, data: rows, rows };
  } catch (err: any) {
    console.error("adminScanMenuAction error:", err);
    return { success: false, ok: false, error: `حدث خطأ تقني: ${err?.message || "يرجى المحاولة مجدداً"}` };
  }
}

export async function adminSaveScannedRowsAction(rows: any[]) {
  try {
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) return { success: false, ok: false, error: "قائمة الأصناف فارغة." };

    const existingCats = await db.select().from(categories).catch(() => []);
    const catMap = new Map<string, string>();
    for (let i = 0; i < existingCats.length; i++) {
      catMap.set(existingCats[i].nameAr.trim().toLowerCase(), existingCats[i].id);
    }

    let nextSortOrder = existingCats.length;

    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      const catNameAr = String(r.categoryNameAr || r.categoryAr || "أصناف المنيو").trim();
      const catNameEn = String(r.categoryNameEn || r.categoryEn || catNameAr).trim();
      const itemNameAr = String(r.itemNameAr || r.nameAr || "").trim();
      const itemNameEn = String(r.itemNameEn || r.nameEn || "").trim();
      const descAr = String(r.descriptionAr || "").trim();
      const descEn = String(r.descriptionEn || "").trim();
      const priceNum = Number(r.price || 0);

      if (!itemNameAr) continue;

      let catId = catMap.get(catNameAr.toLowerCase());
      if (!catId) {
        catId = `cat-${Date.now()}-${i}`;
        await db.insert(categories).values({
          id: catId,
          nameAr: catNameAr,
          nameEn: catNameEn,
          sortOrder: nextSortOrder++,
        });
        catMap.set(catNameAr.toLowerCase(), catId);
      }

      const itemId = `item-${Date.now()}-${i}`;
      await db.insert(menuItems).values({
        id: itemId,
        categoryId: catId,
        nameAr: itemNameAr,
        nameEn: itemNameEn,
        descriptionAr: descAr,
        descriptionEn: descEn,
        price: priceNum,
        imageUrl: "",
        badge: "",
        isAvailable: 1,
        sortOrder: i,
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/menu", "layout");
    revalidatePath("/admin", "layout");
    return { success: true, ok: true };
  } catch (err: any) {
    console.error("adminSaveScannedRowsAction error:", err);
    return { success: false, ok: false, error: err?.message || "فشل حفظ الأصناف في قاعدة البيانات." };
  }
}

// =========================================================================
// 7. تحديث إعدادات الواجهة واللوجو والموقع
// =========================================================================
export async function updateSettingsAction(arg1: any, arg2?: any) {
  try {
    const { payload } = resolveArgs(arg1, arg2);

    const keyMap: Record<string, string> = {
      brandNameAr: "brand_name_ar",
      brandNameEn: "brand_name_en",
      logoUrl: "logo_url",
      heroTitleAr: "hero_title_ar",
      heroSubtitleAr: "hero_subtitle_ar",
      marqueeTextAr: "marquee_text_ar",
      addressAr: "address_ar",
      workingHoursAr: "working_hours_ar",
      hotline: "hotline",
      whatsapp: "whatsapp",
      deliveryFee: "delivery_fee",
      taxPercent: "tax_percent",
      heroImage1: "hero_image_1",
      heroImage2: "hero_image_2",
      heroImage3: "hero_image_3",
      adBanner1: "ad_banner_1",
      adBanner2: "ad_banner_2",
      branchMapsUrl: "branch_maps_url",
      promoTitleAr: "promo_title_ar",
      promoSubtitleAr: "promo_subtitle_ar",
      ctaTitleAr: "cta_title_ar",
      ctaSubtitleAr: "cta_subtitle_ar",
    };

    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(payload || {})) {
      const strVal = typeof v === "object" ? JSON.stringify(v) : String(v ?? "");
      normalized[k] = strVal;
      if (keyMap[k]) normalized[keyMap[k]] = strVal;
    }

    for (const [key, strVal] of Object.entries(normalized)) {
      const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      if (existing.length > 0) {
        await db.update(settings).set({ value: strVal }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value: strVal });
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/menu", "layout");
    revalidatePath("/admin", "layout");
    return { success: true, ok: true };
  } catch (err: unknown) {
    console.error("updateSettingsAction error:", err);
    return { success: false, ok: false, error: err instanceof Error ? err.message : "Error saving settings" };
  }
}

export const adminSetSettingAction = updateSettingsAction;
export const saveFrontendSettingsAction = updateSettingsAction;

// =========================================================================
// 8. الطلبات والعملاء
// =========================================================================
export async function updateOrderStatusAction(arg1: any, arg2?: any) {
  try {
    const { payload } = resolveArgs(arg1, arg2);
    const orderId = payload?.orderId || payload?.id || arg1;
    const status = payload?.status || arg2;

    await db.update(orders).set({ status: String(status) }).where(eq(orders.id, Number(orderId)));
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSetOrderStatusAction = updateOrderStatusAction;

export async function deleteOrderAction(arg1: any, arg2?: any) {
  try {
    const { payload } = resolveArgs(arg1, arg2);
    const idNum = Number(payload?.id || payload);
    await db.delete(orderLines).where(eq(orderLines.orderId, idNum));
    await db.delete(orders).where(eq(orders.id, idNum));
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function upsertCustomerAction(arg1: any, arg2?: any) {
  try {
    const { payload: data } = resolveArgs(arg1, arg2);
    if (data?.id) {
      await db
        .update(customers)
        .set({
          name: String(data.name || ""),
          fullName: String(data.name || ""),
          phone: String(data.phone || ""),
          primaryPhone: String(data.phone || ""),
          loyaltyPoints: Number(data.loyaltyPoints ?? 0),
          discountPercent: Number(data.discountPercent ?? 0),
        })
        .where(eq(customers.id, Number(data.id)));
    } else {
      const code = data?.code || `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      await db.insert(customers).values({
        code,
        name: String(data?.name || "عميل"),
        fullName: String(data?.name || "عميل"),
        phone: String(data?.phone || ""),
        primaryPhone: String(data?.phone || ""),
        loyaltyPoints: Number(data?.loyaltyPoints ?? 0),
        discountPercent: Number(data?.discountPercent ?? 0),
      });
    }
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}
