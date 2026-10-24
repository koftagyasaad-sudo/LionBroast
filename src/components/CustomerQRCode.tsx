"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Copy, Crown, Download, PencilLine, QrCode, ScanLine, Share2, ShoppingBag, Wallet, X } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { useApp } from "@/store/app-store";
import { useDict, useIsAr, useLang, useMounted } from "@/lib/hooks";
import { money } from "@/lib/utils";
import { passStatsAction } from "@/app/actions";

interface Stats {
  ordersCount: number;
  ltv: number;
  memberSince: string;
  recent: { orderNumber: string; status: string; total: number; createdAt: string }[];
}

/** "My Lion Pass" — the customer identity drawer with scannable QR. */
export default function LionPassDrawer() {
  const open = useApp((s) => s.passOpen);
  const setOpen = useApp((s) => s.setPassOpen);
  const customer = useApp((s) => s.customer);
  const code = useApp((s) => s.customerCode);
  const openOnboarding = useApp((s) => s.openOnboarding);
  const pushToast = useApp((s) => s.pushToast);
  const t = useDict();
  const isAr = useIsAr();
  const lang = useLang();
  const mounted = useMounted();

  const [stats, setStats] = useState<Stats | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const passUrl = mounted && code ? `${window.location.origin}/pass/${code}` : `/pass/${code ?? ""}`;

  useEffect(() => {
    if (open && code) {
      setStats(null);
      passStatsAction(code).then((s) => s && setStats(s));
    }
  }, [open, code]);

  const downloadQr = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${code}-lion-pass.png`;
    a.click();
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Lion Pass — Broast El-Assad", text: `${t.pass.code}: ${code}`, url: passUrl });
      } else {
        await navigator.clipboard.writeText(passUrl);
        pushToast({ title: t.pass.share, desc: code ?? "", tone: "ok" });
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <AnimatePresence>
      {open && customer && (
        <motion.div className="fixed inset-0 z-[86]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="close" onClick={() => setOpen(false)} className="absolute inset-0 bg-carbon-950/70 backdrop-blur-sm" />
          <motion.aside
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="absolute inset-x-0 bottom-0 mx-auto max-h-[94svh] w-full max-w-md overflow-y-auto rounded-t-[32px] border border-cheese-400/30 bg-surface sm:inset-x-auto sm:end-6 sm:top-6 sm:bottom-6 sm:rounded-[32px]"
          >
            {/* Golden pass card */}
            <div className="golden-card relative overflow-hidden p-6 pb-8 text-white">
              <div className="absolute -end-10 -top-10 size-40 rounded-full bg-cheese-400/20 blur-2xl" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img/mascot-lion.png" alt="mascot" className="size-14 rounded-2xl object-cover ring-2 ring-cheese-400/70" />
                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-cheese-300">
                      <Crown className="size-3.5" /> Lion Pass
                    </p>
                    <h2 className="text-xl font-extrabold">{t.pass.title}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition hover:rotate-90"
                  aria-label={t.misc.close}
                >
                  <X className="size-4.5" />
                </button>
              </div>

              <div className="mt-6 grid place-items-center">
                <div className="rounded-3xl border-4 border-cheese-400/60 bg-white p-4 shadow-2xl">
                  <QRCodeSVG value={passUrl} size={168} fgColor="#0F1115" level="H" />
                </div>
                <div ref={canvasRef} className="hidden">
                  <QRCodeCanvas value={passUrl} size={640} fgColor="#0F1115" level="H" includeMargin />
                </div>
                <p className="mt-3 flex items-center gap-2 font-mono text-2xl font-extrabold tracking-[0.25em] text-cheese-300" dir="ltr">
                  {code}
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(code ?? "");
                      pushToast({ title: t.pass.code, desc: code ?? "", tone: "ok" });
                    }}
                    aria-label="copy code"
                    className="text-white/70 transition hover:text-white"
                  >
                    <Copy className="size-4" />
                  </button>
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/15 bg-carbon-950/50 px-4 py-3">
                <div>
                  <p className="text-base font-extrabold">{customer.name}</p>
                  <p className="text-xs text-white/60" dir="ltr">
                    {customer.primaryPhone}
                    {customer.secondaryPhone ? ` · ${customer.secondaryPhone}` : ""}
                  </p>
                </div>
                <ScanLine className="size-6 text-cheese-400" />
              </div>

              <p className="mt-4 text-center text-xs leading-relaxed text-white/60">{t.pass.scanHint}</p>
            </div>

            {/* Stats & recent orders */}
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-line bg-surface-2 p-3 text-center">
                  <ShoppingBag className="mx-auto size-4 text-brand-500" />
                  <p className="mt-1 text-lg font-extrabold">{stats?.ordersCount ?? "—"}</p>
                  <p className="text-[10px] font-semibold text-ink-2">{t.pass.orders}</p>
                </div>
                <div className="rounded-2xl border border-line bg-surface-2 p-3 text-center">
                  <Wallet className="mx-auto size-4 text-emerald-500" />
                  <p className="mt-1 text-lg font-extrabold">{stats ? money(stats.ltv, lang) : "—"}</p>
                  <p className="text-[10px] font-semibold text-ink-2">{t.pass.spent}</p>
                </div>
                <div className="rounded-2xl border border-line bg-surface-2 p-3 text-center">
                  <CalendarDays className="mx-auto size-4 text-cheese-400" />
                  <p className="mt-1 text-sm font-extrabold">
                    {stats ? new Date(stats.memberSince).toLocaleDateString(isAr ? "ar-EG" : "en-GB", { month: "short", year: "numeric" }) : "—"}
                  </p>
                  <p className="text-[10px] font-semibold text-ink-2">{t.pass.member}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={downloadQr}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-3 text-xs font-extrabold transition hover:border-cheese-400/60"
                >
                  <Download className="size-4" /> {t.pass.download}
                </button>
                <button
                  onClick={share}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-surface-2 py-3 text-xs font-extrabold transition hover:border-cheese-400/60"
                >
                  <Share2 className="size-4" /> {t.pass.share}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    openOnboarding("edit");
                  }}
                  className="grid w-12 place-items-center rounded-2xl border border-line bg-surface-2 transition hover:border-brand-500/60"
                  aria-label={t.onboarding.edit}
                >
                  <PencilLine className="size-4" />
                </button>
              </div>

              {stats && stats.recent.length === 0 && (
                <p className="rounded-2xl border border-dashed border-line p-4 text-center text-xs text-ink-2">{t.pass.noOrders}</p>
              )}

              {stats?.recent.map((o) => (
                <div key={o.orderNumber} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3">
                  <div>
                    <p className="font-mono text-xs font-bold" dir="ltr">
                      {o.orderNumber}
                    </p>
                    <p className="text-[11px] text-ink-2">
                      {t.tracker.statuses[o.status] ?? o.status} · {new Date(o.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-GB")}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-brand-500">{money(o.total, lang)}</span>
                </div>
              ))}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Standalone QR block (used inside the pass page / admin previews). */
export function CustomerQrBadge({ code }: { code: string }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  return (
    <div className="rounded-2xl bg-white p-3">
      <QRCodeSVG value={`${origin}/pass/${code}`} size={160} fgColor="#0F1115" level="H" />
    </div>
  );
}
