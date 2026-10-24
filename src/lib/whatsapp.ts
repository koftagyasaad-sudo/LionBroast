import { waLink } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import type { OrderLine } from "@/db/schema";

export interface WhatsOrderPayload {
  orderNumber: string;
  customerName: string;
  primaryPhone: string;
  secondaryPhone?: string | null;
  address: string;
  mapsUrl: string;
  zoneName: string;
  outOfRange: boolean;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string | null;
}

const flavorAr = (f?: OrderLine["flavor"]) => (f === "spicy" ? "حار" : f === "original" ? "أصلي" : null);

/** Builds the itemized Arabic dispatch note the restaurant receives. */
export function buildWhatsAppMessage(p: WhatsOrderPayload): string {
  const line = "--------------------------";
  const rows = p.items.map((it, i) => {
    const extras: string[] = [];
    if (it.sizeLabel) extras.push(it.sizeLabel.split(" / ")[0]);
    const f = flavorAr(it.flavor);
    if (f) extras.push(f);
    const extra = extras.length ? ` (${extras.join("، ")})` : "";
    return `${i + 1}. ${it.nameAr}${extra} × ${it.qty} = ${Math.round(it.unitPrice * it.qty)} ج.م`;
  });

  const delivery = p.outOfRange ? "يُحدد بعد المراجعة" : `${p.deliveryFee} ج.م`;
  const total = p.outOfRange ? `${p.subtotal} ج.م + التوصيل` : `${p.total} ج.م`;

  return [
    `*طلب جديد - بروست الأسد*`,
    `رقم الطلب: ${p.orderNumber}`,
    line,
    `الاسم: ${p.customerName}`,
    `موبايل ١: ${p.primaryPhone}`,
    p.secondaryPhone ? `موبايل ٢: ${p.secondaryPhone}` : null,
    `المنطقة: ${p.zoneName}`,
    `العنوان: ${p.address}`,
    `اللوكيشن: ${p.mapsUrl}`,
    line,
    ...rows,
    line,
    `المجموع: ${p.subtotal} ج.م`,
    `التوصيل: ${delivery}`,
    `*الإجمالي: ${total}*`,
    p.notes ? `${line}` : null,
    p.notes ? `ملاحظات: ${p.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function checkoutWhatsAppLink(p: WhatsOrderPayload): string {
  return waLink(WHATSAPP_NUMBER, buildWhatsAppMessage(p));
}
