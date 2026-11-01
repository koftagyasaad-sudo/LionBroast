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
// 2. إدارة الطلبات (OrdersTab.tsx) - حل الخطأ الظاهر في Vercel
// =========================================================================
export async function adminSetOrderStatusAction(
  orderId: string | number,
  status: string
) {
  try {
    const id = Number(orderId);
    if (isNaN(id)) throw new Error("معرف الطلب غير صالح");

    await db
      .update(orders)
      .set({ status } as any)
      .where(eq(orders.id, id as any));

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("adminSetOrderStatusAction error:", error);
    return { success: false, error: error?.message || "فشل تحديث حالة الطلب" };
  }
}

// تصدير المرادفات البديلة لمنع أي تعارض
export const updateOrderStatusAction = adminSetOrderStatusAction;

export async function adminDeleteOrderAction(orderId: string | number) {
  try {
    const id = Number(orderId);
    if (isNaN(id)) throw new Error("معرف الطلب غير صالح");

    await db.delete(orders).where(eq(orders.id, id as any));

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("adminDeleteOrderAction error:", error);
    return { success: false, error: error?.message || "فشل حذف الطلب" };
  }
}

export const deleteOrderAction = adminDeleteOrderAction;

// =========================================================================
// 3. إدارة الأقسام (MenuTab.tsx)
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

      revalidatePath("/");
      revalidatePath("/menu");
      revalidatePath("/admin");
      return { success: true };
    } else {
      const slug =
        nameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "") || `cat-${Date.now()}`;

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

export async function updateCategoryAction(
  id: string | number,
  data: Partial<{
    nameAr: string;
    nameEn: string;
    image: string;
    sortOrder: number;
    isActive: boolean;
  }>
) {
  return upsertCategoryAction({ id, nameAr: data.nameAr || "", ...data });
}

export async function deleteCategoryAction(categoryId: string | number) {
  try {
    const id = Number(categoryId);
    if (isNaN(id)) throw new Error("معرف القسم غير صالح");

    await db.delete(categories).where(eq(categories.id, id as any));

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
// 4. إدارة الأصناف والوجبات (MenuTab.tsx)
// =========================================================================
export async function upsertMenuItemAction(data: {
  id?: string | number;
  categoryId: string | number;
  nameAr: string;
  nameEn?: string;
  price: number;
  descriptionAr?: string;
  image?: string;
  badge?: string;
  sortOrder?: number;
  isAvailable?: boolean;
}) {
  try {
    const nameAr = String(data.nameAr || "").trim();
    if (!nameAr) throw new Error("اسم الوجبة مطلوب");

    if (data.id) {
      const itemId = Number(data.id);
      const updateData: any = {
        nameAr,
        nameEn: data.nameEn || nameAr,
        categoryId: Number(data.categoryId),
        price: Number(data.price || 0),
        descriptionAr: data.descriptionAr || "",
        image: data.image || undefined,
        badge: data.badge || null,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
        isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : undefined,
      };

      await db
        .update(menuItems)
        .set(updateData)
        .where(eq(menuItems.id, itemId as any));

      revalidatePath("/");
      revalidatePath("/menu");
      revalidatePath("/admin");
      return { success: true };
    } else {
      const [inserted] = await db
        .insert(menuItems)
        .values({
          categoryId: Number(data.categoryId),
          nameAr,
          nameEn: String(data.nameEn || nameAr).trim(),
          price: Number(data.price || 0),
          descriptionAr: String(data.descriptionAr || ""),
          image: data.image || "/img/hero-1.png",
          badge: data.badge || null,
          sortOrder: Number(data.sortOrder || 0),
          isAvailable: true,
        } as any)
        .returning();

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

export async function updateMenuItemAction(
  id: string | number,
  data: Partial<{
    categoryId: string | number;
    nameAr: string;
    nameEn: string;
    price: number;
    descriptionAr: string;
    image: string;
    badge: string;
    sortOrder: number;
    isAvailable: boolean;
  }>
) {
  return upsertMenuItemAction({
    id,
    categoryId: data.categoryId || 0,
    nameAr: data.nameAr || "",
    price: data.price || 0,
    ...data,
  });
}

export async function deleteMenuItemAction(itemId: string | number) {
  try {
    const id = Number(itemId);
    await db.delete(menuItems).where(eq(menuItems.id, id as any));

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
// 5. حفظ واعتماد أصناف الذكاء الاصطناعي (MenuTab.tsx)
// =========================================================================
export async function adminSaveScannedRowsAction(data: any) {
  try {
    const rows = Array.isArray(data) ? data : data?.rows || data?.items || [];
    for (const row of rows) {
      const categoryName = String(row.categoryName || row.categoryAr || row.category || "عام").trim();

      const existingCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.nameAr, categoryName));

      let targetCategoryId: number;

      if (existingCategories.length > 0) {
        targetCategoryId = existingCategories[0].id;
      } else {
        const slug = `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const [newCat] = await db
          .insert(categories)
          .values({
            nameAr: categoryName,
            nameEn: row.categoryEn || categoryName,
            slug,
            image: "/img/hero-1.png",
            isActive: true,
          } as any)
          .returning();
        targetCategoryId = newCat.id;
      }

      if (row.nameAr || row.name) {
        await db.insert(menuItems).values({
          categoryId: targetCategoryId,
          nameAr: String(row.nameAr || row.name).trim(),
          nameEn: String(row.nameEn || row.nameAr || row.name).trim(),
          price: Number(row.price || 0),
          descriptionAr: String(row.descriptionAr || row.description || ""),
          image: row.image || "/img/hero-1.png",
          badge: row.badge || null,
          isAvailable: true,
        } as any);
      }
    }

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { success: true, count: rows.length };
  } catch (error: any) {
    console.error("adminSaveScannedRowsAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ الأصناف الممسوحة" };
  }
}

export const saveScannedRowsAction = adminSaveScannedRowsAction;

// =========================================================================
// 6. ماسح المنيو بالذكاء الاصطناعي (AI Scanner)
// =========================================================================
export async function scanMenuAction(imageBase64: string) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير مضاف في Vercel Environment Variables.",
      };
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const promptText = `
أنت خبير إدخال بيانات قوائم طعام المطاعم بدقة 100%.
قم بفحص صورة قائمة طعام مطعم بروست الأسد بدقة، واستخرج جميع الأقسام (Categories) والأصناف (Items) والأسعار بالجنيه المصري (EGP).
أرجع النتيجة بصيغة JSON فقط كالتالي:
{
  "categories": [
    {
      "nameAr": "اسم القسم بالعربية",
      "nameEn": "Category English Name",
      "items": [
        {
          "nameAr": "اسم الوجبة بالعربي",
          "nameEn": "Item English Name",
          "price": 120,
          "descriptionAr": "وصف الوجبة إن وجد"
        }
      ]
    }
  ]
}
`;

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
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: cleanBase64,
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

    if (!response.ok) {
      return {
        success: false,
        error: "تعذر الاتصال بسيرفر الذكاء الاصطناعي، يرجى مراجعة المفتاح وحصته في Google AI Studio.",
      };
    }

    const data = await response.json();
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) {
      return { success: false, error: "لم يتمكن الماسح من استخراج نصوص واضحة من الصورة." };
    }

    const parsed = JSON.parse(rawJson);

    if (parsed.categories && Array.isArray(parsed.categories)) {
      for (let i = 0; i < parsed.categories.length; i++) {
        const cat = parsed.categories[i];
        const resCat = await upsertCategoryAction({
          nameAr: cat.nameAr,
          nameEn: cat.nameEn,
          sortOrder: i,
        });

        if (resCat.success && resCat.category && Array.isArray(cat.items)) {
          for (let j = 0; j < cat.items.length; j++) {
            const it = cat.items[j];
            await upsertMenuItemAction({
              categoryId: resCat.category.id,
              nameAr: it.nameAr,
              nameEn: it.nameEn,
              price: Number(it.price || 0),
              descriptionAr: it.descriptionAr || "",
              sortOrder: j,
            });
          }
        }
      }
    }

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");

    return {
      success: true,
      data: parsed,
      message: "تم استخراج الأصناف وإضافتها لقاعدة البيانات بنجاح 🦁",
    };
  } catch (error: any) {
    console.error("scanMenuAction error:", error);
    return { success: false, error: error?.message || "حدث خطأ أثناء معالجة الصورة." };
  }
}

export const adminScanMenuAction = scanMenuAction;

// =========================================================================
// 7. تبويب العمليات والمناطق والإعلانات (OpsTab.tsx)
// =========================================================================
export async function upsertZoneAction(data: {
  id?: string | number;
  nameAr: string;
  nameEn?: string;
  deliveryFee: number;
  estimatedMinutes?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  try {
    const nameAr = String(data.nameAr || "").trim();
    if (!nameAr) throw new Error("اسم المنطقة مطلوب");

    if (data.id) {
      const zoneId = Number(data.id);
      await db
        .update(deliveryZones)
        .set({
          nameAr,
          nameEn: data.nameEn || nameAr,
          deliveryFee: Number(data.deliveryFee || 0),
          estimatedMinutes: data.estimatedMinutes || "30-45 دقيقة",
          sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
        } as any)
        .where(eq(deliveryZones.id, zoneId as any));
    } else {
      await db.insert(deliveryZones).values({
        nameAr,
        nameEn: String(data.nameEn || nameAr).trim(),
        deliveryFee: Number(data.deliveryFee || 0),
        estimatedMinutes: String(data.estimatedMinutes || "30-45 دقيقة"),
        sortOrder: Number(data.sortOrder || 0),
        isActive: true,
      } as any);
    }

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

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("deleteZoneAction error:", error);
    return { success: false, error: error?.message || "فشل حذف المنطقة" };
  }
}

export const adminDeleteZoneAction = deleteZoneAction;

export async function savePromoAction(promo: {
  enabled: boolean;
  textAr: string;
  code?: string;
  title?: string;
}) {
  try {
    await db
      .insert(settings)
      .values({ key: "promo_enabled", value: promo.enabled ? "true" : "false" })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: promo.enabled ? "true" : "false" },
      });

    await db
      .insert(settings)
      .values({ key: "promo_text_ar", value: promo.textAr || promo.title || "" })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: promo.textAr || promo.title || "" },
      });

    await db
      .insert(settings)
      .values({ key: "promo", value: JSON.stringify(promo) })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: JSON.stringify(promo) },
      });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("savePromoAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ العرض المؤقت" };
  }
}

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
        await db.insert(deliveryZones).values({
          nameAr: String(z.nameAr || z.name || "منطقة"),
          nameEn: String(z.nameEn || z.nameAr || ""),
          deliveryFee: Number(z.deliveryFee || z.fee || 0),
          estimatedMinutes: String(z.estimatedMinutes || z.time || "30-45 دقيقة"),
          sortOrder: i,
          isActive: true,
        } as any);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("saveZonesAndPromoAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ التعديلات" };
  }
}

export async function saveOpsSettingsAction(data: Record<string, any>) {
  try {
    for (const [key, value] of Object.entries(data)) {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
      await db
        .insert(settings)
        .values({ key, value: stringValue })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: stringValue },
        });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("saveOpsSettingsAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ إعدادات العمليات" };
  }
}

export const updateOpsSettingsAction = saveOpsSettingsAction;

// =========================================================================
// 8. تبويب الواجهة (FrontendTab.tsx)
// =========================================================================
export async function saveFrontendSettingsAction(data: Record<string, any>) {
  try {
    for (const [key, value] of Object.entries(data)) {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
      await db
        .insert(settings)
        .values({ key, value: stringValue })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: stringValue },
        });
    }

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
// 9. بطاقة العميل VIP (CustomerQRCode.tsx)
// =========================================================================
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
        set: {
          name,
          phone,
        },
      })
      .returning();

    revalidatePath("/admin");
    return { success: true, customer };
  } catch (error: any) {
    console.error("upsertCustomerAction error:", error);
    return { success: false, error: error?.message || "فشل تسجيل بيانات العميل" };
  }
}

export const saveCustomerAction = upsertCustomerAction;
