import { db } from "./index";
import {
  categories,
  menuItems,
  deliveryZones,
  settings,
  customers,
  orders,
  orderLines,
} from "./schema";
import { eq, desc, inArray } from "drizzle-orm";
import type {
  CategoryDTO,
  MenuItemDTO,
  ZoneDTO,
  Promo,
  FrontendSettings,
  CustomerPassData,
} from "@/lib/types";
import { ensureSeedDatabase } from "./seed";

// ---------- Row types inferred directly from the schema ----------
export type CustomerRow = typeof customers.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
export type MenuItemRow = typeof menuItems.$inferSelect;
export type DeliveryZoneRow = typeof deliveryZones.$inferSelect;

// ---------- Helpers ----------
export function generatePassCode(): string {
  return `LION-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function toNumericId(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const DEFAULT_SETTINGS: FrontendSettings = {
  brandNameAr: "بروست الأسد",
  brandNameEn: "Lion Broast",
  logoUrl: "",
  heroTitleAr: "أقوى بروست مقرمش وطازج في دسوق",
  heroSubtitleAr: "طعم لا يُقاوم وخبرة سنوات من التتبيل السرّي الخاص!",
  marqueeTextAr:
    "🔥 توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥",
  footerTextAr:
    "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر.",
  addressAr: "دسوق - شارع الجلاء - بجوار مسجد الإبراهيمي",
  workingHoursAr: "يومياً من 12 ظهراً حتى 2 صباحاً",
  hotline: "01000000000",
  whatsapp: "201000000000",
  deliveryFee: 15,
  taxPercent: 0,
};

const DEFAULT_PROMO: Promo = {
  enabled: true,
  title: "خصم 15% على أول طلب بـ كود: LION15",
  code: "LION15",
  textAr: "خصم 15% على أول طلب بـ كود: LION15",
  textEn: "15% OFF on first order code: LION15",
};

// ---------- DTO Mappers ----------
export function mapCategoryToDTO(cat: CategoryRow): CategoryDTO {
  return {
    id: String(cat.id),
    nameAr: cat.nameAr,
    nameEn: cat.nameEn || undefined,
    sortOrder: cat.sortOrder || 0,
    image: "",
    isActive: true,
  };
}

export function mapMenuItemToDTO(item: MenuItemRow): MenuItemDTO {
  return {
    id: String(item.id),
    categoryId: String(item.categoryId),
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

export function mapZoneToDTO(zone: DeliveryZoneRow): ZoneDTO {
  return {
    id: String(zone.id),
    nameAr: zone.nameAr,
    nameEn: zone.nameEn || undefined,
    price: Number(zone.fee || 0),
    fee: Number(zone.fee || 0),
    estimatedMinutes: zone.estimatedMinutes || 30,
    isActive: true,
  };
}

// ---------- Settings & Promo ----------
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

    const pick = (key: string, fallback: string) => map.get(key) || fallback;

    return {
      brandNameAr: pick("brand_name_ar", DEFAULT_SETTINGS.brandNameAr),
      brandNameEn: pick("brand_name_en", DEFAULT_SETTINGS.brandNameEn),
      logoUrl: pick("logo_url", DEFAULT_SETTINGS.logoUrl),
      heroTitleAr: pick("hero_title_ar", DEFAULT_SETTINGS.heroTitleAr),
      heroSubtitleAr: pick("hero_subtitle_ar", DEFAULT_SETTINGS.heroSubtitleAr),
      marqueeTextAr: pick("marquee_text_ar", DEFAULT_SETTINGS.marqueeTextAr),
      footerTextAr: pick("footer_text_ar", DEFAULT_SETTINGS.footerTextAr),
      addressAr: pick("address_ar", DEFAULT_SETTINGS.addressAr),
      workingHoursAr: pick("working_hours_ar", DEFAULT_SETTINGS.workingHoursAr),
      hotline: pick("hotline", DEFAULT_SETTINGS.hotline),
      whatsapp: pick("whatsapp", DEFAULT_SETTINGS.whatsapp),
      deliveryFee: Number(map.get("delivery_fee") ?? DEFAULT_SETTINGS.deliveryFee),
      taxPercent: Number(map.get("tax_percent") ?? DEFAULT_SETTINGS.taxPercent),
    };
  } catch (err) {
    console.error("Error in getFrontendSettings:", err);
    return DEFAULT_SETTINGS;
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
        title: String(parsed.title || DEFAULT_PROMO.title),
        code: String(parsed.code || DEFAULT_PROMO.code),
        textAr: String(parsed.textAr || parsed.title || DEFAULT_PROMO.textAr),
        textEn: String(parsed.textEn || parsed.title || DEFAULT_PROMO.textEn),
      };
    }
  } catch (err) {
    console.error("Error reading promo setting:", err);
  }
  return DEFAULT_PROMO;
}

// ---------- Menu ----------
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

export async function getMenuData(): Promise<{
  categories: CategoryDTO[];
  items: MenuItemDTO[];
  zones: ZoneDTO[];
}> {
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

// ---------- Customers ----------
export async function getCustomerByPhone(phone: string): Promise<CustomerRow | null> {
  await ensureSeedDatabase();
  const res = await db.select().from(customers).where(eq(customers.phone, phone)).limit(1);
  return res[0] ?? null;
}

export async function getCustomerByCode(code: string): Promise<CustomerRow | null> {
  await ensureSeedDatabase();
  const res = await db.select().from(customers).where(eq(customers.code, code)).limit(1);
  return res[0] ?? null;
}

export async function createCustomer(data: {
  name: string;
  phone: string;
  code?: string;
}): Promise<CustomerRow> {
  await ensureSeedDatabase();
  const inserted = await db
    .insert(customers)
    .values({
      name: data.name.trim(),
      phone: data.phone.trim(),
      code: data.code || generatePassCode(),
    })
    .returning();
  return inserted[0];
}

export async function getPassData(code: string): Promise<CustomerPassData | null> {
  await ensureSeedDatabase();
  const customer = await getCustomerByCode(code);
  if (!customer) return null;

  const ordersList = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customer.id))
    .orderBy(desc(orders.createdAt));

  const ltv = ordersList.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const ordersCount = ordersList.length;

  let zone: ZoneDTO | null = null;
  const latestZoneId = ordersList[0]?.deliveryZoneId;
  if (latestZoneId) {
    const z = await db
      .select()
      .from(deliveryZones)
      .where(eq(deliveryZones.id, latestZoneId))
      .limit(1);
    if (z[0]) zone = mapZoneToDTO(z[0]);
  }

  const memberSince = ordersList[ordersList.length - 1]?.createdAt ?? new Date();

  return {
    customer: {
      id: String(customer.id),
      name: customer.name ?? "",
      phone: customer.phone ?? "",
      passCode: customer.code,
      totalOrders: ordersCount,
      totalSpent: ltv,
      loyaltyPoints: Math.floor(ltv / 10),
      discountPercent: ordersCount >= 5 ? 5 : 0,
      createdAt: memberSince,
    },
    ordersList: ordersList.map((o) => ({
      id: String(o.id),
      orderNumber: o.orderNumber,
      totalAmount: Number(o.totalAmount || 0),
      status: o.status,
      createdAt: o.createdAt ?? new Date(),
    })),
    ordersCount,
    ltv,
    zone,
  };
}

// ---------- Delivery zones ----------
export async function getDeliveryZoneById(id: number | string): Promise<ZoneDTO | null> {
  await ensureSeedDatabase();
  const numericId = toNumericId(id);
  if (numericId === null) return null;
  const res = await db
    .select()
    .from(deliveryZones)
    .where(eq(deliveryZones.id, numericId))
    .limit(1);
  return res[0] ? mapZoneToDTO(res[0]) : null;
}

// ---------- Orders ----------
export async function getAllOrders(): Promise<OrderRow[]> {
  await ensureSeedDatabase();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrdersByNumbers(orderNumbers: string[]): Promise<OrderRow[]> {
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
  customerId: number;
  deliveryZoneId: number | null;
  customerName: string;
  customerPhone: string;
  address: string;
  notes?: string;
  items: { menuItemId: number; quantity: number; price: number; notes?: string }[];
  totalAmount: number;
  deliveryFee: number;
}): Promise<OrderRow> {
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
