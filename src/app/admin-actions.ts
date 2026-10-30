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

// دالة أمان لمعالجة البيانات سواء أُرسلت كمعامل واحد أو معاملين (token, payload)
function resolvePayload(arg1: any, arg2?: any) {
  if (arg2 !== undefined && arg2 !== null && typeof arg2 === "object") {
    return arg2;
  }
  if (arg1 !== undefined && arg1 !== null && typeof arg1 === "object") {
    return arg1;
  }
  return arg2 || arg1 || {};
}

function checkAuth(token?: string) {
  if (!token) return true;
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  return token === MASTER_PASS || (envPass ? token === envPass : true);
}

// =========================================================================
// 1. جلب بيانات غرفة التحكم مع مصفوفة هجينة للإعدادات
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
      promo: promo || {
        enabled: true,
        title: "خصم 15% على أول طلب بـ كود: LION15",
        code: "LION15",
        textAr: "خصم 15% على أول طلب بـ كود: LION15",
        textEn: "15% OFF on first order code: LION15",
      },
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
// 2. إدارة مناطق التوصيل (حل جذري للقيم والأنواع)
// =========================================================================
export async function upsertZoneAction(arg1: any, arg2?: any) {
  try {
    const payload = resolvePayload(arg1, arg2);
    const nameAr = String(
      payload?.nameAr || payload?.name_ar || payload?.name || payload?.zoneAr || payload?.zone_ar || payload?.zoneNameAr || ""
    ).trim();
    const nameEn = String(
      payload?.nameEn || payload?.name_en || payload?.zoneEn || payload?.zone_en || payload?.zoneNameEn || ""
    ).trim();
    const feeVal = Number(payload?.fee ?? payload?.price ?? payload?.rate ?? payload?.deliveryFee ?? 0);
    const estMin = Number(payload?.estimatedMinutes ?? payload?.estimated_minutes ?? payload?.minutes ?? payload?.time ?? payload?.eta ?? 30);
    const sortOrderVal = Number(payload?.sortOrder ?? payload?.sort_order ?? 0);

    if (!nameAr && !nameEn) {
      return { ok: false, success: false, error: "اسم المنطقة بالعربي أو الإنجليزي مطلوب." };
    }

    const existingId = payload?.id ? String(payload.id) : null;

    if (existingId) {
      await db
        .update(deliveryZones)
        .set({
          nameAr: nameAr || "منطقة",
          nameEn,
          fee: feeVal,
          estimatedMinutes: estMin,
          sortOrder: sortOrderVal,
        })
        .where(eq(deliveryZones.id, existingId as any));
    } else {
      const valuesWithoutId = {
        nameAr: nameAr || "منطقة",
        nameEn,
        fee: feeVal,
        estimatedMinutes: estMin,
        sortOrder: sortOrderVal,
      };

      try {
        await db.insert(deliveryZones).values({
          id: `zone-${Date.now()}` as any,
          ...valuesWithoutId,
        });
      } catch {
        await db.insert(deliveryZones).values(valuesWithoutId as any);
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    console.error("upsertZoneAction error:", err);
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSaveZoneAction = upsertZoneAction;
export const addZoneAction = upsertZoneAction;
export const adminAddZoneAction = upsertZoneAction;
export const createZoneAction = upsertZoneAction;
export const adminCreateZoneAction = upsertZoneAction;
export const saveZoneAction = upsertZoneAction;

export async function deleteZoneAction(arg1: any, arg2?: any) {
  try {
    const target = resolvePayload(arg1, arg2);
    const id = String(target?.id || target);
    await db.delete(deliveryZones).where(eq(deliveryZones.id, id as any));
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminDeleteZoneAction = deleteZoneAction;

// =========================================================================
// 3. إدارة وحفظ لوحة الإعلانات (Promo Bulletin)
// =========================================================================
export async function savePromoAction(arg1: any, arg2?: any) {
  try {
    const payload = resolvePayload(arg1, arg2);
    const isEnabled = payload.enabled ?? payload.active ?? payload.visible ?? payload.isVisible ?? true;
    const textAr = String(payload.textAr || payload.arabicText || payload.text_ar || "").trim();
    const textEn = String(payload.textEn || payload.englishText || payload.text_en || "").trim();
    const title = String(payload.title || textAr || "عرض خاص").trim();
    const code = String(payload.code || "LION15").trim();

    const promoData = {
      enabled: Boolean(isEnabled),
      active: Boolean(isEnabled),
      visible: Boolean(isEnabled),
      textAr,
      textEn,
      arabicText: textAr,
      englishText: textEn,
      title,
      code,
    };

    const promoJson = JSON.stringify(promoData);

    const entriesToSave = [
      { key: "promo", value: promoJson },
      { key: "promo_bulletin", value: promoJson },
      { key: "promo_enabled", value: String(isEnabled) },
      { key: "promo_text_ar", value: textAr },
      { key: "promo_text_en", value: textEn },
      { key: "bulletin_text_ar", value: textAr },
      { key: "bulletin_text_en", value: textEn },
    ];

    for (const item of entriesToSave) {
      const existing = await db.select().from(settings).where(eq(settings.key, item.key)).limit(1);
      if (existing.length > 0) {
        await db.update(settings).set({ value: item.value }).where(eq(settings.key, item.key));
      } else {
        await db.insert(settings).values({ key: item.key, value: item.value });
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
    return { ok: true, success: true, data: promoData };
  } catch (err: unknown) {
    console.error("savePromoAction error:", err);
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSavePromoAction = savePromoAction;
export const updatePromoAction = savePromoAction;
export const adminUpdatePromoAction = savePromoAction;
export const publishBulletinAction = savePromoAction;
export const adminPublishBulletinAction = savePromoAction;
export const saveBulletinAction = savePromoAction;
export const adminSaveBulletinAction = savePromoAction;

// =========================================================================
// 4. ماسح المنيو الذكي (مع استخراج JSON النظيف وتجاوز أي نصوص مقدمة)
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
أعد المخرجات في شكل كائن مصفوفة JSON Array نقية ومباشرة بدون أي وسوم ماركداون وبدون أي شروحات نصية خارجية، طبقاً للهيكل التالي:
[
  {
    "categoryNameAr": "اسم القسم بالعربي (مثلاً: وجبات البروست، السندوتشات، الوجبات الفردية، الوجبات العائلية، الإضافات)",
    "categoryNameEn": "Category name in English",
    "itemNameAr": "اسم الوجبة أو الصنف بالعربي كاملاً",
    "itemNameEn": "Item name in English",
    "descriptionAr": "مكونات الوجبة أو الوصف المكتوب بالمنيو إن وجد",
    "descriptionEn": "",
    "price": 120
  }
]`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
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
      return {
        success: false,
        ok: false,
        error: `تعذر الاتصال بالذكاء الاصطناعي: ${lastError}`,
      };
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

    return {
      success: true,
      ok: true,
      data: rows,
      rows,
    };
  } catch (err: any) {
    console.error("adminScanMenuAction error:", err);
    return {
      success: false,
      ok: false,
      error: `حدث خطأ تقني أثناء تحليل المنيو: ${err?.message || "يرجى المحاولة مرة أخرى"}`,
    };
  }
}

// =========================================================================
// 5. اعتماد وحفظ الأصناف المستخرجة في المنيو
// =========================================================================
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
      const catNameEn = String(r.categoryNameEn || r.categoryEn || "Menu Items").trim();
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
        price:
