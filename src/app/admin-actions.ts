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
import { ensureSeedDatabase } from "@/db/seed";
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

// =========================================================================
// 1. جلب بيانات لوحة التحكم (محصنة بالكامل)
// =========================================================================
export async function adminGetAllAction(token?: string) {
  try {
    if (!checkAuth(token)) {
      throw new Error("Unauthorized");
    }

    await ensureSeedDatabase().catch((e) =>
      console.error("Seed warning in admin bundle:", e)
    );

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

    const settingsMap: Record<string, string> = {};
    for (let i = 0; i < settingsRows.length; i++) {
      settingsMap[settingsRows[i].key] = settingsRows[i].value;
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
      ...settingsMap,
      heroImage1: settingsMap["hero_image_1"] || "",
      heroImage2: settingsMap["hero_image_2"] || "",
      heroImage3: settingsMap["hero_image_3"] || "",
      adBanner1: settingsMap["ad_banner_1"] || "",
      adBanner2: settingsMap["ad_banner_2"] || "",
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
      settings: settingsMap,
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
// 2. محرك مسح المنيو الذكي بواسطة الذكاء الاصطناعي (Gemini Vision Engine)
// =========================================================================
export async function adminScanMenuAction(payload: {
  fileName?: string;
  imageBase64: string;
  mimeType?: string;
}) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_API_KEY?.trim() ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return {
        success: false,
        ok: false,
        error:
          "مفتاح الذكاء الاصطناعي غير متوفر! يرجى إضافة متغير البيئة GEMINI_API_KEY في إعدادات Vercel ثم إعادة النشر.",
      };
    }

    if (!payload?.imageBase64) {
      return {
        success: false,
        ok: false,
        error: "لم يتم استلام ملف الصورة بشكل سليم من المتصفح.",
      };
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

    const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
    let rawText = "";
    let lastError = "";

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
          const errText = await res.text();
          lastError = `Gemini API Status ${res.status}: ${errText}`;
        }
      } catch (err: any) {
        lastError = err?.message || "Connection error";
      }
    }

    if (!rawText) {
      return {
        success: false,
        ok: false,
        error: `فشل التحليل من سيرفر الذكاء الاصطناعي: ${lastError}`,
      };
    }

    let cleanJson = rawText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const items = JSON.parse(cleanJson);
    if (!Array.isArray(items) || items.length === 0) {
      return {
        success: false,
        ok: false,
        error: "لم يتمكن الذكاء الاصطناعي من استخراج أي أصناف من هذه الصورة. يرجى تجربة صورة أوضح أو بزاوية مستقيمة.",
      };
    }

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
      error: `حدث خطأ تقني أثناء تحليل الصورة: ${err?.message || "يرجى التحقق من حجم الصورة"}`,
    };
  }
}

// =========================================================================
// 3. اعتماد وحفظ الأصناف المستخرجة في قاعدة البيانات
// =========================================================================
export async function adminSaveScannedRowsAction(rows: any[]) {
  try {
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) {
      return { success: false, ok: false, error: "قائمة الأصناف فارغة." };
    }

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
        price: priceNum,
        imageUrl: "",
        badge: "",
        isAvailable: 1,
        sortOrder: i,
      });
    }

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { success: true, ok: true };
  } catch (err: any) {
    console.error("adminSaveScannedRowsAction error:", err);
    return {
      success: false,
      ok: false,
      error: err?.message || "فشل حفظ الأصناف في قاعدة البيانات.",
    };
  }
}

// =========================================================================
// 4. العمليات التحريرية العادية (Categories / Menu / Zones / Settings / Orders)
// =========================================================================
export async function upsertCategoryAction(data: any) {
  try {
    const id = data?.id || `cat-${Date.now()}`;
    const existing = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

    if (existing.length > 0) {
      await db
        .update(categories)
        .set({
          nameAr: String(data?.nameAr || ""),
          nameEn: String(data?.nameEn || ""),
          sortOrder: Number(data?.sortOrder ?? 0),
        })
        .where(eq(categories.id, id));
    } else {
      await db.insert(categories).values({
        id,
        nameAr: String(data?.nameAr || ""),
        nameEn: String(data?.nameEn || ""),
        sortOrder: Number(data?.sortOrder ?? 0),
      });
    }
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true, id };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await db.delete(categories).where(eq(categories.id, String(id)));
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSaveCategoryAction = upsertCategoryAction;
export const adminDeleteCategoryAction = deleteCategoryAction;

export async function upsertMenuItemAction(data: any) {
  try {
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
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true, id };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function deleteMenuItemAction(id: string) {
  try {
    await db.delete(menuItems).where(eq(menuItems.id, String(id)));
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSaveItemAction = upsertMenuItemAction;
export const adminDeleteItemAction = deleteMenuItemAction;

export async function upsertZoneAction(data: any) {
  try {
    const id = data?.id || `zone-${Date.now()}`;
    const feeVal = Number(data?.fee ?? data?.price ?? 0);
    const existing = await db.select().from(deliveryZones).where(eq(deliveryZones.id, id)).limit(1);

    if (existing.length > 0) {
      await db
        .update(deliveryZones)
        .set({
          nameAr: String(data?.nameAr || ""),
          nameEn: String(data?.nameEn || ""),
          fee: feeVal,
          estimatedMinutes: Number(data?.estimatedMinutes ?? 30),
          sortOrder: Number(data?.sortOrder ?? 0),
        })
        .where(eq(deliveryZones.id, id));
    } else {
      await db.insert(deliveryZones).values({
        id,
        nameAr: String(data?.nameAr || ""),
        nameEn: String(data?.nameEn || ""),
        fee: feeVal,
        estimatedMinutes: Number(data?.estimatedMinutes ?? 30),
        sortOrder: Number(data?.sortOrder ?? 0),
      });
    }
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true, id };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function deleteZoneAction(id: string) {
  try {
    await db.delete(deliveryZones).where(eq(deliveryZones.id, String(id)));
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSaveZoneAction = upsertZoneAction;
export const adminDeleteZoneAction = deleteZoneAction;

export async function updateSettingsAction(payload: Record<string, any>) {
  try {
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
    };

    const normalized: Record<string, string> = {};
    for (const [k, v] of Object.entries(payload)) {
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
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSetSettingAction = updateSettingsAction;
export const saveFrontendSettingsAction = updateSettingsAction;

export async function updateOrderStatusAction(orderId: number | string, status: string) {
  try {
    await db.update(orders).set({ status: String(status) }).where(eq(orders.id, Number(orderId)));
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSetOrderStatusAction = updateOrderStatusAction;

export async function deleteOrderAction(orderId: number | string) {
  try {
    const idNum = Number(orderId);
    await db.delete(orderLines).where(eq(orderLines.orderId, idNum));
    await db.delete(orders).where(eq(orders.id, idNum));
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function upsertCustomerAction(data: any) {
  try {
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
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}
