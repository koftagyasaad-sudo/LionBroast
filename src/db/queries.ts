// src/db/queries.ts

import { db } from "./index";
import {
  categories,
  menuItems,
  orders,
  orderLines,
  customers,
  deliveryZones,
  settings,
  type Category,
  type MenuItem,
  type DeliveryZone,
} from "./schema";
import { eq, inArray, desc, asc } from "drizzle-orm";
import { ensureSeedDatabase } from "./seed";

export type FrontendSettings = {
  brand_name: string;
  logo_url: string;
  hero_title_ar: string;
  hero_title_en: string;
  hero_desc_ar: string;
  hero_desc_en: string;
  marquee_ar: string;
  marquee_en: string;
  footer_text_ar: string;
  footer_text_en: string;
  address_ar: string;
  address_en: string;
  working_hours_ar: string;
  working_hours_en: string;
  hotline: string;
  whatsapp_number: string;
};

export type CustomerPassData = {
  customer: {
    code: string;
    fullName: string;
    primaryPhone: string;
    primaryAddress: string;
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    discountPercent: number;
  };
  ordersList: Array<{
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
  ordersCount: number;
  ltv: number;
  zone: any;
};

export type CategoryWithItems = Category & {
  items: MenuItem[];
};

export type ZoneDTO = {
  id: string;
  nameAr: string;
  nameEn: string;
  fee: number;
  price: number;
  estimatedMinutes: number;
  sortOrder: number;
  isActive: boolean;
};

export type MenuData = {
  categories: CategoryWithItems[];
  items: MenuItem[];
  zones: ZoneDTO[];
};

/**
 * 1. إعدادات الواجهة والـ CMS
 */
export async function getFrontendSettings(): Promise<FrontendSettings> {
  try {
    let rows = await db.select().from(settings);
    if (!rows || rows.length === 0) {
      await ensureSeedDatabase();
      rows = await db.select().from(settings);
    }

    const settingsMap: Record<string, string> = {};
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }

    return {
      brand_name: settingsMap.brand_name || "بروست الأسد",
      logo_url: settingsMap.logo_url || "",
      hero_title_ar: settingsMap.hero_title_ar || "أفضل بروستد في دسوق",
      hero_title_en: settingsMap.hero_title_en || "Best Broast in Desouk",
      hero_desc_ar:
        settingsMap.hero_desc_ar ||
        "دجاج طازج يومياً، تتبيلة سرية، وقرمشة لا تقاوم!",
      hero_desc_en:
        settingsMap.hero_desc_en ||
        "Fresh daily chicken, secret seasoning, irresistible crunch!",
      marquee_ar:
        settingsMap.marquee_ar ||
        "🔥 خصم 10% على الطلب الأول عبر الموقع! | 🚀 توصيل سريع لجميع مناطق دسوق | 🍗 جرب البروست الحار الآن!",
      marquee_en:
        settingsMap.marquee_en ||
        "🔥 10% OFF your first order! | 🚀 Fast delivery across Desouk | 🍗 Try our Spicy Broast now!",
      footer_text_ar:
        settingsMap.footer_text_ar ||
        "بروست الأسد - طعم القرمشة الحقيقية في دسوق.",
      footer_text_en:
        settingsMap.footer_text_en ||
        "Broast El-Assad - Real Crispy Taste in Desouk.",
      address_ar:
        settingsMap.address_ar || "دسوق - شارع الجيش - بجوار عمر أفندي",
      address_en:
        settingsMap.address_en || "Desouk - El-Gaish St - Next to Omar Effendi",
      working_hours_ar:
        settingsMap.working_hours_ar || "يومياً من 12 ظهراً حتى 2 صباحاً",
      working_hours_en:
        settingsMap.working_hours_en || "Daily from 12:00 PM to 2:00 AM",
      hotline: settingsMap.hotline || "19999",
      whatsapp_number: settingsMap.whatsapp_number || "201012345678",
    };
  } catch (err) {
    console.error("Error in getFrontendSettings:", err);
    return {
      brand_name: "بروست الأسد",
      logo_url: "",
      hero_title_ar: "أفضل بروستد في دسوق",
      hero_title_en: "Best Broast in Desouk",
      hero_desc_ar: "دجاج طازج يومياً، تتبيلة سرية، وقرمشة لا تقاوم!",
      hero_desc_en: "Fresh daily chicken, secret seasoning, irresistible crunch!",
      marquee_ar:
        "🔥 خصم 10% على الطلب الأول عبر الموقع! | 🚀 توصيل سريع لجميع مناطق دسوق | 🍗 جرب البروست الحار الآن!",
      marquee_en:
        "🔥 10% OFF your first order! | 🚀 Fast delivery across Desouk | 🍗 Try our Spicy Broast now!",
      footer_text_ar: "بروست الأسد - طعم القرمشة الحقيقية في دسوق.",
      footer_text_en: "Broast El-Assad - Real Crispy Taste in Desouk.",
      address_ar: "دسوق - شارع الجيش - بجوار عمر أفندي",
      address_en: "Desouk - El-Gaish St - Next to Omar Effendi",
      working_hours_ar: "يومياً من 12 ظهراً حتى 2 صباحاً",
      working_hours_en: "Daily from 12:00 PM to 2:00 AM",
      hotline: "19999",
      whatsapp_number: "201012345678",
    };
  }
}

/**
 * 2. استعلامات القائمة والمنيو
 */
export async function getCategoriesWithItems(): Promise<CategoryWithItems[]> {
  try {
    let cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    if (!cats || cats.length === 0) {
      await ensureSeedDatabase();
      cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    }

    const itemsList = await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));

    return cats.map((cat) => ({
      ...cat,
      items: itemsList.filter((it) => it.categoryId === cat.id),
    }));
  } catch (err) {
    console.error("Error in getCategoriesWithItems:", err);
    return [];
  }
}

export async function getMenuData(): Promise<MenuData> {
  try {
    let cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    if (!cats || cats.length === 0) {
      await ensureSeedDatabase();
      cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));
    }

    const itemsList = await db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));
    const zonesList = await db.select().from(deliveryZones).orderBy(asc(deliveryZones.sortOrder));

    const categoriesWithItems = cats.map((cat) => ({
      ...cat,
      items: itemsList.filter((it) => it.categoryId === cat.id),
    }));

    const mappedZones: ZoneDTO[] = zonesList.map((z) => ({
      id: z.id,
      nameAr: z.nameAr,
      nameEn: z.nameEn,
      fee: z.fee,
      price: z.fee,
      estimatedMinutes: z.estimatedMinutes,
      sortOrder: z.sortOrder,
      isActive: true,
    }));

    return {
      categories: categoriesWithItems,
      items: itemsList,
      zones: mappedZones,
    };
  } catch (err) {
    console.error("Error in getMenuData:", err);
    return {
      categories: [],
      items: [],
      zones: [],
    };
  }
}

export async function getPromo() {
  return {
    enabled: true,
    title: "خصم 10% على الطلب الأول",
    code: "LION10",
  };
}

/**
 * 3. استعلامات العملاء والكروت
 */
export async function getCustomerByPhone(phone: string) {
  try {
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.primaryPhone, phone))
      .limit(1);

    if (rows[0]) return rows[0];

    const fallbackRows = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, phone))
      .limit(1);

    return fallbackRows[0] || null;
  } catch (err) {
    console.error("Error in getCustomerByPhone:", err);
    return null;
  }
}

export async function getCustomerByCode(code: string) {
  try {
    const rows = await db
      .select()
      .from(customers)
      .where(eq(customers.code, code))
      .limit(1);
    return rows[0] || null;
  } catch (err) {
    console.error("Error in getCustomerByCode:", err);
    return null;
  }
}

export async function getPassData(phoneOrCode: string): Promise<CustomerPassData | null> {
  try {
    const cust =
      (await getCustomerByPhone(phoneOrCode)) ||
      (await getCustomerByCode(phoneOrCode));

    if (!cust) return null;

    const phone = cust.primaryPhone || cust.phone || "";
    let customerOrders: any[] = [];
    if (phone) {
      customerOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.customerPhone, phone))
        .orderBy(desc(orders.createdAt));
    }

    return {
      customer: {
        code: cust.code,
        fullName: cust.fullName || cust.name || "عميل بروست الأسد",
        primaryPhone: cust.primaryPhone || cust.phone || "",
        primaryAddress: cust.primaryAddress || cust.address || "",
        totalOrders: cust.totalOrders || customerOrders.length || 0,
        totalSpent: cust.totalSpent || 0,
        loyaltyPoints: cust.loyaltyPoints || 0,
        discountPercent: cust.discountPercent || 0,
      },
      ordersList: customerOrders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt
          ? new Date(o.createdAt).toISOString()
          : new Date().toISOString(),
      })),
      ordersCount: cust.totalOrders || customerOrders.length || 0,
      ltv: cust.totalSpent || 0,
      zone: null,
    };
  } catch (err) {
    console.error("Error in getPassData:", err);
    return null;
  }
}

export async function createCustomer(data: {
  fullName: string;
  primaryPhone: string;
  primaryAddress?: string;
}) {
  const code = `LION-${Math.floor(100000 + Math.random() * 900000)}`;
  const [newCust] = await db
    .insert(customers)
    .values({
      code,
      fullName: data.fullName,
      name: data.fullName,
      primaryPhone: data.primaryPhone,
      phone: data.primaryPhone,
      primaryAddress: data.primaryAddress || "",
      address: data.primaryAddress || "",
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      discountPercent: 0,
    })
    .returning();

  return newCust;
}

/**
 * 4. استعلامات مناطق التوصيل
 */
export async function getDeliveryZoneById(id: string) {
  try {
    if (!id) return null;
    const rows = await db
      .select()
      .from(deliveryZones)
      .where(eq(deliveryZones.id, id))
      .limit(1);
    if (!rows[0]) return null;
    const z = rows[0];
    return {
      ...z,
      fee: z.fee,
      price: z.fee,
      isActive: true,
    };
  } catch (err) {
    console.error("Error in getDeliveryZoneById:", err);
    return null;
  }
}

export async function getDeliveryZones(): Promise<ZoneDTO[]> {
  try {
    let zones = await db
      .select()
      .from(deliveryZones)
      .orderBy(asc(deliveryZones.sortOrder));

    if (!zones || zones.length === 0) {
      await ensureSeedDatabase();
      zones = await db
        .select()
        .from(deliveryZones)
        .orderBy(asc(deliveryZones.sortOrder));
    }

    return zones.map((z) => ({
      id: z.id,
      nameAr: z.nameAr,
      nameEn: z.nameEn,
      fee: z.fee,
      price: z.fee,
      estimatedMinutes: z.estimatedMinutes,
      sortOrder: z.sortOrder,
      isActive: true,
    }));
  } catch (err) {
    console.error("Error in getDeliveryZones:", err);
    return [];
  }
}

/**
 * 5. استعلامات الطلبات
 */
export async function getAllOrders() {
  try {
    const ords = await db.select().from(orders).orderBy(desc(orders.createdAt));
    if (!ords || ords.length === 0) return [];

    const orderIds = ords.map((o) => o.id);
    const lines = await db
      .select()
      .from(orderLines)
      .where(inArray(orderLines.orderId, orderIds));

    return ords.map((ord) => ({
      ...ord,
      items: lines.filter((l) => l.orderId === ord.id),
    }));
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    return [];
  }
}

export async function getOrdersByNumbers(orderNumbers: string[]) {
  try {
    if (!orderNumbers || orderNumbers.length === 0) return [];

    const ords = await db
      .select()
      .from(orders)
      .where(inArray(orders.orderNumber, orderNumbers))
      .orderBy(desc(orders.createdAt));

    if (!ords || ords.length === 0) return [];

    const orderIds = ords.map((o) => o.id);
    const lines = await db
      .select()
      .from(orderLines)
      .where(inArray(orderLines.orderId, orderIds));

    return ords.map((ord) => {
      const items = lines.filter((l) => l.orderId === ord.id);
      return {
        ...ord,
        items,
        itemsCount: items.reduce((sum, item) => sum + item.quantity, 0) || 1,
      };
    });
  } catch (err) {
    console.error("Error in getOrdersByNumbers:", err);
    return [];
  }
}

export async function createOrder(data: {
  orderNumber: string;
  customerPhone: string;
  customerName: string;
  address: string;
  zoneId?: string | null;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  notes?: string;
  items: {
    itemId?: string;
    nameAr: string;
    price: number;
    quantity: number;
  }[];
}) {
  const [newOrder] = await db
    .insert(orders)
    .values({
      orderNumber: data.orderNumber,
      customerPhone: data.customerPhone,
      customerName: data.customerName,
      address: data.address,
      zoneId: data.zoneId || null,
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      totalAmount: data.totalAmount,
      status: "pending",
      notes: data.notes || "",
    })
    .returning();

  if (data.items && data.items.length > 0) {
    await db.insert(orderLines).values(
      data.items.map((it) => ({
        orderId: newOrder.id,
        itemId: it.itemId || null,
        nameAr: it.nameAr,
        price: it.price,
        quantity: it.quantity,
      }))
    );
  }

  const existingCust = await getCustomerByPhone(data.customerPhone);
  if (existingCust) {
    const updatedOrders = (existingCust.totalOrders || 0) + 1;
    const updatedSpent = (existingCust.totalSpent || 0) + data.totalAmount;
    const addedPoints = Math.floor(data.totalAmount / 10);
    const updatedPoints = (existingCust.loyaltyPoints || 0) + addedPoints;

    await db
      .update(customers)
      .set({
        totalOrders: updatedOrders,
        totalSpent: updatedSpent,
        loyaltyPoints: updatedPoints,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, existingCust.id));
  }

  return newOrder;
}
