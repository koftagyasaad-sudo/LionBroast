"use server";

import { z } from "zod";
import { db } from "@/db";
import { customers, deliveryZones, menuItems, orders, type OrderLine } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getOrdersByNumbers, getPassData } from "@/db/queries";
import { eq, inArray } from "drizzle-orm";
import { genCustomerCode, genOrderNumber, mapsLink, normalizeEgyptPhone } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Onboarding — upsert customer, mint Lion Pass code                   */
/* ------------------------------------------------------------------ */

const customerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  primaryPhone: z.string().transform(normalizeEgyptPhone).pipe(z.string().regex(/^01[0125]\d{8}$/)),
  secondaryPhone: z
    .string()
    .optional()
    .transform((v) => (v ? normalizeEgyptPhone(v) : undefined))
    .pipe(z.string().regex(/^01[0125]\d{8}$/).optional()),
  street: z.string().trim().min(3).max(200),
  building: z.string().trim().max(40).optional(),
  flat: z.string().trim().max(40).optional(),
  landmark: z.string().trim().max(120).optional(),
  zoneId: z.string().min(1),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export async function saveCustomerAction(raw: CustomerInput) {
  await ensureSeed();
  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "validation" };
  const data = parsed.data;
  const zoneId = data.zoneId === "__OUT_OF_RANGE__" ? null : data.zoneId;

  const [existing] = await db
    .select()
    .from(customers)
    .where(eq(customers.primaryPhone, data.primaryPhone))
    .limit(1);

  let code: string;
  let id: string;
  if (existing) {
    code = existing.customerCode;
    id = existing.id;
    await db
      .update(customers)
      .set({ ...data, zoneId, updatedAt: new Date() })
      .where(eq(customers.id, existing.id));
  } else {
    for (let attempt = 0; attempt < 6; attempt++) {
      code = genCustomerCode();
      try {
        const [row] = await db
          .insert(customers)
          .values({ ...data, zoneId, customerCode: code })
          .returning({ id: customers.id });
        id = row.id;
        break;
      } catch (e) {
        if (attempt === 5) throw e;
      }
    }
  }
  return { ok: true as const, code: code!, id: id! };
}

/* ------------------------------------------------------------------ */
/* Checkout — server-side price recompute + atomic order logging       */
/* ------------------------------------------------------------------ */

const checkoutSchema = z.object({
  customer: customerSchema,
  outOfRange: z.boolean(),
  notes: z.string().trim().max(300).optional(),
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        qty: z.number().int().min(1).max(30),
        sizeId: z.string().optional().nullable(),
        flavor: z.enum(["original", "spicy"]).optional().nullable(),
      }),
    )
    .min(1)
    .max(60),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createOrderAction(raw: CheckoutInput) {
  await ensureSeed();
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "validation" };
  const { customer, items, outOfRange, notes } = parsed.data;

  // Resolve menu items + recompute prices server-side (never trust client totals).
  const ids = [...new Set(items.map((i) => i.id))];
  const dbItems = await db.select().from(menuItems).where(inArray(menuItems.id, ids));
  const itemMap = new Map(dbItems.map((m) => [m.id, m]));

  const lines: OrderLine[] = [];
  let subtotal = 0;
  for (const line of items) {
    const m = itemMap.get(line.id);
    if (!m || !m.isAvailable) return { ok: false as const, error: "unavailable" };
    let unit = m.price;
    let sizeLabel: string | null = null;
    if (line.sizeId && m.sizes.length) {
      const size = m.sizes.find((s) => s.id === line.sizeId);
      if (!size) return { ok: false as const, error: "bad_size" };
      unit = size.price;
      sizeLabel = `${size.ar} / ${size.en}`;
    }
    const qty = line.qty;
    subtotal += unit * qty;
    lines.push({
      id: m.id,
      nameAr: m.nameAr,
      nameEn: m.nameEn,
      price: m.price,
      unitPrice: unit,
      qty,
      flavor: m.spicyOption ? (line.flavor ?? "original") : null,
      sizeLabel,
    } as OrderLine);
  }
  subtotal = Math.round(subtotal * 100) / 100;

  // Zone fee from DB.
  let zoneName = "منطقة أخرى / خارج النطاق";
  let deliveryFee = 0;
  if (!outOfRange) {
    const [z] = await db.select().from(deliveryZones).where(eq(deliveryZones.id, customer.zoneId)).limit(1);
    if (!z || !z.isActive) return { ok: false as const, error: "bad_zone" };
    zoneName = z.nameAr;
    deliveryFee = z.price;
  }
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  const address = [customer.street, customer.building && `عمارة ${customer.building}`,
    customer.flat && `شقة ${customer.flat}`, customer.landmark && `علامة: ${customer.landmark}`]
    .filter(Boolean)
    .join("، ");
  const url = mapsLink(address, zoneName);

  const saved = await saveCustomerAction(customer);
  const customerId = saved.ok ? saved.id : null;
  const customerCode = saved.ok ? saved.code : null;

  let orderNumber = "";
  await db.transaction(async (tx) => {
    for (let attempt = 0; attempt < 6; attempt++) {
      orderNumber = genOrderNumber();
      try {
        await tx.insert(orders).values({
          orderNumber,
          customerId,
          customerCode,
          customerName: customer.name,
          primaryPhone: customer.primaryPhone,
          secondaryPhone: customer.secondaryPhone || null,
          address,
          mapsLink: url,
          deliveryZone: zoneName,
          items: lines,
          subtotal,
          deliveryFee,
          total,
          notes: notes || null,
          status: "PENDING",
        });
        return;
      } catch (e) {
        if (attempt === 5) throw e;
      }
    }
  });

  return {
    ok: true as const,
    orderNumber,
    zoneName,
    address,
    mapsUrl: url,
    lines,
    subtotal,
    deliveryFee,
    total,
    customerCode,
  };
}

/* ------------------------------------------------------------------ */
/* Tracker + Lion Pass                                                  */
/* ------------------------------------------------------------------ */

export async function trackOrdersAction(numbers: string[]) {
  const list = await getOrdersByNumbers(numbers.slice(0, 10));
  return list.map((o) => ({
    orderNumber: o.orderNumber,
    status: o.status,
    total: o.total,
    createdAt: o.createdAt.toISOString(),
    itemsCount: o.items.reduce((a, i) => a + i.qty, 0),
    deliveryZone: o.deliveryZone,
  }));
}

export async function passStatsAction(code: string) {
  const data = await getPassData(code);
  if (!data) return null;
  return {
    ordersCount: data.ordersCount,
    ltv: data.ltv,
    memberSince: data.customer.createdAt.toISOString(),
    recent: data.ordersList.slice(0, 5).map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}

export async function verifyAdminAction(passcode: string) {
  const expected = process.env.ADMIN_PASSCODE || "asad2024";
  return { ok: passcode === expected };
}
