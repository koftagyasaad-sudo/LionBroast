"use client";

import { CalendarClock, Flame, ListOrdered, TrendingUp, Users, Wallet } from "lucide-react";
import type { AdminBundle } from "@/lib/admin-types";
import { motion } from "framer-motion";

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function OverviewTab({ data }: { data: AdminBundle }) {
  const { stats } = data;
  const cards = [
    { label: "إجمالي الإيرادات", labelEn: "Lifetime Revenue", value: `${fmt(stats.revenue)} EGP`, icon: Wallet, tone: "from-emerald-500 to-emerald-700" },
    { label: "إيرادات النهاردة", labelEn: "Today's Revenue", value: `${fmt(stats.todayRevenue)} EGP`, icon: TrendingUp, tone: "from-brand-500 to-brand-700" },
    { label: "إجمالي الطلبات", labelEn: "Total Orders", value: fmt(stats.ordersCount), icon: ListOrdered, tone: "from-cheese-400 to-cheese-500" },
    { label: "طلبات قيد الانتظار", labelEn: "Pending Orders", value: fmt(stats.pendingCount), icon: CalendarClock, tone: "from-sky-500 to-sky-700" },
    { label: "العملاء المسجلين", labelEn: "Registered Customers", value: fmt(stats.customersCount), icon: Users, tone: "from-violet-500 to-violet-700" },
    { label: "طلبات النهاردة", labelEn: "Today's Orders", value: fmt(stats.todayOrders), icon: Flame, tone: "from-rose-500 to-rose-700" },
  ];

  const maxQty = Math.max(...stats.topItems.map((i) => i.qty), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">نظرة عامة · Executive Overview</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.labelEn}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-carbon-900 p-5"
          >
            <span className={`absolute -end-6 -top-6 size-24 rounded-full bg-gradient-to-br opacity-25 blur-xl ${c.tone}`} />
            <span className={`grid size-10 place-items-center rounded-2xl bg-gradient-to-br text-white ${c.tone}`}>
              <c.icon className="size-5" />
            </span>
            <p className="mt-4 text-2xl font-extrabold tracking-tight" dir="ltr">
              {c.value}
            </p>
            <p className="mt-1 text-xs font-bold text-white/70">{c.label}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">{c.labelEn}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top items */}
        <div className="rounded-3xl border border-white/10 bg-carbon-900 p-5">
          <h2 className="flex items-center gap-2 text-sm font-extrabold">
            <Flame className="size-4 text-brand-500" /> الأكثر مبيعاً · Top Items
          </h2>
          <div className="mt-4 space-y-3">
            {stats.topItems.length === 0 && <p className="text-xs text-white/40">No orders yet — the fryer awaits.</p>}
            {stats.topItems.map((it) => (
              <div key={it.name}>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{it.name}</span>
                  <span className="text-cheese-300" dir="ltr">{it.qty} sold · {fmt(it.revenue)} EGP</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(it.qty / maxQty) * 100}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="h-full rounded-full flame-badge"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest orders */}
        <div className="rounded-3xl border border-white/10 bg-carbon-900 p-5">
          <h2 className="flex items-center gap-2 text-sm font-extrabold">
            <ListOrdered className="size-4 text-cheese-400" /> أحدث الطلبات · Latest Orders
          </h2>
          <div className="mt-4 space-y-2">
            {data.orders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-2.5 text-xs">
                <div>
                  <p className="font-mono font-bold" dir="ltr">{o.orderNumber}</p>
                  <p className="text-[10px] text-white/45">{o.customerName} · {o.deliveryZone}</p>
                </div>
                <div className="text-end">
                  <p className="font-extrabold text-brand-400" dir="ltr">{fmt(o.total)} EGP</p>
                  <p className="text-[10px] font-bold text-white/50">{o.status}</p>
                </div>
              </div>
            ))}
            {data.orders.length === 0 && <p className="text-xs text-white/40">Orders placed via WhatsApp checkout appear here instantly.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
