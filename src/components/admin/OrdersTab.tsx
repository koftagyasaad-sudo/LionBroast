"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, FileSpreadsheet, FileText, MapPin, Search, Send } from "lucide-react";
import type { TabProps } from "@/components/admin/AdminShell";
import { adminSetOrderStatusAction } from "@/app/admin-actions";
import { exportOrdersPdf, exportOrdersXlsx } from "@/lib/exporters";
import { buildWhatsAppMessage } from "@/lib/whatsapp";
import { waLink } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"] as const;

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-sky-500/15 text-sky-400 border-sky-500/40",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",
  PREPARING: "bg-brand-500/15 text-brand-400 border-brand-500/40",
  ON_THE_WAY: "bg-cheese-400/15 text-cheese-300 border-cheese-400/40",
  DELIVERED: "bg-emerald-600/15 text-emerald-500 border-emerald-600/40",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/40",
};

export default function OrdersTab({ token, data, refresh }: TabProps) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!query) return true;
      return [o.orderNumber, o.customerName, o.primaryPhone, o.deliveryZone].some((s) => s.toLowerCase().includes(query));
    });
  }, [data.orders, q, status]);

  const changeStatus = async (id: string, next: string) => {
    await adminSetOrderStatusAction(token, id, next);
    await refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">الطلبات · Orders Archive</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportOrdersXlsx(rows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-xs font-extrabold text-emerald-400 transition hover:bg-emerald-500/25"
          >
            <FileSpreadsheet className="size-4" /> Excel
          </button>
          <button
            onClick={() => exportOrdersPdf(rows)}
            className="flex items-center gap-1.5 rounded-xl bg-red-500/15 px-4 py-2.5 text-xs font-extrabold text-red-400 transition hover:bg-red-500/25"
          >
            <FileText className="size-4" /> PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث برقم الطلب / الاسم / الموبايل..."
            className="w-full rounded-2xl border border-white/10 bg-carbon-900 py-3 ps-11 pe-4 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-500"
          />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-extrabold transition ${
                status === s ? "bg-brand-500 text-white" : "bg-white/5 text-white/50 hover:text-white"
              }`}
            >
              {s === "ALL" ? "الكل" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-carbon-900">
        <div className="divide-y divide-white/5">
          {rows.map((o) => {
            const open = openId === o.id;
            return (
              <div key={o.id}>
                <button onClick={() => setOpenId(open ? null : o.id)} className="flex w-full flex-wrap items-center gap-3 px-4 py-3.5 text-start transition hover:bg-white/[0.03]">
                  <span className="font-mono text-xs font-extrabold text-cheese-300" dir="ltr">{o.orderNumber}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{o.customerName}</span>
                    <span className="block text-[10px] text-white/45" dir="ltr">{o.primaryPhone}</span>
                  </span>
                  <span className="hidden text-xs font-semibold text-white/50 sm:block">{o.deliveryZone}</span>
                  <span className="text-sm font-extrabold text-brand-400" dir="ltr">{o.total} EGP</span>
                  <select
                    value={o.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                    className={`cursor-pointer rounded-full border px-2.5 py-1 text-[10px] font-extrabold outline-none ${STATUS_STYLE[o.status]}`}
                  >
                    {STATUSES.filter((s) => s !== "ALL").map((s) => (
                      <option key={s} value={s} className="bg-carbon-900">{s}</option>
                    ))}
                  </select>
                  <ChevronDown className={`size-4 text-white/40 transition ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 border-t border-white/5 bg-carbon-950/60 px-4 py-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-white/40">Items</p>
                        <ul className="space-y-1.5 text-xs">
                          {o.items.map((it, i) => (
                            <li key={i} className="flex justify-between gap-3">
                              <span>
                                {it.nameAr} <span className="text-white/40">× {it.qty}</span>
                                {it.flavor && <span className="ms-1.5 rounded bg-brand-500/20 px-1.5 py-0.5 text-[9px] font-bold text-brand-300">{it.flavor === "spicy" ? "حار" : "أصلي"}</span>}
                                {it.sizeLabel && <span className="ms-1.5 text-[10px] text-white/45">{it.sizeLabel.split(" / ")[0]}</span>}
                              </span>
                              <span className="font-bold" dir="ltr">{it.unitPrice * it.qty}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 space-y-1 border-t border-white/10 pt-2 text-[11px] font-bold text-white/60">
                          <p className="flex justify-between"><span>Subtotal</span><span dir="ltr">{o.subtotal} EGP</span></p>
                          <p className="flex justify-between"><span>Delivery</span><span dir="ltr">{o.deliveryFee} EGP</span></p>
                          <p className="flex justify-between text-brand-400"><span>Total</span><span dir="ltr">{o.total} EGP</span></p>
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4 text-xs leading-relaxed">
                        <p className="mb-2 text-[10px] font-extrabold uppercase tracking-widest text-white/40">Delivery</p>
                        <p className="flex items-start gap-2"><MapPin className="mt-0.5 size-3.5 shrink-0 text-brand-400" /> {o.address}</p>
                        {o.secondaryPhone && <p className="mt-1 text-white/50" dir="ltr">Alt: {o.secondaryPhone}</p>}
                        {o.notes && <p className="mt-2 rounded-lg bg-cheese-400/10 px-2.5 py-1.5 text-cheese-300">ملاحظات: {o.notes}</p>}
                        <a
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/15 px-3.5 py-2 text-[11px] font-extrabold text-[#25D366] transition hover:bg-[#25D366]/25"
                          href={waLink(
                            WHATSAPP_NUMBER,
                            buildWhatsAppMessage({
                              orderNumber: o.orderNumber,
                              customerName: o.customerName,
                              primaryPhone: o.primaryPhone,
                              secondaryPhone: o.secondaryPhone,
                              address: o.address,
                              mapsUrl: o.mapsLink ?? "",
                              zoneName: o.deliveryZone,
                              outOfRange: o.deliveryFee === 0 && o.deliveryZone.includes("أخرى"),
                              items: o.items,
                              subtotal: o.subtotal,
                              deliveryFee: o.deliveryFee,
                              total: o.total,
                              notes: o.notes,
                            }),
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Send className="size-3.5 rtl:-scale-x-100" /> Resend to WhatsApp
                        </a>
                      </div>
                    </div>
                    <p className="text-[10px] text-white/35" dir="ltr">
                      Created: {o.createdAt.replace("T", " ").slice(0, 16)} · Updated: {o.updatedAt.replace("T", " ").slice(0, 16)}
                    </p>
                  </motion.div>
                )}
              </div>
            );
          })}
          {rows.length === 0 && <p className="px-4 py-12 text-center text-sm text-white/40">مفيش طلبات مطابقة — No matching orders.</p>}
        </div>
      </div>

      <p className="text-[11px] text-white/35">{rows.length} orders shown · exports respect the current filter.</p>
    </div>
  );
}
