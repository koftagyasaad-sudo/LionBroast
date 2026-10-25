"use server";

import { db } from "@/db";
import { customers, deliveryZones, menuItems, orders, orderLines } from "@/db/schema";
import { ensureSeedDatabase } from "@/db/seed";
import { getOrdersByNumbers, getPassData } from "@/db/queries";
import { eq, inArray } from "drizzle-orm";

export interface CartItemInput {
  id: number;
  quantity: number;
  notes?: string;
}

export interface CheckoutInput {
  customerName: string;
  phone: string;
  address: string;
  zoneId?: number;
  notes?: string;
  items: CartItemInput[];
}

// Helper: Normalize Egypt Phone
function normalizeEgyptPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith("20")) cleaned = "20" + cleaned;
  return cleaned;
}

// Helper: Generate Random Unique Codes
function genOrderNumber(): string {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randPart = Math.floor(1000 + Math.random() * 9000);
  return `LION-${datePart}-${randPart}`;
}

function genCustomerCode(): string {
  return "CUST-" + Math.floor(100000 + Math.random() * 900000);
}

// 1. Submit New Customer Order
export async function submitOrderAction(input: CheckoutInput) {
  try {
    // Ensure Neon DB is populated on first order
    await ensureSeedDatabase();

    if (!input.items || input.items.length === 0) {
      return { success: false, error: "السلة فارغة. يرجى إضافة أصناف للمتابعة." };
    }

    if (!input.customerName || !input.phone || !input.address) {
      return { success: false, error: "جميع البيانات (الاسم، الهاتف، العنوان) مطلوبة لتنفيذ الطلب." };
    }

    const cleanPhone = normalizeEgyptPhone(input.phone);

    // 2. Find or Register Customer
    const existingCustomers = await db
      .select()
      .from(customers)
      .where(eq(customers.primaryPhone, cleanPhone))
      .limit(1);

    let customerCodeStr: string;

    if (existingCustomers.length > 0) {
      const existing = existingCustomers[0];
      customerCodeStr = existing.code || `CUST-${existing.id}`;

      await db
        .update(customers)
        .set({
          fullName: input.customerName,
          name: input.customerName,
          phone: cleanPhone,
          primaryPhone: cleanPhone,
          primaryAddress: input.address,
          address: input.address,
        })
        .where(eq(customers.id, existing.id));
    } else {
      customerCodeStr = genCustomerCode();
      await db.insert(customers).values({
        code: customerCodeStr,
        fullName: input.customerName,
        name: input.customerName,
        primaryPhone: cleanPhone,
        phone: cleanPhone,
        primaryAddress: input.address,
        address: input.address,
      });
    }

    // 3. Resolve Items & Subtotal
    const itemIds = input.items.map((i) => i.id);
    const dbItems = await db
      .select()
      .from(menuItems)
      .where(inArray(menuItems.id, itemIds));

    const itemMap = new Map(dbItems.map((i) => [i.id, i]));

    let subtotalPiasters = 0;
    const resolvedLines = [];

    for (const cartItem of input.items) {
      const dbItem = itemMap.get(cartItem.id);
      if (!dbItem) continue;

      const linePrice = dbItem.price * cartItem.quantity;
      subtotalPiasters += linePrice;

      resolvedLines.push({
        itemId: dbItem.id,
        itemNameAr: dbItem.nameAr,
        itemNameEn: dbItem.nameEn,
        itemName: dbItem.nameAr,
        quantity: cartItem.quantity,
        price: dbItem.price,
        notes: cartItem.notes || "",
      });
    }

    if (resolvedLines.length === 0) {
      return { success: false, error: "عفواً، الأصناف المحددة غير متوفرة حالياً." };
    }

    // 4. Delivery Zone Fee
    let deliveryFeePiasters = 1500; // default 15 EGP
    if (input.zoneId) {
      const zones = await db
        .select()
        .from(deliveryZones)
        .where(eq(deliveryZones.id, input.zoneId))
        .limit(1);

      if (zones.length > 0) {
        deliveryFeePiasters = zones[0].fee;
      }
    }

    const totalPiasters = subtotalPiasters + deliveryFeePiasters;
    const orderNum = genOrderNumber();

    // 5. Insert Order
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber: orderNum,
        customerCode: customerCodeStr,
        customerName: input.customerName,
        customerPhone: cleanPhone,
        customerAddress: input.address,
        phone: cleanPhone,
        address: input.address,
        subtotal: subtotalPiasters,
        deliveryFee: deliveryFeePiasters,
        total: totalPiasters,
        status: "pending",
        notes: input.notes || "",
        zoneId: input.zoneId || null,
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    // 6. Insert Order Lines
    for (const line of resolvedLines) {
      await db.insert(orderLines).values({
        orderId: newOrder.id,
        itemId: line.itemId,
        itemNameAr: line.itemNameAr,
        itemNameEn: line.itemNameEn,
        itemName: line.itemName,
        quantity: line.quantity,
        price: line.price,
        notes: line.notes,
      });
    }

    return {
      success: true,
      orderNumber: newOrder.orderNumber,
      customerCode: customerCodeStr,
    };
  } catch (err: any) {
    console.error("خطأ في تسجيل الطلب:", err);
    return {
      success: false,
      error: err?.message || "حدث خطأ غير متوقع أثناء تسجيل الطلب.",
    };
  }
}

// Fetch Customer Pass Information
export async function fetchCustomerPassAction(customerCode: string) {
  try {
    return await getPassData(customerCode);
  } catch (err) {
    return null;
  }
}

// Fetch Orders by Number List
export async function fetchOrdersByNumbersAction(orderNumbers: string[]) {
  try {
    return await getOrdersByNumbers(orderNumbers);
  } catch (err) {
    return [];
  }
}
