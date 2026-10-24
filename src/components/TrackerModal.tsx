"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bike, CheckCircle2, ClipboardList, CookingPot, PackageCheck, RefreshCw, Wallet, X, XCircle } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useDict } from "@/lib/hooks";
import { money, timeAgo } from "@/lib/utils";
import { trackOrdersAction } from "@/app/actions";

interface Tracked {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  itemsCount: number;
  deliveryZone: string;
}

const FLOW = ["PENDING", "CONFIRMED", "PREPARING", "ON_THE_WAY", "DELIVERED"];
const STEP_ICONS = [ClipboardList, CheckCircle2, CookingPot, Bike, PackageCheck];

export default function TrackerModal() {
  const open = useApp((s) => s.trackerOpen);
  const setOpen = useApp((s) => s.setTrackerOpen);
  const recent = useApp((s) => s.recentOrders);
  const t = useDict();
  const lang = useApp((s) => s.lang);

  const [rows, setRows] = useState<Tracked[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!recent.length) {
      setRows([]);
      return;
    }
    setLoading(true);
    try {
      const data = await trackOrdersAction(recent.map((r) => r.orderNumber));
      const byNum = new Map(data.map((d) => [d.orderNumber, d]));
      setRows(
        recent.map((r) => byNum.get(r.orderNumber) ?? {
          orderNumber: r.orderNumber,
          status: "PENDING",
          total: r.total,
          createdAt: r.createdAt,
          itemsCount: 0,
          deliveryZone: r.zone,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [recent]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[87] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="close" onClick={() => setOpen(false)} className="absolute inset-0 bg-carbon-950/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-h-[86svh] w-full max-w-lg overflow-y-auto rounded-[32px] border border-line bg-surface p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-extrabold">
                  <Bike className="size-5 text-brand-500" /> {t.tracker.title}
                </h2>
                <p className="mt-1 text-xs text-ink-2">{t.tracker.sub}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={refresh}
                  className="grid size-9 place-items-center rounded-full bg-surface-2 text-ink-2 transition hover:text-brand-500"
                  aria-label="refresh"
                >
                  <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full bg-surface-2 text-ink-2 transition hover:rotate-90" aria-label={t.misc.close}>
                  <X className="size-4.5" />
                </button>
              </div>
            </div>

            {rows.length === 0 && (
              <div className="grid place-items-center gap-3 py-12 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/mascot-lion.png" alt="mascot" className="size-20 rounded-2xl object-cover opacity-90" />
                <p className="text-sm font-bold text-ink-2">{t.tracker.empty}</p>
              </div>
            )}

            <div className="space-y-4">
              {rows.map((o) => {
                const cancelled = o.status === "CANCELLED";
                const stepIdx = FLOW.indexOf(o.status);
                return (
                  <div key={o.orderNumber} className="rounded-3xl border border-line bg-surface-2/50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm font-extrabold tracking-wide" dir="ltr">
                          {o.orderNumber}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink-2">
                          {timeAgo(o.createdAt, lang)} · {o.deliveryZone}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-extrabold text-brand-500">
                        <Wallet className="size-4" /> {money(o.total, lang)}
                      </span>
                    </div>

                    {cancelled ? (
                      <p className="mt-3 flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-500">
                        <XCircle className="size-4" /> {t.tracker.statuses.CANCELLED}
                      </p>
                    ) : (
                      <div className="mt-4 flex items-center">
                        {FLOW.map((s, i) => {
                          const Icon = STEP_ICONS[i];
                          const done = i <= stepIdx;
                          const active = i === stepIdx;
                          return (
                            <div key={s} className="flex flex-1 items-center last:flex-none">
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className={`grid size-9 place-items-center rounded-full border-2 transition ${
                                    done ? "flame-badge border-transparent text-white" : "border-line bg-surface text-ink-2"
                                  } ${active ? "ring-4 ring-brand-500/25" : ""}`}
                                >
                                  <Icon className="size-4" />
                                </div>
                                <span className={`text-[9px] font-bold leading-tight sm:text-[10px] ${done ? "text-brand-500" : "text-ink-2"}`}>
                                  {t.tracker.statuses[s]}
                                </span>
                              </div>
                              {i < FLOW.length - 1 && <div className={`mx-1 h-0.5 flex-1 rounded ${i < stepIdx ? "bg-brand-500" : "bg-line"}`} />}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
