"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Moon,
  RefreshCw,
  ScanLine,
  Settings2,
  Sun,
  UtensilsCrossed,
  Users,
  MonitorSmartphone, // استيراد أيقونة القسم الجديد
} from "lucide-react";
import type { AdminBundle } from "@/lib/admin-types";
import { adminGetAllAction } from "@/app/admin-actions";
import { useApp } from "@/store/app-store";
import OverviewTab from "@/components/admin/OverviewTab";
import OrdersTab from "@/components/admin/OrdersTab";
import CustomersTab from "@/components/admin/CustomersTab";
import MenuTab from "@/components/admin/MenuTab";
import MenuScanner from "@/components/admin/MenuScanner";
import OpsTab from "@/components/admin/OpsTab";
import FrontendTab from "@/components/admin/FrontendTab"; // استيراد القسم الجديد

type TabKey = "overview" | "orders" | "customers" | "menu" | "scanner" | "frontend" | "ops";

const TABS: { key: TabKey; labelAr: string; labelEn: string; icon: typeof LayoutDashboard }[] = [
  { key: "overview", labelAr: "نظرة عامة", labelEn: "Overview", icon: LayoutDashboard },
  { key: "orders", labelAr: "الطلبات", labelEn: "Orders", icon: ListOrdered },
  { key: "customers", labelAr: "العملاء CRM", labelEn: "Customers", icon: Users },
  { key: "menu", labelAr: "المنيو", labelEn: "Menu CRUD", icon: UtensilsCrossed },
  { key: "scanner", labelAr: "ماسح المنيو AI", labelEn: "AI Scanner", icon: ScanLine },
  { key: "frontend", labelAr: "إعدادات الواجهة", labelEn: "Site Content", icon: MonitorSmartphone }, // الزرار الجديد
  { key: "ops", labelAr: "المناطق والإعلانات", labelEn: "Zones & Promo", icon: Settings2 },
];

export interface TabProps {
  token: string;
  data: AdminBundle;
  refresh: () => Promise<void>;
}

export default function AdminShell({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [data, setData] = useState<AdminBundle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useApp((s) => s.theme);
  const setTheme = useApp((s) => s.setTheme);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const bundle = await adminGetAllAction(token);
      setData(bundle as AdminBundle);
      setError(null);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-svh bg-carbon-950 text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-carbon-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/icon-512.png" alt="logo" className="size-10 rounded-xl object-cover ring-2 ring-brand-500/50" />
            <div>
              <p className="text-sm font-extrabold">غرفة التحكم · Control Room</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500">Broast El-Assad</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="grid size-9 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-brand-500 hover:text-brand-400"
              aria-label="refresh"
            >
              <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="grid size-9 place-items-center rounded-full border border-white/10 text-white/70 transition hover:border-brand-500"
              aria-label="theme"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Link
              href="/"
              className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3.5 text-xs font-bold text-white/80 transition hover:border-brand-500 hover:text-brand-400"
            >
              <ArrowUpRight className="size-3.5" /> الموقع
            </Link>
            <button
              onClick={onLogout}
              className="flex h-9 items-center gap-1.5 rounded-full bg-red-500/10 px-3.5 text-xs font-bold text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut className="size-3.5" /> خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6 md:px-6">
        {/* Sidebar */}
        <aside className="sticky top-24 hidden h-fit w-56 shrink-0 flex-col gap-1 md:flex">
          {TABS.map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-start text-sm font-bold transition ${
                tab === tItem.key ? "bg-brand-500 text-white shadow-lg glow-brand" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tItem.icon className="size-4.5 shrink-0" />
              <span>
                {tItem.labelAr}
                <span className="block text-[10px] font-semibold opacity-60">{tItem.labelEn}</span>
              </span>
            </button>
          ))}
        </aside>

        {/* Mobile tabs */}
        <div className="no-scrollbar fixed bottom-0 inset-x-0 z-40 flex gap-1.5 overflow-x-auto border-t border-white/10 bg-carbon-950/95 p-2 backdrop-blur-xl md:hidden">
          {TABS.map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2.5 text-[11px] font-extrabold transition ${
                tab === tItem.key ? "bg-brand-500 text-white" : "bg-white/5 text-white/60"
              }`}
            >
              <tItem.icon className="size-4" />
              {tItem.labelEn}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="min-w-0 flex-1 pb-20 md:pb-6">
          {error && <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-bold text-red-400">{error}</div>}
          {!data && !error && (
            <div className="grid place-items-center gap-4 py-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/mascot-lion.png" alt="mascot" className="size-20 animate-float rounded-2xl object-cover" />
              <p className="text-sm font-bold text-white/50">جاري تجهيز غرفة التحكم...</p>
            </div>
          )}
          {data && (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                {tab === "overview" && <OverviewTab data={data} />}
                {tab === "orders" && <OrdersTab token={token} data={data} refresh={load} />}
                {tab === "customers" && <CustomersTab data={data} />}
                {tab === "menu" && <MenuTab token={token} data={data} refresh={load} />}
                {tab === "scanner" && <MenuScanner token={token} data={data} refresh={load} />}
                {tab === "frontend" && <FrontendTab token={token} data={data} refresh={load} />} {/* محتوى القسم الجديد */}
                {tab === "ops" && <OpsTab token={token} data={data} refresh={load} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
