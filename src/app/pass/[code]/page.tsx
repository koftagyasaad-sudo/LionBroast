import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, MapPin, Phone, ReceiptText, ShieldAlert, ShoppingBag, Wallet } from "lucide-react";
import { getPassData } from "@/db/queries";
import { money } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Lion Pass Verification", robots: { index: false } };

export default async function PassPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getPassData(code.toUpperCase());

  if (!data) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#0F1115] p-6 text-center text-white">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[#181A20] p-10">
          <ShieldAlert className="mx-auto size-12 text-red-400" />
          <h1 className="mt-4 text-2xl font-extrabold">الكود ده مش مسجل</h1>
          <p className="mt-2 text-sm text-white/60">This Lion Pass code is not registered — double-check or register on the site.</p>
          <p className="mt-4 font-mono text-lg font-bold tracking-[0.25em] text-red-300" dir="ltr">{code}</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FF6600] px-6 py-3 text-sm font-extrabold">
            ارجع للمنيو <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { customer, ordersList, ordersCount, ltv, zone } = data;
  void notFound;

  return (
    <div className="min-h-svh bg-[#0F1115] pb-16 text-white">
      {/* Band */}
      <div className="bg-gradient-to-l from-[#EA580C] via-[#FF6600] to-[#F59E0B] py-3 text-center text-[11px] font-extrabold uppercase tracking-[0.35em] text-white">
        Broast El-Assad · Lion Pass · بروست الأسد
      </div>

      <div className="mx-auto max-w-lg px-4 pt-10">
        {/* Boarding pass card */}
        <div className="overflow-hidden rounded-[32px] border border-amber-500/30 bg-[#181A20] shadow-2xl">
          <div className="relative bg-gradient-to-br from-[#241505] via-[#1c1408] to-[#120c04] p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/mascot-lion.png" alt="mascot" className="size-14 rounded-2xl object-cover ring-2 ring-amber-400/60" />
                <div>
                  <h1 className="text-xl font-extrabold">{customer.name}</h1>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <BadgeCheck className="size-4" /> عضوية موثقة · Verified
                  </p>
                </div>
              </div>
              <p className="rounded-2xl bg-black/40 px-4 py-2 font-mono text-lg font-extrabold tracking-[0.2em] text-amber-300" dir="ltr">
                {customer.customerCode}
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-black/30 p-3">
                <ShoppingBag className="mx-auto size-4 text-amber-400" />
                <p className="mt-1 text-lg font-extrabold">{ordersCount}</p>
                <p className="text-[10px] font-semibold text-white/50">طلبات · Orders</p>
              </div>
              <div className="rounded-2xl bg-black/30 p-3">
                <Wallet className="mx-auto size-4 text-emerald-400" />
                <p className="mt-1 text-lg font-extrabold">{money(ltv, "ar")}</p>
                <p className="text-[10px] font-semibold text-white/50">إنفاق · Spend</p>
              </div>
              <div className="rounded-2xl bg-black/30 p-3">
                <ReceiptText className="mx-auto size-4 text-orange-400" />
                <p className="mt-1 text-sm font-extrabold">
                  {customer.createdAt.toLocaleDateString("ar-EG", { month: "short", year: "numeric" })}
                </p>
                <p className="text-[10px] font-semibold text-white/50">عضو منذ · Since</p>
              </div>
            </div>
          </div>

          {/* Perforation */}
          <div className="relative border-t-2 border-dashed border-white/15">
            <span className="absolute -start-4 -top-4 size-8 rounded-full bg-[#0F1115]" />
            <span className="absolute -end-4 -top-4 size-8 rounded-full bg-[#0F1115]" />
          </div>

          <div className="space-y-4 p-7">
            <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
              <Phone className="mt-0.5 size-4 shrink-0 text-orange-400" />
              <div dir="ltr" className="text-sm font-bold">
                <p>{customer.primaryPhone}</p>
                {customer.secondaryPhone && <p className="text-white/60">{customer.secondaryPhone}</p>}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
              <MapPin className="mt-0.5 size-4 shrink-0 text-orange-400" />
              <div className="text-sm leading-relaxed">
                <p className="font-bold">{customer.street}</p>
                <p className="text-xs text-white/60">
                  {[customer.building && `عمارة ${customer.building}`, customer.flat && `شقة ${customer.flat}`, customer.landmark && `علامة: ${customer.landmark}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {zone && <p className="mt-1 text-xs font-bold text-amber-300">{zone.nameAr} — توصيل {money(zone.price, "ar")}</p>}
              </div>
            </div>

            {ordersList.length > 0 && (
              <div>
                <h2 className="mb-2 text-xs font-extrabold uppercase tracking-widest text-white/40">آخر الطلبات · Recent Orders</h2>
                <div className="space-y-2">
                  {ordersList.slice(0, 4).map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-2.5">
                      <div>
                        <p className="font-mono text-xs font-bold" dir="ltr">{o.orderNumber}</p>
                        <p className="text-[10px] text-white/50">{o.status}</p>
                      </div>
                      <span className="text-sm font-extrabold text-orange-400">{money(o.total, "ar")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/menu"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#FF6600] py-3.5 text-sm font-extrabold text-white transition hover:scale-[1.01]"
            >
              اطلب من المنيو · Browse Menu <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-white/40">
          POS / Delivery verification endpoint: <span className="font-mono" dir="ltr">/api/customer/{customer.customerCode}</span>
        </p>
      </div>
    </div>
  );
}
