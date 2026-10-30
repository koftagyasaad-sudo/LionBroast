"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Flame, Sparkles } from "lucide-react";
import { useApp } from "@/store/app-store";

interface ItemDialogProps {
  item?: any;
  open?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ItemDialog(props: ItemDialogProps) {
  const app = useApp() as any;

  const item = props.item || app.dialogItem || app.selectedItem || null;
  const isOpen = props.open ?? props.isOpen ?? Boolean(item && (app.isDialogOpen ?? true));
  const handleClose = props.onClose || app.closeDialog || (() => {});
  const addToCart = app.addToCart || app.addItem || (() => {});
  const setCartOpen = app.setCartOpen || app.openCart || (() => {});

  const [flavor, setFlavor] = useState<"original" | "spicy">("original");
  const [sizeId, setSizeId] = useState<string | number | null>(null);
  const [qty, setQty] = useState(1);

  // استخدام الاختيار الآمن لمنع خطأ 'item.sizes is possibly undefined' نهائياً
  useEffect(() => {
    if (item) {
      setFlavor("original");
      setSizeId(item.sizes?.[0]?.id ?? null);
      setQty(1);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const safeSizes: any[] = Array.isArray(item.sizes) ? item.sizes : [];
  const selectedSize = safeSizes.find((s) => String(s.id) === String(sizeId)) || safeSizes[0];
  const basePrice = Number(selectedSize?.price ?? item.price ?? 0);
  const totalPrice = basePrice * qty;

  const handleAddToCart = () => {
    addToCart({
      id: String(item.id) + (selectedSize ? `-${selectedSize.id}` : "") + `-${flavor}`,
      itemId: String(item.id),
      nameAr: item.nameAr || item.name || "وجبة بروست",
      nameEn: item.nameEn || item.nameAr || "Broast Meal",
      price: basePrice,
      flavor,
      sizeName: selectedSize?.nameAr || selectedSize?.name,
      quantity: qty,
      imageUrl: item.imageUrl || item.image || "",
    });
    handleClose();
    setCartOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", damping: 25, stiffness: 260 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-carbon-900 text-white shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header Image */}
          <div className="relative h-48 w-full bg-carbon-950 flex items-center justify-center border-b border-white/10 overflow-hidden">
            {item.imageUrl || item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl || item.image}
                alt={item.nameAr || item.name}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-6xl select-none">🍗</span>
            )}
            <button
              onClick={handleClose}
              className="absolute top-4 left-4 grid size-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Details & Options */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-black text-white">{item.nameAr || item.name}</h3>
                <span className="text-xl font-black text-amber-400">{basePrice} ج.م</span>
              </div>
              {item.descriptionAr && (
                <p className="mt-2 text-xs text-white/60 leading-relaxed">{item.descriptionAr}</p>
              )}
            </div>

            {/* Flavor Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/70 block">اختر النكهة:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFlavor("original")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-black transition cursor-pointer ${
                    flavor === "original"
                      ? "border-brand-500 bg-brand-500/20 text-brand-400 shadow-md"
                      : "border-white/10 bg-carbon-950 text-white/70 hover:border-white/20"
                  }`}
                >
                  <Sparkles className="size-4" />
                  <span>عادي (أصلي)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlavor("spicy")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-black transition cursor-pointer ${
                    flavor === "spicy"
                      ? "border-red-500 bg-red-500/20 text-red-400 shadow-md"
                      : "border-white/10 bg-carbon-950 text-white/70 hover:border-white/20"
                  }`}
                >
                  <Flame className="size-4 text-red-500" />
                  <span>حار (سبايسي 🌶️)</span>
                </button>
              </div>
            </div>

            {/* Sizes Selection */}
            {safeSizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 block">اختر الحجم:</label>
                <div className="grid grid-cols-2 gap-3">
                  {safeSizes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSizeId(s.id)}
                      className={`flex items-center justify-between rounded-2xl border p-3 text-xs font-bold transition cursor-pointer ${
                        String(s.id) === String(sizeId)
                          ? "border-amber-500 bg-amber-500/20 text-amber-300 shadow-md"
                          : "border-white/10 bg-carbon-950 text-white/70 hover:border-white/20"
                      }`}
                    >
                      <span>{s.nameAr || s.name}</span>
                      <span className="font-black text-amber-400">{s.price} ج.م</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-white/80">الكمية:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid size-9 place-items-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-base font-black text-white">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="grid size-9 place-items-center rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition cursor-pointer shadow-md"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="p-6 border-t border-white/10 bg-carbon-950/50 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-white/50 block font-bold">السعر الإجمالي:</span>
              <span className="text-2xl font-black text-amber-400">{totalPrice} <span className="text-xs">ج.م</span></span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 active:scale-95 px-8 py-3.5 text-sm font-black text-white shadow-xl glow-brand transition cursor-pointer"
            >
              <ShoppingBag className="size-4" />
              <span>أضف للطلب</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
