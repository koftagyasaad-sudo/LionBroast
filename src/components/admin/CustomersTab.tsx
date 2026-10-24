"use client";

import { useMemo, useState } from "react";
import { Crown, FileSpreadsheet, FileText, Phone, Search, ShoppingBag, Wallet } from "lucide-react";
import type { AdminBundle } from "@/lib/admin-types";
import { exportCustomersPdf, exportCustomersXlsx } from "@/lib/exporters";
import { waLink } from "@/lib/utils";

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export default function CustomersTab({ data }: { data: AdminBundle }) {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.customers.filter((c) =>
      !query || [c.customerCode, c.name, c.primaryPhone, c.secondaryPhone ?? ""].some((s) => s.toLowerCase().includes(query)),
    );
  }, [data.customers, q]);

  const totalLtv = rows.reduce((a, c) => a + c.ltv, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">العملاء · Customer CRM Hub</h1>
          <p className="mt-1 text-xs text-white/45">
            {fmt(rows.length)} registered lions · combined LTV <span className="font-extrabold text-emerald-400">{fmt(totalLtv)} EGP</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCustomersXlsx(rows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500/15 px-4 py-2.5 text-xs font-extrabold text-emerald-400 transition hover:bg-emerald-500/25"
          >
            <FileSpreadsheet className="size-4" /> Excel (.xlsx)
          </button>
          <button
            onClick={() => exportCustomersPdf(rows)}
            className="flex items-center gap-1.5 rounded-xl bg-red-500/15 px-4 py-2.5 text-xs font-extrabold text-red-400 transition hover:bg-red-500/25"
          >
            <FileText className="size-4" /> PDF
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالكود / الاسم / الموبايل..."
          className="w-full rounded-2xl border border-white/10 bg-carbon-900 py-3 ps-11 pe-4 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-500"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map((c) => {
          const vip = c.ltv >= 400;
          return (
            <div key={c.id} className="card-lift rounded-3xl border border-white/10 bg-carbon-900 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`grid size-11 place-items-center rounded-2xl font-extrabold ${vip ? "golden-card text-cheese-300 border border-cheese-400/40" : "bg-white/5 text-white/60"}`}>
                    {vip ? <Crown className="size-5" /> : c.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold">{c.name}</p>
                    <p className="font-mono text-[11px] font-bold tracking-wider text-cheese-300" dir="ltr">{c.customerCode}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <a
                    href={waLink(c.primaryPhone.startsWith("2") ? c.primaryPhone : `2${c.primaryPhone}`, "أهلاً! معاك بروست الأسد")}
                    target="_blank"
                    rel="noreferrer"
                    className="grid size-8 place-items-center rounded-full bg-[#25D366]/15 text-[#25D366] transition hover:scale-110"
                    aria-label="whatsapp"
                  >
                    <Phone className="size-3.5" />
                  </a>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/5 p-2.5">
                  <ShoppingBag className="mx-auto size-3.5 text-brand-400" />
                  <p className="mt-1 text-sm font-extrabold">{c.ordersCount}</p>
                  <p className="text-[9px] font-bold text-white/40">Orders</p>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5">
                  <Wallet className="mx-auto size-3.5 text-emerald-400" />
                  <p className="mt-1 text-sm font-extrabold" dir="ltr">{fmt(c.ltv)}</p>
                  <p className="text-[9px] font-bold text-white/40">LTV EGP</p>
                </div>
                <div className="rounded-xl bg-white/5 p-2.5">
                  <p className="mt-1 text-[11px] font-extrabold leading-5">{c.zone ? c.zone.nameAr : "خارج النطاق"}</p>
                  <p className="text-[9px] font-bold text-white/40">Zone</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-white/40">
                <span dir="ltr">{c.primaryPhone}{c.secondaryPhone ? ` · ${c.secondaryPhone}` : ""}</span>
                <span className="truncate">{[c.street, c.landmark].filter(Boolean).join("، ")}</span>
                <span dir="ltr">Joined {c.createdAt.slice(0, 10)}</span>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="col-span-full rounded-3xl border border-dashed border-white/10 py-16 text-center text-sm text-white/40">
            مفيش عملاء لسه — No customers yet. The first onboarding modal submission lands here.
          </p>
        )}
      </div>
    </div>
  );
}
