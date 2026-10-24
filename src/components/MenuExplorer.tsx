"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, Search, UtensilsCrossed } from "lucide-react";
import type { CategoryDTO, MenuItemDTO } from "@/lib/types";
import { useDict, useIsAr } from "@/lib/hooks";
import MenuItemCard from "@/components/MenuItemCard";
import { cn } from "@/lib/utils";

export default function MenuExplorer({ categories, items }: { categories: CategoryDTO[]; items: MenuItemDTO[] }) {
  const t = useDict();
  const isAr = useIsAr();
  const params = useSearchParams();
  const initialCat = params.get("c");

  const [activeCat, setActiveCat] = useState<string>(initialCat && categories.some((c) => c.id === initialCat) ? initialCat : "all");
  const [query, setQuery] = useState("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (activeCat !== "all" && it.categoryId !== activeCat) return false;
      if (!q) return true;
      return [it.nameAr, it.nameEn, it.descriptionAr ?? "", it.descriptionEn ?? ""].some((s) => s.toLowerCase().includes(q));
    });
  }, [items, activeCat, query]);

  const visibleCats = useMemo(
    () => categories.filter((c) => activeCat === "all" || c.id === activeCat),
    [categories, activeCat],
  );

  const forCat = (cid: string) => filtered.filter((i) => i.categoryId === cid);

  return (
    <>
      {/* Page head */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-500">
            <UtensilsCrossed className="size-4" /> {t.sections.menuKicker}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">{t.sections.menuTitle}</h1>
          <p className="mt-2 max-w-md text-sm text-ink-2">{t.sections.menuSub}</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute start-4 top-1/2 size-4.5 -translate-y-1/2 text-ink-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? "دوّر على الكرسبي..." : "Search the crunch..."}
            className="w-full rounded-full border border-line bg-surface py-3.5 ps-11 pe-4 text-sm font-semibold outline-none transition focus:border-brand-500"
          />
        </div>
      </div>

      {/* Sticky category nav */}
      <div className="no-scrollbar sticky top-[68px] z-40 -mx-4 mt-8 flex gap-2 overflow-x-auto border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-xl md:mx-0 md:rounded-full md:border md:px-2">
        <button
          onClick={() => setActiveCat("all")}
          className={cn(
            "shrink-0 rounded-full px-5 py-2.5 text-sm font-extrabold transition",
            activeCat === "all" ? "flame-badge text-white shadow-lg" : "bg-surface text-ink-2 hover:text-ink",
          )}
        >
          {isAr ? "الكل" : "All"}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={cn(
              "shrink-0 rounded-full px-5 py-2.5 text-sm font-extrabold transition",
              activeCat === c.id ? "flame-badge text-white shadow-lg" : "bg-surface text-ink-2 hover:text-ink",
            )}
          >
            {isAr ? c.nameAr : c.nameEn}
          </button>
        ))}
      </div>

      {/* Sections */}
      <div className="mt-10 space-y-14">
        {visibleCats.map((c) => {
          const catItems = forCat(c.id);
          if (!catItems.length) return null;
          return (
            <section
              key={c.id}
              ref={(el) => {
                sectionRefs.current[c.id] = el;
              }}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                  <Flame className="size-5" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold md:text-2xl">{isAr ? c.nameAr : c.nameEn}</h2>
                  <p className="text-xs font-semibold text-ink-2">{isAr ? c.nameEn : c.nameAr}</p>
                </div>
                <div className="ms-auto rounded-full bg-surface px-3 py-1 text-[11px] font-extrabold text-ink-2">
                  {catItems.length} {isAr ? "صنف" : "items"}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {catItems.map((it) => (
                  <MenuItemCard key={it.id} item={it} />
                ))}
              </motion.div>
            </section>
          );
        })}

        {visibleCats.every((c) => forCat(c.id).length === 0) && (
          <div className="grid place-items-center gap-4 py-20 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/mascot-lion.png" alt="mascot" className="size-24 rounded-3xl object-cover" />
            <p className="text-lg font-extrabold">{isAr ? "مفيش نتايج — جرّب كلمة تانية" : "No results — try another word"}</p>
          </div>
        )}
      </div>
    </>
  );
}
