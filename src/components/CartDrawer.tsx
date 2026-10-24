"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bike,
  CheckCircle2,
  Flame,
  Loader2,
  MapPin,
  Minus,
  PencilLine,
  Phone,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { cartSubtotal, useApp } from "@/store/app-store";
import { useDict, useIsAr, useLang } from "@/lib/hooks";
import { cn, money, normalizeEgyptPhone } from "@/lib/utils";
import { OUT_OF_RANGE } from "@/lib/constants";
import { checkoutWhatsAppLink } from "@/lib/whatsapp";
import { createOrderAction } from "@/app/actions";
import type { ZoneDTO } from "@/lib/types";
import type { OrderLine } from "@/db/schema";
import ItemImage from "@/components/ItemImage";

interface Placed {
  orderNumber: string;
  waUrl: string;
  total: number;
}

export default function CartDrawer({ zones }: { zones: ZoneDTO[] }) {
  const open = useApp((s) => s.cartOpen);
  const setOpen = useApp((s) => s.setCartOpen);
  const cart = useApp((s) => s.cart);
  const setQty = useApp((s) => s.setQty);
  const removeItem = useApp((s) => s.removeItem);
  const clearCart = useApp((s) => s.clearCart);
  const customer = useApp((s) => s.customer);
  const openOnboarding = useApp((s) => s.openOnboarding);
  const pushRecentOrder = useApp((s) => s.pushRecentOrder);
  const pushToast = useApp((s) => s.pushToast);
  const setTrackerOpen = useApp((s) => s.setTrackerOpen);
  const t = useDict();
  const isAr = useIsAr();
  const lang = useLang();

  const [zoneSel, setZoneSel] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  useEffect(() => {
    if (open) setZoneSel((z) => z || customer?.zoneId || zones[0]?.id || "");
  }, [open, customer, zones]);

  const subtotal = cartSubtotal(cart);
  const isOut = zoneSel === OUT_OF_RANGE;
  const zone = useMemo(() => zones.find((z) => z.id === zoneSel) ?? null, [zones, zoneSel]);
  const fee = isOut ? null : (zone?.price ?? 0);
  const total = Math.round((subtotal + (fee ?? 0)) * 100) / 100;

  const checkout = async () => {
    if (!customer) {
      setOpen(false);
      openOnboarding("cart");
      pushToast({ title: t.cart.needProfile, desc: t.cart.needProfileSub, tone: "warn" });
      return;
    }
    if (!cart.length || placing) return;
    setPlacing(true);
    try {
      const res = await createOrderAction({
        customer: {
          name: customer.name,
          primaryPhone: normalizeEgyptPhone(customer.primaryPhone),
          secondaryPhone: customer.secondaryPhone ? normalizeEgyptPhone(customer.secondaryPhone) : undefined,
          street: customer.street,
          building: customer.building || undefined,
          flat: customer.flat || undefined,
          landmark: customer.landmark || undefined,
          zoneId: zoneSel,
        },
        outOfRange: isOut,
        notes: notes.trim() || undefined,
        items: cart.map((c) => ({ id: c.id, qty: c.qty, sizeId: c.sizeId ?? null, flavor: c.flavor ?? null })),
      });
      if (!res.ok) {
        pushToast({ title: t.misc.loading, desc: String(res.error), tone: "warn" });
        return;
      }

      const lines: OrderLine[] = res.lines;
      const zoneName = isOut ? (isAr ? "منطقة أخرى / خارج النطاق" : "Other area / out of range") : isAr ? (zone?.nameAr ?? "") : (zone?.nameEn ?? "");
      const waUrl = checkoutWhatsAppLink({
        orderNumber: res.orderNumber,
        customerName: customer.name,
        primaryPhone: normalizeEgyptPhone(customer.primaryPhone),
        secondaryPhone: customer.secondaryPhone ? normalizeEgyptPhone(customer.secondaryPhone) : null,
        address: res.address,
        mapsUrl: res.mapsUrl,
        zoneName,
        outOfRange: isOut,
        items: lines,
        subtotal: res.subtotal,
        deliveryFee: res.deliveryFee,
        total: res.total,
        notes: notes.trim() || null,
      });

      pushRecentOrder({ orderNumber: res.orderNumber, total: res.total, createdAt: new Date().toISOString(), zone: zoneName });
      clearCart();
      setPlaced({ orderNumber: res.orderNumber, waUrl, total: res.total });
      setOpen(false);
      window.open(waUrl, "_blank", "noopener");
    } catch {
      pushToast({ title: "Error", desc: "network", tone: "warn" });
    } finally {
      setPlacing(false);
    }
  };

  const row = "flex items-center justify-between text-sm";

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[84]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="close" onClick={() => setOpen(false)} className="absolute inset-0 bg-carbon-950/70 backdrop-blur-sm" />
            <motion.aside
              initial={{ x: isAr ? -420 : 420, opacity: 0.4 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isAr ? -420 : 420, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="absolute bottom-0 top-0 flex w-full max-w-md flex-col bg-surface shadow-2xl ltr:right-0 rtl:left-0"
            >
              {/* header */}
              <div className="flex items-center justify-between border-b border-line p-5">
                <h2 className="flex items-center gap-2 text-xl font-extrabold">
                  <ShoppingBag className="size-5 text-brand-500" /> {t.cart.title}
                  <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs font-extrabold text-brand-500">{cart.length}</span>
                </h2>
                <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-full bg-surface-2 text-ink-2 transition hover:rotate-90" aria-label={t.misc.close}>
                  <X className="size-4.5" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                {cart.length === 0 ? (
                  <div className="grid place-items-center gap-3 py-14 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/img/mascot-lion.png" alt="mascot" className="size-24 rounded-3xl object-cover opacity-90" />
                    <p className="text-lg font-extrabold">{t.cart.empty}</p>
                    <p className="text-sm text-ink-2">{t.cart.emptySub}</p>
                    <a href="/menu" onClick={() => setOpen(false)} className="rounded-full bg-brand-500 px-6 py-3 text-sm font-extrabold text-white glow-brand">
                      {t.cart.browse}
                    </a>
                  </div>
                ) : (
                  <>
                    {/* items */}
                    <div className="space-y-3">
                      {cart.map((c) => (
                        <motion.div key={c.key} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 rounded-2xl border border-line bg-surface-2/60 p-3">
                          <div className="size-16 shrink-0 overflow-hidden rounded-xl">
                            <ItemImage id={c.id} src={c.image} alt={isAr ? c.nameAr : c.nameEn} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-extrabold">{isAr ? c.nameAr : c.nameEn}</p>
                              <button onClick={() => removeItem(c.key)} className="text-ink-2 transition hover:text-red-500" aria-label="remove">
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {c.sizeLabel && (
                                <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-ink-2">
                                  {c.sizeLabel.split(" / ")[isAr ? 0 : 1]}
                                </span>
                              )}
                              {c.flavor && (
                                <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold", c.flavor === "spicy" ? "bg-brand-500/15 text-brand-500" : "bg-emerald-500/10 text-emerald-500")}>
                                  {c.flavor === "spicy" && <Flame className="size-3" />}
                                  {c.flavor === "spicy" ? t.cart.spicy : t.cart.original}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-1.5 py-1">
                                <button onClick={() => setQty(c.key, c.qty - 1)} className="grid size-6 place-items-center rounded-full hover:bg-surface-2" aria-label="minus">
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="w-4 text-center text-xs font-extrabold">{c.qty}</span>
                                <button onClick={() => setQty(c.key, c.qty + 1)} className="grid size-6 place-items-center rounded-full hover:bg-surface-2" aria-label="plus">
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                              <span className="text-sm font-extrabold text-brand-500">{money(c.unitPrice * c.qty, lang)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button onClick={clearCart} className="mx-auto flex items-center gap-1.5 text-xs font-bold text-ink-2 transition hover:text-red-500">
                      <Trash2 className="size-3.5" /> {t.cart.clear}
                    </button>

                    {/* customer */}
                    <div className="rounded-2xl border border-line p-4">
                      {customer ? (
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-2 font-extrabold">
                              <User className="size-4 text-brand-500" /> {customer.name}
                            </p>
                            <p className="flex items-center gap-2 text-xs text-ink-2" dir="ltr">
                              <Phone className="size-3.5" /> {customer.primaryPhone}
                              {customer.secondaryPhone && ` / ${customer.secondaryPhone}`}
                            </p>
                            <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-2">
                              <MapPin className="mt-0.5 size-3.5 shrink-0" />
                              {[customer.street, customer.building, customer.flat, customer.landmark].filter(Boolean).join("، ")}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setOpen(false);
                              openOnboarding("edit");
                            }}
                            className="grid size-9 place-items-center rounded-full border border-line text-ink-2 transition hover:border-brand-500 hover:text-brand-500"
                            aria-label={t.onboarding.edit}
                          >
                            <PencilLine className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setOpen(false);
                            openOnboarding("cart");
                          }}
                          className="w-full rounded-xl border border-dashed border-brand-500/60 bg-brand-500/5 px-4 py-3 text-sm font-bold text-brand-500"
                        >
                          {t.cart.needProfile}
                        </button>
                      )}
                    </div>

                    {/* zone */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-2">
                        <Bike className="size-4 text-brand-500" /> {t.onboarding.zone}
                      </label>
                      <select
                        value={zoneSel}
                        onChange={(e) => setZoneSel(e.target.value)}
                        className="w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm font-semibold outline-none focus:border-brand-500"
                      >
                        {zones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {isAr ? z.nameAr : z.nameEn} — {money(z.price, lang)}
                          </option>
                        ))}
                        <option value={OUT_OF_RANGE}>{t.zones.other}</option>
                      </select>
                      {isOut && (
                        <p className="mt-2 rounded-xl border border-cheese-400/40 bg-cheese-400/10 px-3 py-2.5 text-[11px] font-semibold leading-relaxed text-cheese-400">
                          {t.cart.outRangeNote}
                        </p>
                      )}
                    </div>

                    {/* notes */}
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      placeholder={t.cart.notesPh}
                      className="w-full resize-none rounded-2xl border border-line bg-surface-2 px-4 py-3 text-sm outline-none placeholder:text-ink-2/60 focus:border-brand-500"
                    />
                  </>
                )}
              </div>

              {/* totals + checkout */}
              {cart.length > 0 && (
                <div className="space-y-3 border-t border-line bg-surface p-5">
                  <div className={row}>
                    <span className="text-ink-2">{t.cart.subtotal}</span>
                    <span className="font-extrabold">{money(subtotal, lang)}</span>
                  </div>
                  <div className={row}>
                    <span className="text-ink-2">{t.cart.delivery}</span>
                    <span className="font-extrabold">{fee === null ? t.zones.otherFee : fee === 0 ? (isAr ? "مجاني" : "Free") : money(fee, lang)}</span>
                  </div>
                  <div className="dash-line" />
                  <div className={`${row} text-lg`}>
                    <span className="font-extrabold">{t.cart.total}</span>
                    <span className="font-extrabold text-brand-500">
                      {money(total, lang)}
                      {isOut && <span className="block text-end text-[10px] font-semibold text-ink-2">+ {t.cart.delivery}</span>}
                    </span>
                  </div>
                  <button
                    onClick={checkout}
                    disabled={placing}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-base font-extrabold text-white shadow-[0_12px_36px_-10px_rgba(37,211,102,0.6)] transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                  >
                    {placing ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5 rtl:-scale-x-100" />}
                    {customer ? t.cart.checkout : t.cart.needProfile}
                  </button>
                  <p className="text-center text-[11px] text-ink-2">{t.cart.checkoutSub}</p>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success modal with mascot */}
      <AnimatePresence>
        {placed && (
          <motion.div className="fixed inset-0 z-[89] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="close" onClick={() => setPlaced(null)} className="absolute inset-0 bg-carbon-950/80 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-line bg-surface p-7 text-center shadow-2xl"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 flame-badge" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/mascot-lion.png" alt="mascot" className="mx-auto size-24 animate-float rounded-3xl object-cover ring-4 ring-emerald-500/50" />
              <div className="mt-4 flex items-center justify-center gap-2">
                <CheckCircle2 className="size-6 text-emerald-500" />
                <h3 className="text-2xl font-extrabold">{t.success.title}</h3>
              </div>
              <p className="mt-2 rounded-full bg-surface-2 px-4 py-1.5 font-mono text-sm font-extrabold tracking-wider text-brand-500" dir="ltr">
                {placed.orderNumber}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-2">{t.success.sub}</p>
              <div className="mt-5 space-y-2">
                <a
                  href={placed.waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-extrabold text-white transition hover:scale-[1.01]"
                >
                  <Send className="size-4.5 rtl:-scale-x-100" /> {t.success.wa}
                </a>
                <button
                  onClick={() => {
                    setPlaced(null);
                    setTrackerOpen(true);
                  }}
                  className="w-full rounded-2xl border border-brand-500/50 py-3.5 text-sm font-extrabold text-brand-500 transition hover:bg-brand-500/10"
                >
                  {t.success.track}
                </button>
                <button onClick={() => setPlaced(null)} className="w-full rounded-2xl bg-surface-2 py-3 text-sm font-bold text-ink-2">
                  {t.success.done}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
