import { db } from "./index";
import { categories, menuItems, deliveryZones, settings, customers, orders, orderLines } from "./schema";
import { eq, desc, inArray } from "drizzle-orm";
import type { CategoryDTO, MenuItemDTO, ZoneDTO, Promo, FrontendSettings, CustomerPassData } from "@/lib/types";
import { ensureSeedDatabase } from "./seed";

// Mapper Functions
export function mapCategoryToDTO(cat: typeof categories.$inferSelect): CategoryDTO {
  return {
    id: cat.id,
    nameAr: cat.nameAr,
    nameEn: cat.nameEn || undefined,
    sortOrder: cat.sortOrder || 0,
    image: "",
    isActive: true,
  };
}

export function mapMenuItemToDTO(item: typeof menuItems.$inferSelect): MenuItemDTO {
  return {
    id: item.id,
    categoryId: item.categoryId,
    nameAr: item.nameAr,
    nameEn: item.nameEn || undefined,
    descriptionAr: item.descriptionAr || undefined,
    descriptionEn: item.descriptionEn || undefined,
    price: Number(item.price || 0),
    image: item.image || undefined,
    isAvailable: Boolean(item.isAvailable),
    sortOrder: item.sortOrder || 0,
    spicyOption: Boolean(item.spicyOption),
    isBestSeller: Boolean(item.isBestSeller),
    sizes: item.sizes ? (item.sizes as { name: string; price: number }[]) : undefined,
  };
}

export function mapZoneToDTO(zone: typeof deliveryZones.$inferSelect): ZoneDTO {
  return {
    id: zone.id,
    nameAr: zone.nameAr,
    nameEn: zone.nameEn || undefined,
    price: Number(zone.fee || 0),
    fee: Number(zone.fee || 0),
    estimatedMinutes: zone.estimatedMinutes || 30,
    isActive: true,
  };
}

export async function getSettingByKey(key: string): Promise<{ key: string; val: string } | null> {
  await ensureSeedDatabase();
  try {
    const res = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    return res[0] || null;
  } catch (err) {
    console.error("Error fetching setting:", key, err);
    return null;
  }
}

export async function getFrontendSettings(): Promise<FrontendSettings> {
  await ensureSeedDatabase();
  try {
    const rows = await db.select().from(settings);
    const map = new Map<string, string>();
    for (const r of rows) {
      map.set(r.key, r.val);
    }

    return {
      brandNameAr: map.get("brand_name_ar") || "بروست الأسد",
      brandNameEn: map.get("brand_name_en") || "Lion Broast",
      logoUrl: map.get("logo_url") || "",
      heroTitleAr: map.get("hero_title_ar") || "أقوى بروست مقرمش وطازج في دسوق",
      heroSubtitleAr: map.get("hero_subtitle_ar") || "طعم لا يُقاوم وخبرة سنوات من التتبيل السرّي الخاص!",
      marqueeTextAr: map.get("marquee_text_ar") || "🔥 توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥",
      footerTextAr: map.get("footer_text_ar") || "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر.",
      addressAr: map.get("address_ar") || "دسوق - شارع الجلاء - بجوار مسجد الإبراهيمي",
      workingHoursAr: map.get("working_hours_ar") || "يومياً من 12 ظهراً حتى 2 صباحاً",
      hotline: map.get("hotline") || "01000000000",
      whatsapp: map.get("whatsapp") || "201000000000",
      deliveryFee: Number(map.get("delivery_fee") || 15),
      taxPercent: Number(map.get("tax_percent") || 0),
    };
  } catch (err) {
    console.error("Error in getFrontendSettings:", err);
    return {
      brandNameAr: "بروست الأسد",
      brandNameEn: "Lion Broast",
      logoUrl: "",
      heroTitleAr: "أقوى بروست مقرمش وطازج في دسوق",
      heroSubtitleAr: "طعم لا يُقاوم وخبرة سنوات من التتبيل السرّي الخاص!",
      marqueeTextAr: "🔥 توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥",
      footerTextAr: "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر.",
      addressAr: "دسوق - شارع الجلاء - بجوار مسجد الإبراهيمي",
      workingHoursAr: "يومياً من 12 ظهراً حتى 2 صباحاً",
      hotline: "01000000000",
      whatsapp: "201000000000",
      deliveryFee: 15,
      taxPercent: 0,
    };
  }
}

export async function getPromo(): Promise<Promo> {
  await ensureSeedDatabase();
  try {
    const bannerSetting = await getSettingByKey("promo_banner");
    if (bannerSetting && bannerSetting.val) {
      const parsed = JSON.parse(bannerSetting.val);
      return {
        enabled: Boolean(parsed.enabled ?? true),
        title: String(parsed.title || "خصم 15% على أول طلب بـ كود: LION15"),
        code: String(parsed.code || "LION15"),
        textAr: String(parsed.textAr || parsed.title || "خصم 15% على أول طلب بـ كود: LION15"),
        textEn: String(parsed.textEn || parsed.title || "15% OFF on first order code: LION15"),
      };
    }
  } catch (err) {
    console.error("Error reading promo setting:", err);
  }

  return {
    enabled: true,
    title: "خصم 15% على أول طلب بـ كود: LION15",
    code: "LION15",
    textAr: "خصم 15% على أول طلب بـ كود: LION15",
    textEn: "15% OFF on first order code: LION15",
  };
}

export async function getCategoriesWithItems(): Promise<CategoryDTO[]> {
  await ensureSeedDatabase();
  const cats = await db.select().from(categories).orderBy(categories.sortOrder);
  return cats.map(mapCategoryToDTO);
}

export async function getDeliveryZones(): Promise<ZoneDTO[]> {
  await ensureSeedDatabase();
  const zonesList = await db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder);
  return zonesList.map(mapZoneToDTO);
}

export async function getMenuData(): Promise<{ categories: CategoryDTO[]; items: MenuItemDTO[]; zones: ZoneDTO[] }> {
  await ensureSeedDatabase();
  const [cats, rawItems, rawZones] = await Promise.all([
    db.select().from(categories).orderBy(categories.sortOrder),
    db.select().from(menuItems).orderBy(menuItems.sortOrder),
    db.select().from(deliveryZones).orderBy(deliveryZones.sortOrder),
  ]);

  return {
    categories: cats.map(mapCategoryToDTO),
    items: rawItems.map(mapMenuItemToDTO),
    zones: rawZones.map(mapZoneToDTO),
  };
}

export async function getCustomerByPhone(phone: string) {
  await ensureSeedDatabase();
  const res = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  return res[0] || null;
}

export async function getCustomerByCode(passCode: string) {
  await ensureSeedDatabase();
  const res = await db.select().from(customers).where(eq(customers.passCode, passCode)).limit(1);
  return res[0] || null;
}

export async function getPassData(passCode: string): Promise<CustomerPassData | null> {
  await ensureSeedDatabase();
  const customer = await getCustomerByCode(passCode);
  if (!customer) return null;

  const ordersList = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customer.id))
    .orderBy(desc(orders.createdAt));

  const ltv = ordersList.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);

  let zone: ZoneDTO | null = null;
  if (ordersList.length > 0 && ordersList[0].deliveryZoneId) {
    const z = await db
      .select()
      .from(deliveryZones)
      .where(eq(deliveryZones.id, ordersList[0].deliveryZoneId))
      .limit(1);
    if (z[0]) zone = mapZoneToDTO(z[0]);
  }

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      passCode: customer.passCode,
      totalOrders: customer.totalOrders || ordersList.length,
      totalSpent: Number(customer.totalSpent || ltv),
      loyaltyPoints: customer.loyaltyPoints || 0,
      discountPercent: customer.discountPercent || 0,
      createdAt: customer.createdAt || new Date(),
    },
    ordersList: ordersList.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      totalAmount: Number(o.totalAmount),
      status: o.status,
      createdAt: o.createdAt || new Date(),
    })),
    ordersCount: ordersList.length,
    ltv,
    zone,
  };
}

export async function createCustomer(data: {
  name?: string;
  phone?: string;
  fullName?: string;
  primaryPhone?: string;
  passCode?: string;
}) {
  await ensureSeedDatabase();
  const name = (data.name || data.fullName || "عميل بروست").trim();
  const phone = (data.phone || data.primaryPhone || "").trim();
  const passCode = data.passCode || `LION-${Math.floor(100000 + Math.random() * 900000)}`;

  const inserted = await db
    .insert(customers)
    .values({
      name,
      phone,
      passCode,
    })
    .returning();
  return inserted[0];
}

export async function getDeliveryZoneById(id: string): Promise<ZoneDTO | null> {
  await ensureSeedDatabase();
  const res = await db.select().from(deliveryZones).where(eq(deliveryZones.id, id)).limit(1);
  return res[0] ? mapZoneToDTO(res[0]) : null;
}

export async function getAllOrders() {
  await ensureSeedDatabase();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrdersByNumbers(orderNumbers: string[]) {
  await ensureSeedDatabase();
  if (!orderNumbers || orderNumbers.length === 0) return [];
  return db
    .select()
    .from(orders)
    .where(inArray(orders.orderNumber, orderNumbers))
    .orderBy(desc(orders.createdAt));
}

export async function createOrder(payload: {
  orderNumber: string;
  customerId: string;
  deliveryZoneId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  items: { menuItemId: string; quantity: number; price: number; notes?: string }[];
  totalAmount: number;
  deliveryFee: number;
}) {
  await ensureSeedDatabase();
  const [newOrder] = await db
    .insert(orders)
    .values({
      orderNumber: payload.orderNumber,
      customerId: payload.customerId,
      deliveryZoneId: payload.deliveryZoneId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      address: payload.address,
      notes: payload.notes || "",
      totalAmount: payload.totalAmount.toString(),
      deliveryFee: payload.deliveryFee.toString(),
      status: "pending",
    })
    .returning();

  if (payload.items.length > 0) {
    await db.insert(orderLines).values(
      payload.items.map((item) => ({
        orderId: newOrder.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: item.price.toString(),
        notes: item.notes || "",
      }))
    );
  }

  return newOrder;
}
