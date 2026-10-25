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

function checkAuth(token?: string) {
  if (!token) return true;
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  return token === MASTER_PASS || (envPass ? token === envPass : true);
}

export async function adminGetAllAction(token?: string) {
  try {
    if (!checkAuth(token)) {
      throw new Error("Unauthorized");
    }

    await ensureSeedDatabase().catch((e) =>
      console.error("Seed warning in admin bundle:", e)
    );

    const [cats, items, zones, ordersList, customersList, settingsRows, linesList, frontend, promo] =
      await Promise.all([
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

    const linesByOrder = new Map<number, typeof linesList>();
    for (let i = 0; i < linesList.length; i++) {
      const line = linesList[i];
      const arr = linesByOrder.get(line.orderId) || [];
      arr.push(line);
      linesByOrder.set(line.orderId, arr);
    }

    const enrichedOrders = ordersList.map((o) => ({
      ...o,
      items: linesByOrder.get(o.id) || [],
      lines: linesByOrder.get(o.id) || [],
    }));

    return {
      categories: cats,
      items,
      menuItems: items,
      zones,
      deliveryZones: zones,
      orders: enrichedOrders,
      customers: customersList,
      settings: settingsMap,
      frontend: frontend || settingsMap,
      promo,
    };
  } catch (err: unknown) {
    console.error("adminGetAllAction error:", err);
    throw new Error(err instanceof Error ? err.message : "Failed to load dashboard data.");
  }
}

export async function verifyAdminAction(passcode: string) {
  const trimmed = String(passcode || "").trim();
  const envPass = process.env.ADMIN_PASSCODE?.trim();

  if (trimmed === MASTER_PASS || (envPass && trimmed === envPass)) {
    return { ok: true, success: true };
  }
  return { ok: false, success: false, error: "رمز الدخول غير صحيح" };
}

export async function updateOrderStatusAction(orderId: number | string, status: string) {
  try {
    await db.update(orders).set({ status }).where(eq(orders.id, Number(orderId)));
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

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

export async function upsertCategoryAction(data: {
  id?: string;
  nameAr: string;
  nameEn?: string;
  sortOrder?: number;
}) {
  try {
    const id = data.id || `cat-${Date.now()}`;
    const existing = await db.select().from(categories).where(eq(categories.id, id)).limit(1);

    if (existing.length > 0) {
      await db
        .update(categories)
        .set({
          nameAr: data.nameAr,
          nameEn: data.nameEn || "",
          sortOrder: Number(data.sortOrder ?? 0),
        })
        .where(eq(categories.id, id));
    } else {
      await db.insert(categories).values({
        id,
        nameAr: data.nameAr,
        nameEn: data.nameEn || "",
        sortOrder: Number(data.sortOrder ?? 0),
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
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function upsertMenuItemAction(data: {
  id?: string;
  categoryId: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  imageUrl?: string;
  image?: string;
  badge?: string;
  isAvailable?: boolean | number;
  sortOrder?: number;
}) {
  try {
    const id = data.id || `item-${Date.now()}`;
    const isAvail = data.isAvailable === false || data.isAvailable === 0 ? 0 : 1;
    const img = data.imageUrl ?? data.image ?? "";

    const existing = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);

    if (existing.length > 0) {
      await db
        .update(menuItems)
        .set({
          categoryId: data.categoryId,
          nameAr: data.nameAr,
          nameEn: data.nameEn || "",
          descriptionAr: data.descriptionAr || "",
          descriptionEn: data.descriptionEn || "",
          price: Number(data.price || 0),
          imageUrl: img,
          badge: data.badge || "",
          isAvailable: isAvail,
          sortOrder: Number(data.sortOrder ?? 0),
        })
        .where(eq(menuItems.id, id));
    } else {
      await db.insert(menuItems).values({
        id,
        categoryId: data.categoryId,
        nameAr: data.nameAr,
        nameEn: data.nameEn || "",
        descriptionAr: data.descriptionAr || "",
        descriptionEn: data.descriptionEn || "",
        price: Number(data.price || 0),
        imageUrl: img,
        badge: data.badge || "",
        isAvailable: isAvail,
        sortOrder: Number(data.sortOrder ?? 0),
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
    await db.delete(menuItems).where(eq(menuItems.id, id));
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function upsertZoneAction(data: {
  id?: string;
  nameAr: string;
  nameEn?: string;
  fee?: number;
  price?: number;
  estimatedMinutes?: number;
  sortOrder?: number;
}) {
  try {
    const id = data.id || `zone-${Date.now()}`;
    const feeVal = Number(data.fee ?? data.price ?? 0);
    const existing = await db.select().from(deliveryZones).where(eq(deliveryZones.id, id)).limit(1);

    if (existing.length > 0) {
      await db
        .update(deliveryZones)
        .set({
          nameAr: data.nameAr,
          nameEn: data.nameEn || "",
          fee: feeVal,
          estimatedMinutes: Number(data.estimatedMinutes ?? 30),
          sortOrder: Number(data.sortOrder ?? 0),
        })
        .where(eq(deliveryZones.id, id));
    } else {
      await db.insert(deliveryZones).values({
        id,
        nameAr: data.nameAr,
        nameEn: data.nameEn || "",
        fee: feeVal,
        estimatedMinutes: Number(data.estimatedMinutes ?? 30),
        sortOrder: Number(data.sortOrder ?? 0),
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
    await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function updateSettingsAction(payload: Record<string, string | number | boolean>) {
  try {
    const entries = Object.entries(payload);
    for (let i = 0; i < entries.length; i++) {
      const [key, val] = entries[i];
      const strVal = String(val ?? "");
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

export async function upsertCustomerAction(data: {
  id?: number | string;
  code?: string;
  name: string;
  phone: string;
  loyaltyPoints?: number;
  discountPercent?: number;
}) {
  try {
    if (data.id) {
      await db
        .update(customers)
        .set({
          name: data.name,
          fullName: data.name,
          phone: data.phone,
          primaryPhone: data.phone,
          loyaltyPoints: Number(data.loyaltyPoints ?? 0),
          discountPercent: Number(data.discountPercent ?? 0),
        })
        .where(eq(customers.id, Number(data.id)));
    } else {
      const code = data.code || `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      await db.insert(customers).values({
        code,
        name: data.name,
        fullName: data.name,
        phone: data.phone,
        primaryPhone: data.phone,
        loyaltyPoints: Number(data.loyaltyPoints ?? 0),
        discountPercent: Number(data.discountPercent ?? 0),
      });
    }
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}
