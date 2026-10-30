"use client";

import Link from "next/link";
import { Flame, Plus } from "lucide-react";
import { useApp } from "@/store/app-store";

interface BestSellersProps {
  categories?: any[];
  items?: any[];
  data?: any[];
}

export default function BestSellers({ categories = [], items = [], data = [] }: BestSellersProps) {
  // تفادي أي تعارض في أسماء دوال الـ Store ومنع أخطاء TypeScript نهائياً
  const app = useApp() as any;
  const addToCart = app?.addToCart || app?.addItem || (() => {});
  const setCartOpen = app?.setCartOpen || app?.openCart || (() => {});

  // جمع كافة الأصناف بأمان تام
  const safeCats = Array.isArray(categories) ? categories : [];
  const safeItems = Array.isArray(items) && items.length > 0
    ? items
    : Array.isArray(data) && data.length > 0
    ? data
    : safeCats.flatMap((c) => (Array.isArray(c?.items) ? c.items : []));

  const displayItems = safeItems.slice(0, 4);

  if (displayItems.length === 0) {
    return null;
  }

  const handleAdd = (item: any) => {
    try {
      addToCart({
        id: String(item.id),
        nameAr: item.nameAr || item.name || "وجبة بروست",
        nameEn: item.nameEn || item.nameAr || "Broast Meal",
        price: Number(item.price || 0),
        imageUrl: item.imageUrl || item.image || "",
      });
      setCartOpen(true);
    } catch (e) {
      console.error("Cart error:", e);
    }
  };

  return (
    <section className="py-14 bg-carbon-950 text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-black text-brand-400">
              <Flame className="size-3.5 text-brand-500 animate-pulse" />
              <span>الأكثر طلباً ومبيعاً في دسوق</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black mt-2 tracking-tight">
              اختيارات الأسود المفضلة 🦁
            </h2>
          </div>

          <Link
            href="/menu"
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
          >
            <span>عرض كل المنيو</span>
            <span>←</span>
          </Link>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems.map((item, idx) => {
            const name = item.nameAr || item.name || "وجبة بروست";
            const desc = item.descriptionAr || item.description || "";
            const price = Number(item.price || 0);
            const img = item.imageUrl || item.image || "";

            return (
              <div
                key={item.id || idx}
                className="group relative rounded-3xl border border-white/10 bg-carbon-900/50 p-5 flex flex-col justify-between transition hover:border-brand-500/50 hover:bg-carbon-900/80 shadow-xl backdrop-blur-md"
              >
                <div>
                  {/* Image / Mascot */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-carbon-950 border border-white/5 flex items-center justify-center">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-6xl select-none">🍗</span>
                    )}

                    {item.badge && (
                      <span className="absolute top-3 right-3 rounded-full bg-brand-500 px-3 py-1 text-[10px] font-black text-white shadow-md">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="mt-4">
                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition">
                      {name}
                    </h3>
                    {desc && (
                      <p className="mt-1 text-xs text-white/60 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price & Action Button */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-black text-amber-400">{price}</span>
                    <span className="text-xs font-bold text-white/60 mr-1">ج.م</span>
                  </div>

                  <button
                    onClick={() => handleAdd(item)}
                    className="flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-95 px-4 py-2 text-xs font-black text-white transition shadow-lg cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>أضف للطلب</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
