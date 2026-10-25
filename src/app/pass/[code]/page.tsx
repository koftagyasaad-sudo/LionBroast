import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as dbQueries from "@/db/queries";

export const revalidate = 0;

interface PassPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function CustomerPassPage({ params }: PassPageProps) {
  const resolvedParams = await params;
  const code = decodeURIComponent(resolvedParams.code || "").trim();

  if (!code) {
    notFound();
  }

  // استدعاء مرن لدالة جلب بيانات العميل من @/db/queries أياً كان اسمها في مشروعك
  const queries = dbQueries as Record<string, any>;
  const fetchCustomerFn =
    queries.getCustomerByPassCode ||
    queries.getCustomerByCode ||
    queries.getPassByCode ||
    queries.getCustomerPass ||
    queries.getCustomer;

  const customer: {
    id: string;
    name: string;
    phone: string;
    passCode: string;
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    discountPercent: number;
    createdAt: string | Date;
    customerCode?: string;
  } | null = fetchCustomerFn ? await fetchCustomerFn(code) : null;

  if (!customer) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center"
      >
        <div className="max-w-md w-full rounded-3xl bg-neutral-900 border border-neutral-800 p-8 space-y-6 shadow-2xl">
          <div className="text-6xl">🦁</div>
          <h1 className="text-2xl font-extrabold text-amber-400">
            كود العضوية غير موجود
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            لم نتمكن من العثور على بطاقة ولاء مرتبطة بالكود{" "}
            <span className="font-mono font-bold text-white bg-neutral-800 px-2 py-1 rounded">
              {code}
            </span>
            . تأكد من كتابة الكود بشكل صحيح أو تواصل مع خدمة عملاء بروست الأسد.
          </p>
          <Link
            href="/"
            className="inline-block w-full rounded-2xl bg-amber-500 py-3.5 font-extrabold text-neutral-950 hover:bg-amber-400 transition-all"
          >
            العودة للمنيو الرئيسي 🍗
          </Link>
        </div>
      </main>
    );
  }

  const displayCode = customer.passCode || customer.customerCode || code;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-neutral-950 text-white py-12 px-4 md:px-8 flex flex-col items-center justify-center"
    >
      <div className="max-w-xl w-full space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-neutral-300 hover:text-white border border-neutral-800 transition-all"
          >
            <span>→</span>
            <span>العودة للمتجر</span>
          </Link>
          <span className="text-sm font-bold text-amber-400">
            بروست الأسد 🦁 VIP Pass
          </span>
        </div>

        {/* بطاقة الولاء */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-800 p-8 shadow-2xl border border-amber-400/30">
          <div className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-black/30 blur-2xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  بطاقة عضوية العميل
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
                  {customer.name}
                </h1>
                <p dir="ltr" className="text-sm text-white/80 font-mono mt-0.5 text-right">
                  {customer.phone}
                </p>
              </div>
              <p className="rounded-2xl bg-black/40 px-4 py-2 font-mono text-lg font-extrabold tracking-widest text-amber-300 border border-white/10">
                {displayCode}
              </p>
            </div>

            {/* إحصائيات العميل */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/15">
              <div className="rounded-2xl bg-black/25 p-3.5 text-center backdrop-blur-sm">
                <p className="text-xs text-white/75 font-medium">نقاط الولاء</p>
                <p className="text-xl md:text-2xl font-black text-amber-300 mt-1">
                  {customer.loyaltyPoints ?? 0}
                </p>
              </div>

              <div className="rounded-2xl bg-black/25 p-3.5 text-center backdrop-blur-sm">
                <p className="text-xs text-white/75 font-medium">نسبة الخصم</p>
                <p className="text-xl md:text-2xl font-black text-white mt-1">
                  {customer.discountPercent ?? 0}%
                </p>
              </div>

              <div className="rounded-2xl bg-black/25 p-3.5 text-center backdrop-blur-sm">
                <p className="text-xs text-white/75 font-medium">إجمالي الطلبات</p>
                <p className="text-xl md:text-2xl font-black text-white mt-1">
                  {customer.totalOrders ?? 0}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/80 pt-2">
              <span>إجمالي المشتريات: {customer.totalSpent ?? 0} ج.م</span>
              <span>
                عضو منذ:{" "}
                {customer.createdAt
                  ? new Date(customer.createdAt).toLocaleDateString("ar-EG")
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* زر الطلب السريع */}
        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-6 text-center space-y-4">
          <p className="text-neutral-300 text-sm">
            استخدم كود العضوية الخاص بك <strong className="text-amber-400 font-mono">{displayCode}</strong> عند إتمام الطلب للحصول على نقاطك وخصوماتك فوراً!
          </p>
          <Link
            href="/"
            className="inline-block w-full rounded-2xl bg-amber-500 py-4 font-extrabold text-neutral-950 shadow-lg hover:bg-amber-400 transition-all"
          >
            اطلب الآن واستخدم خصمك 🔥
          </Link>
        </div>
      </div>
    </main>
  );
}
