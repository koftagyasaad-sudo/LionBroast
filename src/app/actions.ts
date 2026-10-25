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
    const name = (payload.customerName || payload.name || "").trim();
    const phone = (payload.customerPhone || payload.phone || "").trim();
    const address = (payload.address || payload.addressDetails || "").trim();
    const deliveryZoneId = payload.deliveryZoneId ? String(payload.deliveryZoneId) : "";

    if (!name || !phone || !address) {
      return { success: false, error: "يرجى ملء كافة البيانات المطلوبة (الاسم، الهاتف، العنوان)." };
    }

    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "السلة فارغة. يرجى إضافة أصناف قبل إرسال الطلب." };
    }

    // البحث عن العميل أو إنشائه
    let customer = await getCustomerByPhone(phone);
    if (!customer) {
      const passCode = `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      customer = await createCustomer({
        name,
        phone,
        passCode,
      });
    }

    // توليد رقم طلب فريد
    const orderNumber = `LION-${Math.floor(1000 + Math.random() * 9000)}`;

    // حساب رسوم التوصيل
    let deliveryFee = Number(payload.deliveryFee || 0);
    if (deliveryZoneId && !deliveryFee) {
      const zone = await getDeliveryZoneById(deliveryZoneId);
      if (zone) {
        deliveryFee = Number(zone.fee || zone.price || 0);
      }
    }

    // حساب إجمالي السلة والخصم
    const itemsTotal = payload.items.reduce((sum: number, item: any) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 1);
      return sum + price * qty;
    }, 0);

    const discountAmount = Number(payload.discountAmount || 0);
    const finalTotal = Math.max(
      0,
      (payload.totalAmount ? Number(payload.totalAmount) : itemsTotal + deliveryFee) - discountAmount
    );

    const formattedItems = payload.items.map((item: any) => ({
      menuItemId: String(item.menuItemId || item.id),
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0),
      notes: [
        item.size ? `الحجم: ${item.size}` : "",
        item.isSpicy ? "حار 🔥" : "",
        item.notes || "",
      ]
        .filter(Boolean)
        .join(" | "),
    }));

    const newOrder = await createOrder({
      orderNumber,
      customerId: String(customer.id),
      deliveryZoneId,
      customerName: name,
      customerPhone: phone,
      address,
      notes: payload.notes || "",
      items: formattedItems,
      totalAmount: finalTotal,
      deliveryFee,
    });

    return {
      success: true,
      orderId: String(newOrder.id),
      orderNumber: newOrder.orderNumber,
      passCode: customer.passCode,
      totalAmount: finalTotal,
    };
  } catch (err: any) {
    console.error("Error in submitOrderAction:", err);
    return { success: false, error: err.message || "حدث خطأ غير متوقع عند تسجيل الطلب." };
  }
}

export const createOrderAction = submitOrderAction;

export async function saveCustomerAction(data: { name?: string; phone?: string; fullName?: string; primaryPhone?: string }) {
  try {
    const name = (data.name || data.fullName || "").trim();
    const phone = (data.phone || data.primaryPhone || "").trim();
    if (!name || !phone) {
      return { success: false, error: "الاسم ورقم الهاتف مطلوبان" };
    }

    let customer = await getCustomerByPhone(phone);
    if (!customer) {
      const passCode = `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      customer = await createCustomer({ name, phone, passCode });
    }

    return { success: true, customer };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchCustomerPassAction(passCode: string) {
  try {
    if (!passCode) return { success: false, error: "كود البطاقة مطلوب" };
    const passData = await getPassData(passCode.trim());
    if (!passData) {
      return { success: false, error: "لم نتمكن من العثور على بطاقة الولاء بهذا الكود" };
    }
    return { success: true, data: passData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export const passStatsAction = fetchCustomerPassAction;

export async function fetchOrdersByNumbersAction(orderNumbers: string[]) {
  try {
    if (!orderNumbers || orderNumbers.length === 0) return { success: true, orders: [] };
    const ordersList = await getOrdersByNumbers(orderNumbers);
    return { success: true, orders: ordersList };
  } catch (err: any) {
    return { success: false, error: err.message };
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
