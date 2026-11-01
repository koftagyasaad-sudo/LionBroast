"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  categories,
  menuItems,
  settings,
  deliveryZones,
  customers,
} from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";

// =========================================================================
// 1. إدارة الأقسام (Categories) - حل مشكلة إضافة الأقسام يدوياً نهائياً
// =========================================================================
export async function createCategoryAction(data: {
  nameAr: string;
  nameEn?: string;
  image?: string;
  sortOrder?: number;
}) {
  try {
    const nameAr = String(data.nameAr || "").trim();
    if (!nameAr) throw new Error("اسم القسم بالعربية مطلوب");

    const nameEn = String(data.nameEn || nameAr).trim();
    // توليد slug فريد ونظيف لعدم مخالفة قيود قاعدة البيانات
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
  } catch (error: any) {
    console.error("createCategoryAction error:", error);
    return { success: false, error: error?.message || "فشل إضافة القسم" };
  }
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

// =========================================================================
// 2. إدارة الأصناف والوجبات (Menu Items)
// =========================================================================
export async function createMenuItemAction(data: {
  categoryId: string | number;
  nameAr: string;
  nameEn?: string;
  price: number;
  descriptionAr?: string;
  image?: string;
  badge?: string;
  sortOrder?: number;
}) {
  try {
    const [inserted] = await db
      .insert(menuItems)
      .values({
        categoryId: Number(data.categoryId),
        nameAr: String(data.nameAr).trim(),
        nameEn: String(data.nameEn || data.nameAr).trim(),
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
  } catch (error: any) {
    console.error("createMenuItemAction error:", error);
    return { success: false, error: error?.message || "فشل إضافة الوجبة" };
  }
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

// =========================================================================
// 3. ماسح المنيو بالذكاء الاصطناعي (AI Menu Scanner) بنظام DG-Menu المتطور
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
        error:
          "مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير مضاف في Vercel Environment Variables. برجاء إضافته لتفعيل الماسك الذكي.",
      };
    }

    // تنظيف كود الـ Base64
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const promptText = `
أنت خبير إدخال بيانات قوائم طعام المطاعم بدقة 100%.
قم بفحص صورة قائمة طعام مطعم بروست الأسد بدقة، واستخرج جميع الأقسام (Categories) والأصناف (Items) والأسعار بالجنيه المصري (EGP).
أرجع النتيجة بصيغة JSON فقط بدون أي نصوص خارجية كالتالي:
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
      const errText = await response.text();
      console.error("Gemini API Error:", errText);
      return {
        success: false,
        error: "تعذر الاتصال بخادم الذكاء الاصطناعي، تأكد من صحة المفتاح وحصته في Google AI Studio.",
      };
    }

    const data = await response.json();
    const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) {
      return { success: false, error: "لم يتمكن الماسح من استخراج أي نصوص من الصورة." };
    }

    const parsed = JSON.parse(rawJson);

    // إدخال الأقسام والوجبات المستخرجة فوراً إلى قاعدة البيانات
    if (parsed.categories && Array.isArray(parsed.categories)) {
      for (let i = 0; i < parsed.categories.length; i++) {
        const cat = parsed.categories[i];
        const resCat = await createCategoryAction({
          nameAr: cat.nameAr,
          nameEn: cat.nameEn,
          sortOrder: i,
        });

        if (resCat.success && resCat.category && Array.isArray(cat.items)) {
          for (let j = 0; j < cat.items.length; j++) {
            const it = cat.items[j];
            await createMenuItemAction({
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
      message: "تم مسح المنيو واستخراج الأصناف وإضافتها لقاعدة البيانات بنجاح 🦁",
    };
  } catch (error: any) {
    console.error("scanMenuAction error:", error);
    return { success: false, error: error?.message || "حدث خطأ غير متوقع أثناء مسح المنيو." };
  }
}

// =========================================================================
// 4. إدارة المناطق والإعلانات (حل مشكلة عدم الظهور في الواجهة نهائياً)
// =========================================================================
export async function saveZonesAndPromoAction(formData: {
  zones?: any[];
  promo?: {
    enabled: boolean;
    textAr: string;
    code?: string;
  };
}) {
  try {
    // 1. تحديث الإعلانات الترويجية والعروض المؤقتة
    if (formData.promo) {
      const p = formData.promo;
      await db
        .insert(settings)
        .values({ key: "promo_enabled", value: p.enabled ? "true" : "false" })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: p.enabled ? "true" : "false" },
        });

      await db
        .insert(settings)
        .values({ key: "promo_text_ar", value: p.textAr || "" })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: p.textAr || "" },
        });

      await db
        .insert(settings)
        .values({ key: "promo", value: JSON.stringify(p) })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: JSON.stringify(p) },
        });
    }

    // 2. تحديث جدول مناطق التوصيل الفعلي وتخزين نسخة احتياطية
    if (formData.zones && Array.isArray(formData.zones)) {
      // حفظ في جدول deliveryZones المباشر
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

      // حفظ نسخة JSON في جدول settings كحماية إضافية
      await db
        .insert(settings)
        .values({ key: "delivery_zones", value: JSON.stringify(formData.zones) })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: JSON.stringify(formData.zones) },
        });
    }

    // إجبار Next.js على مسح كاش الواجهة الرئيسية وإعادة بنائها بالبيانات الجديدة فوراً
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/menu");

    return { success: true };
  } catch (error: any) {
    console.error("saveZonesAndPromoAction error:", error);
    return { success: false, error: error?.message || "فشل حفظ التعديلات" };
  }
}

// =========================================================================
// 5. حفظ بيانات العميل (VIP Customer Upsert)
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
