"use server";

import {
  createCustomer,
  getCustomerByPhone,
  createOrder,
  getPassData,
  getOrdersByNumbers,
  getDeliveryZoneById,
  generatePassCode,
  toNumericId,
} from "@/db/queries";

export async function submitOrderAction(payload: any) {
  try {
    const name = String(payload?.customerName || payload?.name || "").trim();
    const phone = String(payload?.customerPhone || payload?.phone || "").trim();
    const address = String(payload?.address || payload?.addressDetails || "").trim();
    const deliveryZoneId = toNumericId(payload?.deliveryZoneId);

    if (!name || !phone || !address) {
      return { success: false, error: "يرجى ملء كافة البيانات المطلوبة (الاسم، الهاتف، العنوان)." };
    }

    if (!Array.isArray(payload?.items) || payload.items.length === 0) {
      return { success: false, error: "السلة فارغة. يرجى إضافة أصناف قبل إرسال الطلب." };
    }

    // تحويل الأصناف وقيم الأرقام
    const formattedItems = payload.items.map((item: any) => {
      const menuItemId = toNumericId(item.menuItemId ?? item.id);
      return {
        menuItemId,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        notes: [
          item.size ? `الحجم: ${item.size}` : "",
          item.isSpicy ? "حار 🔥" : "",
          item.notes || "",
        ]
          .filter(Boolean)
          .join(" | "),
      };
    });

    if (formattedItems.some((i: { menuItemId: number | null }) => i.menuItemId === null)) {
      return { success: false, error: "أحد الأصناف غير صالح. يرجى إعادة تحميل المنيو." };
    }

    // البحث عن العميل أو إنشائه
    let customer = await getCustomerByPhone(phone);
    if (!customer) {
      customer = await createCustomer({ name, phone, code: generatePassCode() });
    }

    // حساب رسوم التوصيل
    let deliveryFee = Number(payload?.deliveryFee || 0);
    if (deliveryZoneId !== null && !deliveryFee) {
      const zone = await getDeliveryZoneById(deliveryZoneId);
      if (zone) deliveryFee = Number(zone.fee ?? zone.price ?? 0);
    }

    // حساب الإجمالي
    const itemsTotal = formattedItems.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );
    const discountAmount = Number(payload?.discountAmount || 0);
    const baseTotal = payload?.totalAmount ? Number(payload.totalAmount) : itemsTotal + deliveryFee;
    const finalTotal = Math.max(0, baseTotal - discountAmount);

    const orderNumber = `LION-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await createOrder({
      orderNumber,
      customerId: customer.id,
      deliveryZoneId,
      customerName: name,
      customerPhone: phone,
      address,
      notes: String(payload?.notes || ""),
      items: formattedItems as { menuItemId: number; quantity: number; price: number; notes: string }[],
      totalAmount: finalTotal,
      deliveryFee,
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
      customer = await createCustomer({ name, phone, code: generatePassCode() });
    }

    return {
      success: true,
      customer: { id: String(customer.id), name: customer.name, phone: customer.phone, passCode: customer.code },
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
