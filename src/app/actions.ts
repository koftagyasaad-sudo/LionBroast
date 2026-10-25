"use me";
// src/app/actions.ts

"use server";

import {
  createCustomer,
  createOrder,
  getCustomerByPhone,
  getDeliveryZoneById,
  getOrdersByNumbers,
} from "@/db/queries";
import { isEgyptMobile, normalizeEgyptPhone } from "@/lib/utils";

/**
 * 1. إنشاء طلب جديد (Submit / Create Order Action)
 */
export async function submitOrderAction(payload: {
  name: string;
  phone: string;
  zoneId: string;
  addressDetails: string;
  notes?: string;
  items: {
    id: string;
    nameAr: string;
    nameEn: string;
    price: number;
    quantity: number;
  }[];
}) {
  try {
    const rawPhone = payload.phone.trim();
    const phone = normalizeEgyptPhone(rawPhone);

    if (!isEgyptMobile(phone)) {
      return {
        success: false,
        error: "رقم الهاتف غير صحيح، يرجى إدخال رقم موبايل مصري صحيح (مثال: 01012345678)",
      };
    }

    if (!payload.items || payload.items.length === 0) {
      return {
        success: false,
        error: "السلة فارغة، يرجى إضافة وجبات قبل إتمام الطلب",
      };
    }

    // 1. Check/Create Customer
    let customer = await getCustomerByPhone(phone);
    if (!customer) {
      customer = await createCustomer({
        fullName: payload.name.trim(),
        primaryPhone: phone,
        primaryAddress: payload.addressDetails.trim(),
      });
    }

    // 2. Delivery Zone Fee
    let deliveryFee = 15;
    let zoneName = "توصيل دسوق";
    if (payload.zoneId) {
      const zone = await getDeliveryZoneById(payload.zoneId);
      if (zone) {
        deliveryFee = zone.fee;
        zoneName = zone.nameAr;
      }
    }

    // 3. Calc Total
    const subtotal = payload.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const totalAmount = subtotal + deliveryFee;

    // 4. Create Order
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const newOrder = await createOrder({
      orderNumber,
      customerPhone: phone,
      customerName: payload.name.trim(),
      address: payload.addressDetails.trim(),
      zoneId: payload.zoneId || null,
      subtotal,
      deliveryFee,
      totalAmount,
      notes: payload.notes || "",
      items: payload.items.map((item) => ({
        itemId: item.id,
        nameAr: item.nameAr,
        price: item.price,
        quantity: item.quantity,
      })),
    });

    return {
      success: true,
      orderNumber: newOrder.orderNumber,
      customerCode: customer.code,
      totalAmount,
      deliveryFee,
      zoneName,
    };
  } catch (err: any) {
    console.error("Error in submitOrderAction:", err);
    return {
      success: false,
      error: err?.message || "حدث خطأ غير متوقع أثناء إنشاء الطلب",
    };
  }
}

/**
 * التوافقية السابقة: createOrderAction مستخدمة داخل CartDrawer.tsx
 */
export async function createOrderAction(payload: any) {
  const name = payload.name || payload.customerName || "";
  const phone = payload.phone || payload.customerPhone || "";
  const zoneId = payload.zoneId || "";
  const addressDetails = payload.addressDetails || payload.address || "";
  const notes = payload.notes || "";
  const items = payload.items || [];

  return submitOrderAction({
    name,
    phone,
    zoneId,
    addressDetails,
    notes,
    items,
  });
}

/**
 * 2. حفظ العميل الجديد (Onboarding Modal Action)
 */
export async function saveCustomerAction(payload: {
  name: string;
  phone: string;
  zoneId?: string;
  addressDetails?: string;
  address?: string;
}) {
  try {
    const phone = normalizeEgyptPhone(payload.phone);
    if (!isEgyptMobile(phone)) {
      return { success: false, message: "رقم الموبايل المصري غير صحيح" };
    }

    let customer = await getCustomerByPhone(phone);
    if (!customer) {
      customer = await createCustomer({
        fullName: payload.name.trim(),
        primaryPhone: phone,
        primaryAddress: payload.addressDetails || payload.address || "",
      });
    }

    return {
      success: true,
      customerCode: customer.code,
      code: customer.code,
      customer,
    };
  } catch (err: any) {
    console.error("Error in saveCustomerAction:", err);
    return { success: false, message: "فشل حفظ بيانات العميل" };
  }
}

/**
 * 3. جلب كارت العميل ونقاط الولاء (Customer Pass & Loyalty)
 */
export async function fetchCustomerPassAction(phoneOrCode: string) {
  try {
    const cleaned = phoneOrCode.trim();
    if (!cleaned) {
      return { success: false, error: "يرجى إدخال رقم الهاتف أو كود العميل" };
    }

    const phone = normalizeEgyptPhone(cleaned);
    const customer = await getCustomerByPhone(phone);

    if (!customer) {
      return {
        success: false,
        error: "لم يتم العثور على حساب بهذا الرقم. يرجى طلب طلبك الأول للتفعيل تلقائياً!",
      };
    }

    return {
      success: true,
      customer: {
        code: customer.code,
        fullName: customer.fullName,
        primaryPhone: customer.primaryPhone,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        loyaltyPoints: customer.loyaltyPoints,
        discountPercent: customer.discountPercent,
      },
    };
  } catch (err: any) {
    console.error("Error in fetchCustomerPassAction:", err);
    return { success: false, error: "تعذر الاستعلام عن كارت العميل" };
  }
}

/**
 * التوافقية السابقة: passStatsAction مستخدمة داخل CustomerQRCode.tsx
 */
export async function passStatsAction(phoneOrCode: string) {
  const res = await fetchCustomerPassAction(phoneOrCode);
  if (!res.success || !res.customer) {
    return {
      success: false,
      message: res.error || "تعذر العثور على بيانات العميل",
    };
  }

  const c = res.customer;
  return {
    success: true,
    ordersCount: c.totalOrders || 0,
    totalSpent: c.totalSpent || 0,
    points: c.loyaltyPoints || 0,
    passCode: c.code,
    name: c.fullName || "عميل بروست الأسد",
    phone: c.primaryPhone,
    discountPercent: c.discountPercent || 0,
    data: {
      ordersCount: c.totalOrders || 0,
      totalSpent: c.totalSpent || 0,
      points: c.loyaltyPoints || 0,
      passCode: c.code,
      name: c.fullName || "عميل بروست الأسد",
      phone: c.primaryPhone,
      discountPercent: c.discountPercent || 0,
    },
  };
}

/**
 * 4. تتبع الطلبات (Track Orders Action)
 */
export async function fetchOrdersByNumbersAction(orderNumbers: string[]) {
  try {
    if (!orderNumbers || orderNumbers.length === 0) {
      return { success: true, orders: [] };
    }

    const orders = await getOrdersByNumbers(orderNumbers);
    return {
      success: true,
      orders: orders.map((ord) => ({
        orderNumber: ord.orderNumber,
        status: ord.status,
        totalAmount: ord.totalAmount,
        createdAt: ord.createdAt
          ? new Date(ord.createdAt).toISOString()
          : new Date().toISOString(),
        itemsCount: (ord as any).itemsCount || 1,
      })),
    };
  } catch (err: any) {
    console.error("Error in fetchOrdersByNumbersAction:", err);
    return { success: false, error: "فشل تتبع الطلبات" };
  }
}

/**
 * التوافقية السابقة: trackOrdersAction مستخدمة داخل TrackerModal.tsx
 */
export async function trackOrdersAction(orderNumbers: string[] | string) {
  const nums = Array.isArray(orderNumbers) ? orderNumbers : [orderNumbers];
  const res = await fetchOrdersByNumbersAction(nums);
  return {
    success: res.success,
    orders: res.orders || [],
    data: res.orders || [],
  };
}

/**
 * 5. التحقق من كلمة مرور الأدمن (Admin Gate Action)
 */
export async function verifyAdminAction(passcode: string) {
  try {
    const expected = process.env.ADMIN_PASSCODE || "Asaad123456@@";
    if (passcode.trim() === expected.trim()) {
      return {
        success: true,
        token: "ba-admin-authenticated-token",
      };
    }
    return {
      success: false,
      message: "كلمة المرور غير صحيحة!",
    };
  } catch (err: any) {
    console.error("Error in verifyAdminAction:", err);
    return {
      success: false,
      message: "حدث خطأ أثناء التحقق من كلمة المرور",
    };
  }
}
