import { NextResponse } from "next/server";
import { getPassData } from "@/db/queries";

export const dynamic = "force-dynamic";

/** POS / rider lookup endpoint consumed by the Lion Pass QR. */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getPassData(code.toUpperCase());
  if (!data) {
    return NextResponse.json({ found: false }, { status: 404 });
  }
  const { customer, ordersList, ordersCount, ltv, zone } = data;
  return NextResponse.json({
    found: true,
    customer: {
      code: customer.customerCode,
      name: customer.name,
      primaryPhone: customer.primaryPhone,
      secondaryPhone: customer.secondaryPhone,
      address: [customer.street, customer.building, customer.flat, customer.landmark].filter(Boolean).join(", "),
      zone: zone ? { nameAr: zone.nameAr, nameEn: zone.nameEn, fee: zone.price } : null,
      loyaltyPoints: ordersCount * 10,
    },
    stats: { ordersCount, ltv },
    recentOrders: ordersList.slice(0, 10).map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      createdAt: o.createdAt,
      items: o.items.length,
    })),
  });
}
