"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import type { MenuItemDTO } from "@/lib/types";
import { useDict, useIsAr } from "@/lib/hooks";
import MenuItemCard from "@/components/MenuItemCard";
import SectionHead from "@/components/SectionHead";

export default function BestSellers({ items }: { items: MenuItemDTO[] }) {
  const t = useDict();
  const isAr = useIsAr();
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    railRef.current?.scrollBy({ left: dir * (isAr ? -300 : 300), behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <section id="best" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 md:px-8">
      <div className="flex items-end justify-between gap-4">
        <SectionHead
          icon={<Flame className="size-4" />}
          kicker={t.sections.bestKicker}
          title={t.sections.bestTitle}
          sub={t.sections.bestSub}
        />
        <div className="hidden gap-2 md:flex">
          {[1, -1].map((d) => (
            <button
              key={d}
              onClick={() => scroll(d)}
              aria-label="scroll"
              className="grid size-11 place-items-center rounded-full border border-line bg-surface transition hover:border-brand-500 hover:bg-brand-500 hover:text-white"
            >
              {(d === 1) === isAr ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
            </button>
          ))}
        </div>
      </div>

      <div ref={railRef} className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {items.map((it) => (
          <MenuItemCard key={it.id} item={it} rail />
        ))}
      </div>
    </section>
  );
}
