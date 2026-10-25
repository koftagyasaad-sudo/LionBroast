import { db } from "@/db";
import { categories, customers, deliveryZones, menuItems, orders, settings } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { asc, desc, eq, inArray, ne, sql } from "drizzle-orm";

export async function getMenuData() {
  await ensureSeed();
  const [cats, items, zones] = await Promise.all([
    db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder)),
    db.select().from(menuItems).orderBy(asc(menuItems.sortOrder)),
    db.select().from(deliveryZones).where(eq(deliveryZones.isActive, true)).orderBy(asc(deliveryZones.sortOrder)),
  ]);
  return { categories: cats, items, zones };
}

export async function getPromo() {
  await ensureSeed();
  const rows = await db.select().from(settings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    enabled: map.promo_enabled === "true",
    textAr: map.promo_text_ar || "",
    textEn: map.promo_text_en || "",
  };
}

export async function getFrontendSettings() {
  await ensureSeed();
  const rows = await db.select().from(settings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    heroTitleAr: map.hero_title_ar,
    heroTitleEn: map.hero_title_en,
    heroSubAr: map.hero_sub_ar,
    heroSubEn: map.hero_sub_en,
    marqueeAr: map.marquee_ar,
    marqueeEn: map.marquee_en,
    aboutAr: map.about_ar,
    aboutEn: map.about_en,
    hotline: map.hotline,
    whatsapp: map.whatsapp,
    // 👇 الحقول الجديدة
    brandAr: map.brand_ar,
    brandEn: map.brand_en,
    addressAr: map.address_ar,
    addressEn: map.address_en,
    hours: map.hours,
  };
}

export async function getPassData(code: string) {
  await ensureSeed();
  const [cust] = await db.select().from(customers).where(eq(customers.customerCode, code)).limit(1);
  if (!cust) return null;
  const ords = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, cust.id))
    .orderBy(desc(orders.createdAt))
    .limit(20);
  const delivered = ords.filter((o) => o.status !== "CANCELLED");
  const ltv = Math.round(delivered.reduce((a, o) => a + o.total, 0) * 100) / 100;
  const [zone] = cust.zoneId
    ? await db.select().from(deliveryZones).where(eq(deliveryZones.id, cust.zoneId)).limit(1)
    : [null];
  return { customer: cust, ordersList: ords, ordersCount: delivered.length, ltv, zone };
}

export async function getOrdersByNumbers(numbers: string[]) {
  if (!numbers.length) return [];
  await ensureSeed();
  return db.select().from(orders).where(inArray(orders.orderNumber, numbers)).orderBy(desc(orders.createdAt));
}

/* ------------------------------ Admin ----------------------------------- */

export async function getAdminStats() {
  await ensureSeed();
  const ords = await db.select().from(orders).where(ne(orders.status, "CANCELLED"));
  const custRows = await db.execute(sql`SELECT count(*)::int AS n FROM customers`);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const revenue = Math.round(ords.reduce((a, o) => a + o.total, 0) * 100) / 100;
  const todayOrders = ords.filter((o) => new Date(o.createdAt) >= todayStart);
  const todayRevenue = Math.round(todayOrders.reduce((a, o) => a + o.total, 0) * 100) / 100;

  const tally = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of ords) {
    for (const it of o.items) {
      const cur = tally.get(it.id) ?? { name: `${it.nameEn}`, qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.qty * it.unitPrice;
      tally.set(it.id, cur);
    }
  }
  const topItems = [...tally.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  return {
    revenue,
    ordersCount: ords.length,
    customersCount: (custRows.rows?.[0] as { n?: number } | undefined)?.n ?? 0,
    todayRevenue,
    todayOrders: todayOrders.length,
    pendingCount: ords.filter((o) => o.status === "PENDING").length,
    topItems,
  };
}

export async function listOrdersAdmin() {
  await ensureSeed();
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500);
}

export async function listCustomersAdmin() {
  await ensureSeed();
  const custs = await db.select().from(customers).orderBy(desc(customers.createdAt));
  const ords = await db.select().from(orders).where(ne(orders.status, "CANCELLED"));
  const zones = await db.select().from(deliveryZones);
  const zoneMap = new Map(zones.map((z) => [z.id, z]));
  const agg = new Map<string, { count: number; ltv: number }>();
  for (const o of ords) {
    if (!o.customerId) continue;
    const cur = agg.get(o.customerId) ?? { count: 0, ltv: 0 };
    cur.count += 1;
    cur.ltv += o.total;
    agg.set(o.customerId, cur);
  }
  return custs.map((c) => ({
    ...c,
    zone: c.zoneId ? (zoneMap.get(c.zoneId) ?? null) : null,
    ordersCount: agg.get(c.id)?.count ?? 0,
    ltv: Math.round((agg.get(c.id)?.ltv ?? 0) * 100) / 100,
  }));
}

export async function getAllSettings() {
  await ensureSeed();
  return db.select().from(settings);
}
