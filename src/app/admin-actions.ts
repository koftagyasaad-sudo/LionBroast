"use server";

import { db } from "@/db";
import { categories, deliveryZones, menuItems, orders, settings } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getAdminStats, getAllSettings, getMenuData, listCustomersAdmin, listOrdersAdmin } from "@/db/queries";
import { asc, eq } from "drizzle-orm";
import type { ItemSize } from "@/db/schema";

function assertAdmin(token: string) {
  const expected = process.env.ADMIN_PASSCODE || "asad2024";
  if (token !== expected) throw new Error("UNAUTHORIZED");
}

/** One-shot bundle for the dashboard boot. */
export async function adminGetAllAction(token: string) {
  assertAdmin(token);
  const [stats, ordersList, customersList, menu, settingsList, zones] = await Promise.all([
    getAdminStats(),
    listOrdersAdmin(),
    listCustomersAdmin(),
    getMenuData(),
    getAllSettings(),
    db.select().from(deliveryZones).orderBy(asc(deliveryZones.sortOrder)),
  ]);
  return {
    stats,
    orders: ordersList.map((o) => ({ ...o, createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString() })),
    customers: customersList.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    categories: menu.categories,
    items: menu.items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString() })),
    zones,
    settings: settingsList,
  };
}

/* ---- order status ---- */
const ALLOWED_STATUSES = new Set(["PENDING", "CONFIRMED", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"]);

export async function adminSetOrderStatusAction(token: string, id: string, status: string) {
  assertAdmin(token);
  if (!ALLOWED_STATUSES.has(status)) throw new Error("BAD_STATUS");
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  return { ok: true };
}

/* ---- zones ---- */
export async function adminSaveZoneAction(
  token: string,
  zone: { id?: string; nameAr: string; nameEn: string; price: number; isActive: boolean; sortOrder?: number },
) {
  assertAdmin(token);
  await ensureSeed();
  if (zone.id) {
    await db.update(deliveryZones).set(zone).where(eq(deliveryZones.id, zone.id));
  } else {
    await db.insert(deliveryZones).values(zone);
  }
  return { ok: true };
}

export async function adminDeleteZoneAction(token: string, id: string) {
  assertAdmin(token);
  await db.update(deliveryZones).set({ isActive: false }).where(eq(deliveryZones.id, id));
  return { ok: true };
}

/* ---- categories ---- */
export async function adminSaveCategoryAction(
  token: string,
  cat: { id?: string; nameAr: string; nameEn: string; sortOrder?: number; isActive?: boolean; image?: string | null },
) {
  assertAdmin(token);
  await ensureSeed();
  if (cat.id) {
    await db.update(categories).set(cat).where(eq(categories.id, cat.id));
  } else {
    await db.insert(categories).values({ sortOrder: 99, isActive: true, ...cat });
  }
  return { ok: true };
}

export async function adminDeleteCategoryAction(token: string, id: string) {
  assertAdmin(token);
  await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
  return { ok: true };
}

/* ---- menu items ---- */
export type AdminItemInput = {
  id?: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: number;
  sizes?: ItemSize[];
  spicyOption?: boolean;
  isBestSeller?: boolean;
  isAvailable?: boolean;
  image?: string | null;
};

export async function adminSaveItemAction(token: string, item: AdminItemInput) {
  assertAdmin(token);
  await ensureSeed();
  const payload = { ...item, sizes: item.sizes ?? [], updatedAt: new Date() };
  if (item.id) {
    await db.update(menuItems).set(payload).where(eq(menuItems.id, item.id));
  } else {
    await db.insert(menuItems).values(payload);
  }
  return { ok: true };
}

export async function adminDeleteItemAction(token: string, id: string) {
  assertAdmin(token);
  await db.delete(menuItems).where(eq(menuItems.id, id));
  return { ok: true };
}

/* ---- settings / promo ---- */
export async function adminSetSettingAction(token: string, key: string, value: string) {
  assertAdmin(token);
  await ensureSeed();
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* AI OCR Menu Scanner — simulated Vision-LLM parse pipeline           */
/* ------------------------------------------------------------------ */

export interface ScannedRow {
  categoryEn: string;
  categoryAr: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  sizes: ItemSize[];
  spicyOption: boolean;
  confidence: number;
}

const SCAN_POOL: ScannedRow[] = [
  {
    categoryEn: "Legendary Broast", categoryAr: "البروست الأسطوري",
    nameEn: "Mega Broast Box", nameAr: "ميجا بروست بوكس",
    descriptionEn: "6 crunchy pieces, fries, coleslaw & fire sauce.",
    descriptionAr: "٦ قطع كرسبي، بطاطس، كول سلو وصوص نار.",
    price: 235, sizes: [
      { id: "box", ar: "بوكس", en: "Box", price: 235 },
      { id: "mega", ar: "ميجا", en: "Mega", price: 295 },
    ], spicyOption: true, confidence: 0.98,
  },
  {
    categoryEn: "Crunchy Sandwiches", categoryAr: "ساندوتشات كرانشي",
    nameEn: "Buffalo Blaze", nameAr: "بافلو بليز",
    descriptionEn: "Crispy fillet tossed in buffalo sauce with blue cheese.",
    descriptionAr: "فيليه كرسبي بصوص البافلو مع جبنة زرقا.",
    price: 118, sizes: [], spicyOption: true, confidence: 0.96,
  },
  {
    categoryEn: "Legendary Broast", categoryAr: "البروست الأسطوري",
    nameEn: "Chicken Tenders Classic", nameAr: "تندرز كلاسيك",
    descriptionEn: "Buttermilk tenders with honey-mustard dip.",
    descriptionAr: "تندرز بتر ميلك مع ديب هني ماسترد.",
    price: 105, sizes: [
      { id: "4pc", ar: "٤ قطع", en: "4 pcs", price: 105 },
      { id: "6pc", ar: "٦ قطع", en: "6 pcs", price: 148 },
    ], spicyOption: false, confidence: 0.94,
  },
  {
    categoryEn: "Sides & Sauces", categoryAr: "المقبلات والصوصات",
    nameEn: "Cheese Molten Fries", nameAr: "بطاطس بالجبنة السايحة",
    descriptionEn: "Lion fries buried under molten cheddar waterfall.",
    descriptionAr: "بطاطس الأسد مغطاة بشلال شيدر سايح.",
    price: 68, sizes: [], spicyOption: false, confidence: 0.97,
  },
  {
    categoryEn: "Beverages", categoryAr: "المشروبات",
    nameEn: "Iced Spanish Latte", nameAr: "سبانيش لاتيه ساقع",
    descriptionEn: "Double espresso over condensed milk & ice.",
    descriptionAr: "إسبريسو دبل على لبن مكثف وتلج.",
    price: 55, sizes: [], spicyOption: false, confidence: 0.93,
  },
  {
    categoryEn: "Meals & Combos", categoryAr: "الوجبات والكومبو",
    nameEn: "Solo Hero Meal", nameAr: "وجبة البطل",
    descriptionEn: "Zinger + fries + fire sauce + drink. One-person feast.",
    descriptionAr: "زنجر + بطاطس + صوص نار + مشروب. وليمة فرد واحد.",
    price: 152, sizes: [], spicyOption: true, confidence: 0.95,
  },
];

/** Simulates Vision OCR latency + slight extraction variance. */
export async function adminScanMenuAction(token: string, fileName: string) {
  assertAdmin(token);
  await new Promise((r) => setTimeout(r, 1400));
  const seed = [...(fileName || "menu")].reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 3 + (seed % 3); // 3..5 rows
  const rows: ScannedRow[] = [];
  for (let i = 0; i < count; i++) {
    const src = SCAN_POOL[(seed + i) % SCAN_POOL.length];
    const jitter = ((seed + i * 7) % 3) * 5; // 0 | 5 | 10 EGP
    rows.push({
      ...src,
      price: src.price + jitter,
      sizes: src.sizes.map((s) => ({ ...s, price: s.price + jitter })),
      confidence: Math.round((src.confidence - jitter / 1000) * 100) / 100,
    });
  }
  return { rows, engine: "LionVision-OCR v2.3", fileName };
}

/** Batch-publish approved scan rows to the live menu. */
export async function adminPublishScanAction(token: string, rows: ScannedRow[]) {
  assertAdmin(token);
  await ensureSeed();
  const cats = await db.select().from(categories);
  const byEn = new Map(cats.map((c) => [c.nameEn, c.id]));
  let inserted = 0;
  for (const r of rows) {
    const categoryId = byEn.get(r.categoryEn);
    if (!categoryId) continue;
    await db.insert(menuItems).values({
      categoryId,
      nameAr: r.nameAr,
      nameEn: r.nameEn,
      descriptionAr: r.descriptionAr,
      descriptionEn: r.descriptionEn,
      price: r.price,
      sizes: r.sizes,
      spicyOption: r.spicyOption,
      isBestSeller: false,
      isAvailable: true,
      sortOrder: 50,
    });
    inserted++;
  }
  return { ok: true, inserted };
}
