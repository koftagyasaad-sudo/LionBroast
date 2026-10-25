// src/app/api/customer/[code]/route.ts

import { NextResponse } from "next/server";
import { getPassData } from "@/db/queries";

export async function GET(
  request: Request,
  props: { params: Promise<{ code: string }> }
) {
  try {
    const params = await props.params;
    const code = params.code;

    if (!code) {
      return NextResponse.json({ found: false, error: "كود العميل مطلوب" }, { status: 400 });
    }

    const data = await getPassData(code);
    if (!data) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    const { customer, ordersList, ordersCount, ltv, zone } = data;

    return NextResponse.json({
      found: true,
      customer: {
        code: customer.code,
        fullName: customer.fullName,
        primaryPhone: customer.primaryPhone,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        loyaltyPoints: customer.loyaltyPoints,
        discountPercent: customer.discountPercent,
      },
      ordersList,
      ordersCount,
      ltv,
      zone,
    });
  } catch (err: any) {
    console.error("Error in GET /api/customer/[code]:", err);
    return NextResponse.json(
      { found: false, error: err?.message || "حدث خطأ أثناء الاستعلام" },
      { status: 500 }
    );
  }
}
