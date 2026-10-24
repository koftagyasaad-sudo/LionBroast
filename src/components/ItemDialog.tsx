"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Leaf, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useDict, useIsAr, useLang } from "@/lib/hooks";
import { money } from "@/lib/utils";
import ItemImage from "@/components/ItemImage";

/** Quick-add drawer: pick marinade (Original/Spicy), size variant, quantity. */
export default function ItemDialog() {
  const item = useApp((s) => s.dialogItem);
  const closeItemDialog = useApp((s) => s.closeItemDialog);
  const addItem = useApp((s) => s.addItem);
  const pushToast = useApp((s) => s.pushToast);
  const t = useDict();
  const isAr = useIsAr();
  const lang = useLang();

  const [flavor, setFlavor] = useState<"original" | "spicy">("original");
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (item) {
      setFlavor("original");
      setSizeId(item.sizes[0]?.id ?? null);
      setQty(1);
    }
  }, [item]);

  const open = !!item;
  const activeSize = item?.sizes.find((s) => s.id === sizeId) ?? null;
  const unit = item ? (activeSize?.price ?? item.price) : 0;

  const confirm = () => {
    if (!item) return;
    addItem(
      {
        key: `${item.id}|${sizeId ?? ""}|${item.spicyOption ? flavor : ""}`,
        id: item.id,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        image: item.image,
        unitPrice: unit,
        flavor: item.spicyOption ? flavor : null,
        sizeId,
        sizeLabel: activeSize ? `${activeSize.ar} / ${activeSize.en}` : null,
      },
      qty,
    );
    pushToast({ title: `${t.cart.added} × ${qty}`, desc: isAr ? item.nameAr : item.nameEn, tone: "ok" });
    closeItemDialog();
  };

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-[85] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button aria-label="close" onClick={closeItemDialog} className="absolute inset-0 bg-carbon-950/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-line bg-surface shadow-2xl"
          >
            <div className="relative h-48">
              <ItemImage id={item.id} src={item.image} alt={isAr ? item.nameAr : item.nameEn} />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              <button
                onClick={closeItemDialog}
                className="absolute end-4 top-4 grid size-9 place-items-center rounded-full bg-carbon-950/60 text-white backdrop-blur transition hover:scale-110"
                aria-label="close"
              >
                <X className="size-4.5" />
              </button>
              {item.isBestSeller && (
                <span className="flame-badge absolute start-4 top-4 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold text-white">
                  <Flame className="size-3.5" /> {t.misc.bestSeller}
                </span>
              )}
            </div>

            <div className="-mt-6 relative space-y-5 p-5">
              <div>
                <h3 className="text-xl font-extrabold">{isAr ? item.nameAr : item.nameEn}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{isAr ? item.descriptionAr : item.descriptionEn}</p>
              </div>

              {item.spicyOption && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-2">{t.cart.flavor}</p>
                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-line bg-surface-2 p-1.5">
                    <button
                      onClick={() => setFlavor("original")}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${
                        flavor === "original" ? "bg-surface text-ink shadow" : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      <Leaf className="size-4 text-emerald-500" /> {t.cart.original}
                    </button>
                    <button
                      onClick={() => setFlavor("spicy")}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition ${
                        flavor === "spicy" ? "flame-badge text-white shadow" : "text-ink-2 hover:text-ink"
                      }`}
                    >
                      <Flame className="size-4" /> {t.cart.spicy}
                    </button>
                  </div>
                </div>
              )}

              {item.sizes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-2">{t.cart.size}</p>
                  <div className="space-y-2">
                    {item.sizes.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSizeId(s.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                          sizeId === s.id ? "border-brand-500 bg-brand-500/10 text-ink" : "border-line text-ink-2 hover:border-brand-500/50"
                        }`}
                      >
                        <span>{isAr ? s.ar : s.en}</span>
                        <span className="text-brand-500">{money(s.price, lang)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 rounded-full border border-line bg-surface-2 px-2 py-1.5">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid size-8 place-items-center rounded-full bg-surface transition hover:scale-105"
                    aria-label="minus"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-6 text-center text-base font-extrabold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(30, q + 1))}
                    className="grid size-8 place-items-center rounded-full bg-surface transition hover:scale-105"
                    aria-label="plus"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <button
                  onClick={confirm}
                  className="glow-brand flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 py-3.5 text-sm font-extrabold text-white transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ShoppingBag className="size-4.5" />
                  {t.cart.add} — {money(unit * qty, lang)}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
