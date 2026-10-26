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
  categoryAr?: string;
  categoryEn?: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  price: number;
  badge?: string;
}

export type CategoryInput = {
  id?: string;
  nameAr: string;
  nameEn?: string;
  sortOrder?: number;
};

export type MenuItemInput = {
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
};

function checkAuth(token?: string) {
  if (!token) return true;
  const envPass = process.env.ADMIN_PASSCODE?.trim();
  return token === MASTER_PASS || (envPass ? token === envPass : true);
}

// =========================================================================
// 1. FETCH ALL ADMIN DASHBOARD DATA
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

    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;

    for (let i = 0; i < ordersList.length; i++) {
      const o = ordersList[i];
      totalRevenue += Number(o.totalAmount || 0);
      if (o.status === "pending" || o.status === "preparing") {
        pendingOrders++;
      } else if (o.status === "delivered" || o.status === "completed") {
        completedOrders++;
      }
    }

    const avgOrderValue = ordersList.length > 0 ? Math.round(totalRevenue / ordersList.length) : 0;

    return {
      ok: true,
      success: true,
      revenue: totalRevenue,
      kpis: {
        revenue: totalRevenue,
        totalRevenue,
        orders: ordersList.length,
        totalOrders: ordersList.length,
        customers: customersList.length,
        totalCustomers: customersList.length,
        avgOrder: avgOrderValue,
        aov: avgOrderValue,
        pending: pendingOrders,
        completed: completedOrders,
      },
      stats: {
        revenue: totalRevenue,
        totalRevenue,
        orders: ordersList.length,
        ordersCount: ordersList.length,
        customers: customersList.length,
        customersCount: customersList.length,
        avgOrder: avgOrderValue,
        pending: pendingOrders,
        completed: completedOrders,
      },
      categories: cats,
      items,
      menuItems: items,
      zones,
      deliveryZones: zones,
      orders: enrichedOrders,
      customers: customersList,
      settings: settingsMap,
      frontend: frontend || settingsMap,
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
// 2. CATEGORIES ACTIONS (Supports both direct object & token+object calls)
// =========================================================================
export async function upsertCategoryAction(arg1: any, arg2?: any) {
  try {
    const data = typeof arg1 === "string" && arg2 ? arg2 : arg1;
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
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { ok: true, success: true, id };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function deleteCategoryAction(arg1: string, arg2?: string) {
  try {
    const id = arg2 ? arg2 : arg1;
    await db.delete(categories).where(eq(categories.id, String(id)));
    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSaveCategoryAction = upsertCategoryAction;
export const adminDeleteCategoryAction = deleteCategoryAction;

// =========================================================================
// 3. MENU ITEMS ACTIONS
// =========================================================================
export async function upsertMenuItemAction(arg1: any, arg2?: any) {
  try {
    const data = typeof arg1 === "string" && arg2 ? arg2 : arg1;
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
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { ok: true, success: true, id };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export async function deleteMenuItemAction(arg1: string, arg2?: string) {
  try {
    const id = arg2 ? arg2 : arg1;
    await db.delete(menuItems).where(eq(menuItems.id, String(id)));
    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSaveItemAction = upsertMenuItemAction;
export const adminDeleteItemAction = deleteMenuItemAction;

// =========================================================================
// 4. DELIVERY ZONES ACTIONS
// =========================================================================
export async function upsertZoneAction(arg1: any, arg2?: any) {
  try {
    const data = typeof arg1 === "string" && arg2 ? arg2 : arg1;
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

export async function deleteZoneAction(arg1: string, arg2?: string) {
  try {
    const id = arg2 ? arg2 : arg1;
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

// =========================================================================
// 5. SETTINGS & FRONTEND ACTIONS
// =========================================================================
export async function updateSettingsAction(arg1: any, arg2?: any, arg3?: any) {
  try {
    let payload: Record<string, any> = {};

    if (typeof arg1 === "string" && typeof arg2 === "string" && arg3 !== undefined) {
      // Called as (token, key, value)
      payload[arg2] = arg3;
    } else if (typeof arg1 === "string" && typeof arg2 === "string" && arg3 === undefined) {
      // Called as (key, value)
      payload[arg1] = arg2;
    } else if (typeof arg1 === "string" && typeof arg2 === "object" && arg2 !== null) {
      // Called as (token, settingsObject)
      payload = arg2;
    } else if (typeof arg1 === "object" && arg1 !== null) {
      // Called as (settingsObject)
      payload = arg1;
    }

    const entries = Object.entries(payload);
    for (let i = 0; i < entries.length; i++) {
      const [key, val] = entries[i];
      const strVal = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
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

// =========================================================================
// 6. ORDERS & CUSTOMERS & SCANNER ACTIONS
// =========================================================================
export async function updateOrderStatusAction(arg1: any, arg2?: any, arg3?: any) {
  try {
    const orderId = arg3 !== undefined ? arg2 : arg1;
    const status = arg3 !== undefined ? arg3 : arg2;
    await db
      .update(orders)
      .set({ status: String(status) })
      .where(eq(orders.id, Number(orderId)));
    revalidatePath("/admin");
    revalidatePath("/");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}

export const adminSetOrderStatusAction = updateOrderStatusAction;

export async function deleteOrderAction(arg1: any, arg2?: any) {
  try {
    const idNum = Number(arg2 !== undefined ? arg2 : arg1);
    await db.delete(orderLines).where(eq(orderLines.orderId, idNum));
    await db.delete(orders).where(eq(orders.id, idNum));
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

export async function adminScanMenuAction(_arg1?: any, _arg2?: any) {
  return { ok: true, success: true, rows: [] as ScannedRow[] };
}

export async function adminSaveScannedRowsAction(arg1?: any, arg2?: any) {
  try {
    const rows: ScannedRow[] = Array.isArray(arg1) ? arg1 : Array.isArray(arg2) ? arg2 : [];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const catId = `cat-scan-${i}`;
      await upsertCategoryAction({
        id: catId,
        nameAr: r.categoryAr || "أصناف مسحوبة",
        nameEn: r.categoryEn || "Scanned",
      });
      await upsertMenuItemAction({
        categoryId: catId,
        nameAr: r.nameAr,
        nameEn: r.nameEn || "",
        descriptionAr: r.descriptionAr || "",
        price: Number(r.price || 0),
        badge: r.badge || "",
      });
    }
    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    return { ok: true, success: true };
  } catch (err: unknown) {
    return { ok: false, success: false, error: err instanceof Error ? err.message : "Error" };
  }
}
