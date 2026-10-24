"use client";

import { Flame, Plus } from "lucide-react";
import type { MenuItemDTO } from "@/lib/types";
import { useApp } from "@/store/app-store";
import { useDict, useIsAr } from "@/lib/hooks";
import { money } from "@/lib/utils";
import ItemImage from "@/components/ItemImage";
import { cn } from "@/lib/utils";

export default function MenuItemCard({ item, rail = false }: { item: MenuItemDTO; rail?: boolean }) {
  const t = useDict();
  const isAr = useIsAr();
  const lang = useApp((s) => s.lang);
  const addItem = useApp((s) => s.addItem);
  const openItemDialog = useApp((s) => s.openItemDialog);
  const pushToast = useApp((s) => s.pushToast);

  const needsOptions = item.spicyOption || item.sizes.length > 0;
  const minPrice = item.sizes.length ? Math.min(item.price, ...item.sizes.map((s) => s.price)) : item.price;

  const onAdd = () => {
    if (needsOptions) {
      openItemDialog(item);
      return;
    }
    addItem(
      {
        key: item.id,
        id: item.id,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        image: item.image,
        unitPrice: item.price,
        flavor: null,
        sizeLabel: null,
      },
      1,
    );
    pushToast({ title: `${t.cart.added} — ${isAr ? item.nameAr : item.nameEn}`, desc: t.cart.addedSub, tone: "ok" });
  };

  return (
    <div
      className={cn(
        "group card-lift relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface",
        rail ? "w-[270px] shrink-0 snap-start" : "h-full",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ItemImage
          id={item.id}
          src={item.image}
          alt={isAr ? item.nameAr : item.nameEn}
          className="transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        {item.isBestSeller && (
          <span className="flame-badge absolute start-3 top-3 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold text-white shadow-lg">
            <Flame className="size-3.5" />
            {t.misc.bestSeller}
          </span>
        )}
        {item.spicyOption && (
          <span
            className="absolute end-3 top-3 grid size-8 place-items-center rounded-full bg-black/45 text-cheese-300 backdrop-blur"
            title={t.cart.spicy}
          >
            <Flame className="size-4" fill="currentColor" />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-extrabold leading-snug">{isAr ? item.nameAr : item.nameEn}</h3>
        </div>
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-ink-2">
          {isAr ? item.descriptionAr : item.descriptionEn}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <div>
            {item.sizes.length > 1 && <span className="block text-[10px] font-semibold text-ink-2">{t.misc.from}</span>}
            <span className="text-lg font-extrabold text-brand-500">{money(minPrice, lang)}</span>
          </div>
          <button
            onClick={onAdd}
            disabled={!item.isAvailable}
            className="grid size-10 place-items-center rounded-full bg-brand-500 text-white shadow-lg transition hover:scale-110 hover:glow-brand active:scale-95 disabled:opacity-40"
            aria-label={`add ${item.nameEn}`}
          >
            <Plus className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
