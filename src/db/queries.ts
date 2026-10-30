import { db } from "@/db";
import {
  categories,
  menuItems,
  settings,
  deliveryZones,
  customers,
  orders,
  orderLines,
} from "@/db/schema";
import { eq, asc, desc, inArray } from "drizzle-orm";

// =========================================================================
// 1. استعلامات العملاء وبطاقة الولاء VIP
// =========================================================================
export async function getPassData(code: string) {
  try {
    const cleanCode = String(code || "").trim();
    if (!cleanCode) return null;

    const customerRows = await db
      .select()
      .from(customers)
      .where(eq(customers.code, cleanCode))
      .limit(1);

    const customer = customerRows[0] || null;
    if (!customer) {
      return null;
    }

    return {
      customer,
      code: customer.code,
      name: customer.name || customer.fullName || "عميل الأسد VIP",
      loyaltyPoints: Number(customer.loyaltyPoints || 0),
      discountPercent: Number(customer.discountPercent || 0),
      totalSpent: Number(customer.totalSpent || 0),
      totalOrders: Number(customer.totalOrders || 0),
    };
  } catch (err) {
    console.error("getPassData error:", err);
    return null;
  }
}

export const getCustomerByCode = getPassData;

export async function getCustomerByPhone(phone: string) {
  try {
    const cleanPhone = String(phone || "").trim();
    if (!cleanPhone) return null;

    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, cleanPhone))
      .limit(1);

    return rows[0] || null;
  } catch (err) {
    console.error("getCustomerByPhone error:", err);
    return null;
  }
}

export async function createCustomer(data: any) {
  try {
    const code = data?.code || `LION-${Math.floor(100000 + Math.random() * 900000)}`;
    const [inserted] = await db
      .insert(customers)
      .values({
        code,
        name: String(data?.name || data?.fullName || "عميل"),
        fullName: String(data?.name || data?.fullName || "عميل"),
        phone: String(data?.phone || data?.primaryPhone || ""),
        primaryPhone: String(data?.phone || data?.primaryPhone || ""),
        loyaltyPoints: Number(data?.loyaltyPoints || 0),
        discountPercent: Number(data?.discountPercent || 0),
        totalSpent: Number(data?.totalSpent || 0),
        totalOrders: Number(data?.totalOrders || 0),
      } as any)
      .returning();

    return inserted || { id: Date.now(), code, ...data };
  } catch (err) {
    console.error("createCustomer error:", err);
    return null;
  }
}

// =========================================================================
// 2. استعلامات مناطق التوصيل
// =========================================================================
export async function getDeliveryZoneById(id: string | number) {
  try {
    if (!id) return null;
    const idNum = Number(id);

    if (!isNaN(idNum)) {
      const resNum = await db
        .select()
        .from(deliveryZones)
        .where(eq(deliveryZones.id, idNum as any))
        .limit(1);
      if (resNum[0]) return resNum[0];
    }

    const resStr = await db
      .select()
      .from(deliveryZones)
      .where(eq(deliveryZones.id, String(id) as any))
      .limit(1);

    return resStr[0] || null;
  } catch (err) {
    console.error("getDeliveryZoneById error:", err);
    return null;
  }
}

export async function getDeliveryZones() {
  try {
    return await db.select().from(deliveryZones).orderBy(asc(deliveryZones.sortOrder));
  } catch (err) {
    console.error("getDeliveryZones error:", err);
    return [];
  }
}

// =========================================================================
// 3. استعلامات وإنشاء الطلبات (Orders)
// =========================================================================
export async function createOrder(orderData: any, lines: any[] = []) {
  try {
    const [newOrder] = await db
      .insert(orders)
      .values({
        customerId: orderData.customerId ? Number(orderData.customerId) : null,
        customerName: String(orderData.customerName || orderData.name || "عميل"),
        customerPhone: String(orderData.customerPhone || orderData.phone || ""),
        address: String(orderData.address || ""),
        deliveryZoneId: orderData.deliveryZoneId ? Number(orderData.deliveryZoneId) : null,
        deliveryFee: Number(orderData.deliveryFee || 0),
        subtotal: Number(orderData.subtotal || 0),
        totalAmount: Number(orderData.totalAmount || orderData.total || 0),
        status: String(orderData.status || "pending"),
        notes: String(orderData.notes || ""),
      } as any)
      .returning();

    if (newOrder && lines && lines.length > 0) {
      for (const line of lines) {
        await db.insert(orderLines).values({
          orderId: newOrder.id,
          menuItemId: line.menuItemId ? String(line.menuItemId) : null,
          nameAr: String(line.nameAr || line.name || "وجبة"),
          nameEn: String(line.nameEn || line.nameAr || ""),
          price: Number(line.price || 0),
          quantity: Number(line.quantity || 1),
          totalPrice: Number((line.price || 0) * (line.quantity || 1)),
        } as any);
      }
    }

    return newOrder;
  } catch (err) {
    console.error("createOrder error:", err);
    return null;
  }
}

export async function getOrdersByNumbers(orderNumbers: any[]) {
  try {
    if (!orderNumbers || orderNumbers.length === 0) return [];
    const nums = orderNumbers.map((n) => Number(n)).filter((n) => !isNaN(n));
    if (nums.length === 0) return [];

    return await db
      .select()
      .from(orders)
      .where(inArray(orders.id, nums))
      .orderBy(desc(orders.createdAt));
  } catch (err) {
    console.error("getOrdersByNumbers error:", err);
    return [];
  }
}

// =========================================================================
// 4. إعدادات الواجهة الحية (بدون كاش)
// =========================================================================
export async function getFrontendSettings() {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, any> = {};

    for (let i = 0; i < rows.length; i++) {
      const { key, value } = rows[i];
      try {
        if (value && (value.startsWith("{") || value.startsWith("["))) {
          map[key] = JSON.parse(value);
        } else {
          map[key] = value;
        }
      } catch {
        map[key] = value;
      }
    }

    return {
      brandNameAr: map.brand_name_ar || map.brandNameAr || "بروست الأسد",
      brandNameEn: map.brand_name_en || map.brandNameEn || "Broast El-Assad",
      logoUrl: map.logo_url || map.logoUrl || "/img/icon-512.png",
      heroSlides: map.hero_slides || map.heroSlides || null,
      heroImage1: map.hero_image_1 || map.heroImage1 || "/img/hero-1.png",
      heroImage2: map.hero_image_2 || map.heroImage2 || "/img/hero-2.png",
      heroImage3: map.hero_image_3 || map.heroImage3 || "/img/hero-3.png",
      marqueeTextAr:
        map.marquee_text_ar ||
        map.marqueeTextAr ||
        "🔥 أقوى بروست مقرمش وطازج في دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥",
      addressAr:
        map.address_ar ||
        map.addressAr ||
        "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية",
      workingHoursAr: map.working_hours_ar || map.workingHoursAr || "يومياً من 10 صباحا حتى 4 فجرا",
      hotline: map.hotline || "0248813666",
      whatsapp: map.whatsapp || "201034419424",
      branchMapsUrl:
        map.branch_maps_url ||
        map.branchMapsUrl ||
        "https://maps.google.com/?q=دسوق+شارع+الجيش",
      locationTitleAr: map.location_title_ar || map.locationTitleAr || "شرفنا في فرع بروست الأسد 🦁",
      locationSubtitleAr:
        map.location_subtitle_ar ||
        map.locationSubtitleAr ||
        "نقدم لك أعلى جودة وأسرع خدمة تيك واي ودليفري في دسوق والمناطق المجاورة.",
      promoBadgeAr: map.promo_badge_ar || map.promoBadgeAr || "عروض ومميزات بروست الأسد VIP 🍗",
      promoTitleAr:
        map.promo_title_ar ||
        map.promoTitleAr ||
        "أكبر قطعة بروست في دسوق.. قرمشة وتتبيلة ملهاش زي! 🍗",
      promoSubtitleAr:
        map.promo_subtitle_ar ||
        map.promoSubtitleAr ||
        "اطلب دلوقتي من المنيو واستمتع بأقوى عروض التوفير العائلية والفردية...",
      promoBtnTextAr: map.promo_btn_text_ar || map.promoBtnTextAr || "اطلب الآن 🍗",
      promoBtnLink: map.promo_btn_link || map.promoBtnLink || "/menu",
      ctaTitleAr: map.cta_title_ar || map.ctaTitleAr || "جوعان؟ الأسد مستنيك.",
      ctaSubtitleAr:
        map.cta_subtitle_ar ||
        map.ctaSubtitleAr ||
        "اطلب على واتساب في ٣٠ ثانية – أو كلم الخط الساخن والفرن يولّع على طول.",
      footerAboutAr:
        map.footer_about_ar ||
        map.footerAboutAr ||
        "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر.",
      footerCopyrightAr:
        map.footer_copyright_ar ||
        map.footerCopyrightAr ||
        "© 2026 بروست الأسد . جميع الحقوق محفوظة.",
      footerSloganAr:
        map.footer_slogan_ar ||
        map.footerSloganAr ||
        "توصيل سريع داخل دسوق • طعم أسدي أصلي",
      ...map,
    };
  } catch (err) {
    console.error("getFrontendSettings error:", err);
    return null;
  }
}

// =========================================================================
// 5. التصنيفات وقائمة الطعام الحية
// =========================================================================
export async function getCategoriesWithItems() {
  try {
    const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    const items = await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));

    return cats.map((cat) => ({
      ...cat,
      items: items.filter((item) => String(item.categoryId) === String(cat.id)),
    }));
  } catch (err) {
    console.error("getCategoriesWithItems error:", err);
    return [];
  }
}

export async function getMenuItems() {
  try {
    return await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));
  } catch (err) {
    console.error("getMenuItems error:", err);
    return [];
  }
}

// =========================================================================
// 6. استعلام لوحة الإعلانات الترويجية
// =========================================================================
export async function getPromo() {
  try {
    const rows = await db.select().from(settings);
    const map: Record<string, string> = {};
    for (let i = 0; i < rows.length; i++) {
      map[rows[i].key] = rows[i].value;
    }

    if (map["promo"]) {
      try {
        return JSON.parse(map["promo"]);
      } catch {}
    }

    const enabled = map["promo_enabled"] !== "false" && map["bulletin_enabled"] !== "false";
    const textAr = map["promo_text_ar"] || map["bulletin_text_ar"] || "";

    return {
      enabled,
      visible: enabled,
      textAr,
      title: textAr,
      code: map["promo_code"] || "LION15",
    };
  } catch (err) {
    console.error("getPromo error:", err);
    return null;
  }
}
