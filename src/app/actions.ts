"use server";

import {
  createCustomer,
  getCustomerByPhone,
  createOrder,
  getPassData,
  getOrdersByNumbers,
  getDeliveryZoneById,
} from "@/db/queries";

export interface OrderInputItemPayload {
  menuItemId?: string | number;
  id?: string | number;
  nameAr?: string;
  name?: string;
  price?: number;
  quantity?: number;
  size?: string;
  isSpicy?: boolean;
  notes?: string;
}

export interface OrderInputPayload {
  customerName?: string;
  name?: string;
  customerPhone?: string;
  phone?: string;
  address?: string;
  addressDetails?: string;
  deliveryZoneId?: string | number;
  deliveryFee?: number;
  discountAmount?: number;
  totalAmount?: number;
  notes?: string;
  items?: OrderInputItemPayload[];
}

export interface FormattedItem {
  itemId?: string;
  nameAr: string;
  price: number;
  quantity: number;
}

export async function submitOrderAction(payload: OrderInputPayload) {
  try {
    const name = String(payload?.customerName || payload?.name || "").trim();
    const phone = String(payload?.customerPhone || payload?.phone || "").trim();
    const address = String(payload?.address || payload?.addressDetails || "").trim();
    const zoneId = payload?.deliveryZoneId ? String(payload.deliveryZoneId) : null;

    if (!name || !phone || !address) {
      return {
        ok: false,
        success: false,
        error: "يرجى ملء كافة البيانات المطلوبة (الاسم، الهاتف، العنوان).",
      };
    }

    if (!Array.isArray(payload?.items) || payload.items.length === 0) {
      return {
        ok: false,
        success: false,
        error: "السلة فارغة. يرجى إضافة أصناف قبل إرسال الطلب.",
      };
    }

    const formattedItems: FormattedItem[] = [];
    for (let idx = 0; idx < payload.items.length; idx++) {
      const item = payload.items[idx];
      formattedItems.push({
        itemId: item.menuItemId ? String(item.menuItemId) : item.id ? String(item.id) : undefined,
        nameAr: String(item.nameAr || item.name || "صنف"),
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
      });
    }

    let customer = await getCustomerByPhone(phone);
    if (!customer) {
      const code = `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      customer = await createCustomer({ name, phone, code });
    }

    let deliveryFee = Number(payload?.deliveryFee || 0);
    if (zoneId && !deliveryFee) {
      const zone = await getDeliveryZoneById(zoneId);
      if (zone) deliveryFee = zone.fee || zone.price || 0;
    }

    let itemsTotal = 0;
    for (let idx = 0; idx < formattedItems.length; idx++) {
      const item = formattedItems[idx];
      itemsTotal += item.price * item.quantity;
    }

    const discountAmount = Number(payload?.discountAmount || 0);
    const finalTotal = Math.max(0, itemsTotal + deliveryFee - discountAmount);

    const orderNumber = `LION-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await createOrder({
      orderNumber,
      customerPhone: phone,
      customerName: name,
      address,
      zoneId,
      subtotal: itemsTotal,
      deliveryFee,
      totalAmount: finalTotal,
      notes: String(payload?.notes || ""),
      items: formattedItems,
    });

    return {
      ok: true,
      success: true,
      orderId: String(newOrder.id),
      orderNumber: newOrder.orderNumber,
      passCode: customer.code,
      totalAmount: finalTotal,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع عند تسجيل الطلب.";
    console.error("Error in submitOrderAction:", err);
    return { ok: false, success: false, error: errorMsg };
  }
}

export const createOrderAction = submitOrderAction;

export async function saveCustomerAction(data: {
  name?: string;
  phone?: string;
  fullName?: string;
  primaryPhone?: string;
}) {
  try {
    const name = String(data?.name || data?.fullName || "").trim();
    const phone = String(data?.phone || data?.primaryPhone || "").trim();
    if (!name || !phone) {
      return { ok: false, success: false, error: "الاسم ورقم الهاتف مطلوبان" };
    }

    let customer = await getCustomerByPhone(phone);
    if (!customer) {
      const code = `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      customer = await createCustomer({ name, phone, code });
    }

    return {
      ok: true,
      success: true,
      code: customer.code,
      passCode: customer.code,
      customer: {
        id: String(customer.id),
        name: customer.name || customer.fullName || "",
        phone: customer.phone || customer.primaryPhone || "",
        passCode: customer.code,
        code: customer.code,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return { ok: false, success: false, error: errorMsg };
  }
}

export async function fetchCustomerPassAction(passCode: string) {
  try {
    const code = String(passCode || "").trim();
    if (!code) return { ok: false, success: false, error: "كود البطاقة مطلوب" };

    const passData = await getPassData(code);
    if (!passData) {
      return { ok: false, success: false, error: "لم نتمكن من العثور على بطاقة الولاء بهذا الكود" };
    }
    return { ok: true, success: true, data: passData, ...passData };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return { ok: false, success: false, error: errorMsg };
  }
}

export const passStatsAction = fetchCustomerPassAction;

export async function fetchOrdersByNumbersAction(orderNumbers: string[]) {
  try {
    if (!orderNumbers || orderNumbers.length === 0) {
      return { ok: true, success: true, orders: [] };
    }
    const ordersList = await getOrdersByNumbers(orderNumbers);
    return { ok: true, success: true, orders: ordersList };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
    return { ok: false, success: false, error: errorMsg, orders: [] };
  }
}

export const trackOrdersAction = fetchOrdersByNumbersAction;

export async function verifyAdminAction(passcode: string) {
  const trimmed = String(passcode || "").trim();
  const envPass = process.env.ADMIN_PASSCODE?.trim();

  if (trimmed === "Asaad123456@@" || (envPass && trimmed === envPass)) {
    return { ok: true, success: true };
  }
  return { ok: false, success: false, error: "رمز الدخول لصفحة الأدمن غير صحيح" };
}
