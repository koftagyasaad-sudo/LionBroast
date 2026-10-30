"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  UtensilsCrossed,
  MapPin,
} from "lucide-react";
import Link from "next/link";

// دالة أمان هندسية تمنع خطأ toLocaleString نهائياً تحت أي ظرف
const fmt = (n: any): string => {
  const num = Number(n);
  return isNaN(num) ? "0" : num.toLocaleString("ar-EG");
};

interface OverviewTabProps {
  data: any;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  // استخراج آمن للبيانات مع قيم افتراضية كاملة
  const kpis = data?.kpis || data?.stats || data?.metrics || {};
  const orders: any[] = Array.isArray(data?.orders) ? data.orders : [];
  const customers: any[] = Array.isArray(data?.customers) ? data.customers : [];
  const items: any[] = Array.isArray(data?.items || data?.menuItems) ? (data.items || data.menuItems) : [];
  const zones: any[] = Array.isArray(data?.zones || data?.deliveryZones) ? (data.zones || data.deliveryZones) : [];

  const totalRevenue = kpis.revenue ?? kpis.totalRevenue ?? data?.revenue ?? 0;
  const totalOrders = kpis.orders ?? kpis.totalOrders ?? orders.length;
  const totalCustomers = kpis.customers ?? kpis.totalCustomers ?? customers.length;
  const avgOrder = kpis.avgOrder ?? kpis.averageOrderValue ?? (totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0);

  const pendingOrders = orders.filter((o) => o?.status === "pending" || o?.status === "preparing").length;
  const completedOrders = orders.filter((o) => o?.status === "delivered" || o?.status === "completed").length;

  const cards = [
    {
      title: "إجمالي المبيعات",
      value: `${fmt(totalRevenue)} ج.م`,
      sub: "إجمالي الدخل المالي المسجل",
      icon: DollarSign,
      color: "text-brand-500",
      bg: "bg-brand-500/10",
      border: "border-brand-500/20",
    },
    {
      title: "إجمالي الطلبات",
      value: fmt(totalOrders),
      sub: `${fmt(pendingOrders)} طلب قيد التنفيذ`,
      icon: ShoppingBag,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      title: "قاعدة العملاء",
      value: fmt(totalCustomers),
      sub: "عميل مسجل في بطاقات الولاء",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      border: "border-blue-400/20",
    },
    {
      title: "متوسط قيمة الطلب",
      value: `${fmt(avgOrder)} ج.م`,
      sub: "معدل السلة الشرائية",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
  ];

  return (
    <div dir="rtl" className="space-y-8 text-white">
      {/* شبكة مؤشرات الأداء الأساسية */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className={`rounded-2xl border ${c.border} bg-carbon-900 p-5 shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white/60">{c.title}</span>
              <div className={`grid size-10 place-items-center rounded-xl ${c.bg} ${c.color}`}>
                <c.icon className="size-5" />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold tracking-tight">{c.value}</div>
            <p className="mt-1 text-xs text-white/40">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* الحالة السريعة للعمليات والمنيو */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ملخص المستودع والمنيو */}
        <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 space-y-4">
          <h3 className="flex items-center gap-2 text-base font-extrabold">
            <UtensilsCrossed className="size-4 text-brand-500" />
            حالة العمليات الميدانية
          </h3>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between rounded-xl bg-carbon-950 p-3 text-sm">
              <span className="flex items-center gap-2 text-white/70">
                <CheckCircle2 className="size-4 text-emerald-400" /> الطلبات المكتملة
              </span>
              <span className="font-extrabold text-emerald-400">{fmt(completedOrders)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-carbon-950 p-3 text-sm">
              <span className="flex items-center gap-2 text-white/70">
                <Clock className="size-4 text-amber-400" /> قيد المطبخ والتوصيل
              </span>
              <span className="font-extrabold text-amber-400">{fmt(pendingOrders)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-carbon-950 p-3 text-sm">
              <span className="flex items-center gap-2 text-white/70">
                <UtensilsCrossed className="size-4 text-brand-500" /> أصناف المنيو النشطة
              </span>
              <span className="font-extrabold">{fmt(items.length)} صنف</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-carbon-950 p-3 text-sm">
              <span className="flex items-center gap-2 text-white/70">
                <MapPin className="size-4 text-blue-400" /> مناطق التوصيل المتاحة
              </span>
              <span className="font-extrabold">{fmt(zones.length)} منطقة</span>
            </div>
          </div>
        </div>

        {/* جدول أحدث الطلبات المسجلة */}
        <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="flex items-center gap-2 text-base font-extrabold">
              <ShoppingBag className="size-4 text-brand-500" />
              أحدث العمليات والطلبات
            </h3>
            <span className="text-xs text-white/40">آخر {Math.min(orders.length, 6)} طلبات</span>
          </div>

          {orders.length === 0 ? (
            <div className="grid h-48 place-items-center text-center text-sm text-white/40">
              <p>لا توجد طلبات مسجلة حتى الآن في النظام.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-white/40">
                    <th className="pb-3 font-semibold">رقم الطلب</th>
                    <th className="pb-3 font-semibold">العميل</th>
                    <th className="pb-3 font-semibold">الحالة</th>
                    <th className="pb-3 font-semibold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold">
                  {orders.slice(0, 6).map((ord: any, idx: number) => {
                    const ordTotal = ord?.totalAmount ?? ord?.total ?? ord?.subtotal ?? 0;
                    return (
                      <tr key={ord?.id || idx} className="hover:bg-white/[0.02]">
                        <td className="py-3 font-mono text-brand-500">{ord?.orderNumber || `#${ord?.id || idx}`}</td>
                        <td className="py-3 text-white/80">{ord?.customerName || ord?.customerPhone || "عميل سريع"}</td>
                        <td className="py-3">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              ord?.status === "completed" || ord?.status === "delivered"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : ord?.status === "cancelled"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {ord?.status || "معلق"}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-white">{fmt(ordTotal)} ج.م</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
