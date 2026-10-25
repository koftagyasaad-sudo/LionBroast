"use server";

import {
  createCustomer,
  getCustomerByPhone,
  createOrder,
  getPassData,
  getOrdersByNumbers,
  getDeliveryZoneById,
} from "@/db/queries";

export async function submitOrderAction(payload: any) {
  try {
    const name = String(payload?.customerName || payload?.name || "").trim();
    const phone = String(payload?.customerPhone || payload?.phone || "").trim();
    const address = String(payload?.address || payload?.addressDetails || "").trim();
    const zoneId = payload?.deliveryZoneId ? String(payload.deliveryZoneId) : null;

    if (!name || !phone || !address) {
      return { success: false, error: "يرجى ملء كافة البيانات المطلوبة (الاسم، الهاتف، العنوان)." };
    }

    if (!Array.isArray(payload?.items) || payload.items.length === 0) {
      return { success: false, error: "السلة فارغة. يرجى إضافة أصناف قبل إرسال الطلب." };
    }

    const formattedItems = payload.items.map((item: any) => ({
      itemId: item.menuItemId ? String(item.menuItemId) : item.id ? String(item.id) : undefined,
      nameAr: String(item.nameAr || item.name || "صنف"),
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
    }));

    // البحث عن العميل أو إنشائه
    let customer = await getCustomerByPhone(phone);
    if (!customer) {
      const code = `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      customer = await createCustomer({ name, phone, code });
    }

    // حساب التوصيل والإجمالي
    let deliveryFee = Number(payload?.deliveryFee || 0);
    if (zoneId && !deliveryFee) {
      const zone = await getDeliveryZoneById(zoneId);
      if (zone) deliveryFee = zone.fee || zone.price || 0;
    }

    const itemsTotal = formattedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
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
      success: true,
      orderId: String(newOrder.id),
      orderNumber: newOrder.orderNumber,
      passCode: customer.code,
      totalAmount: finalTotal,
    };
  } catch (err: any) {
    console.error("Error in submitOrderAction:", err);
    return { success: false, error: err?.message || "حدث خطأ غير متوقع عند تسجيل الطلب." };
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
      return { success: false, error: "الاسم ورقم الهاتف مطلوبان" };
    }

    let customer = await getCustomerByPhone(phone);
    if (!customer) {
      const code = `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      customer = await createCustomer({ name, phone, code });
    }

    return {
      success: true,
      customer: {
        id: String(customer.id),
        name: customer.name || customer.fullName || "",
        phone: customer.phone || customer.primaryPhone || "",
        passCode: customer.code,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "حدث خطأ غير متوقع" };
  }
}

export async function fetchCustomerPassAction(passCode: string) {
  try {
    const code = String(passCode || "").trim();
    if (!code) return { success: false, error: "كود البطاقة مطلوب" };

    const passData = await getPassData(code);
    if (!passData) {
      return { success: false, error: "لم نتمكن من العثور على بطاقة الولاء بهذا الكود" };
    }
    return { success: true, data: passData };
  } catch (err: any) {
    return { success: false, error: err?.message || "حدث خطأ غير متوقع" };
  }
}

export const passStatsAction = fetchCustomerPassAction;

export async function fetchOrdersByNumbersAction(orderNumbers: string[]) {
  try {
    if (!orderNumbers || orderNumbers.length === 0) return { success: true, orders: [] };
    const ordersList = await getOrdersByNumbers(orderNumbers);
    return { success: true, orders: ordersList };
  } catch (err: any) {
    return { success: false, error: err?.message || "حدث خطأ غير متوقع" };
  }
}

export const trackOrdersAction = fetchOrdersByNumbersAction;

export async function verifyAdminAction(passcode: string) {
  const adminPasscode = process.env.ADMIN_PASSCODE || "Asaad123456@@";
  if (passcode === adminPasscode) {
    return { success: true };
  }
  return { success: false, error: "رمز الدخول لصفحة الأدمن غير صحيح" };
}
