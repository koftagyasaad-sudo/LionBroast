"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, UtensilsCrossed } from "lucide-react";
import type { CategoryDTO, MenuItemDTO } from "@/lib/types";
import { useDict, useIsAr } from "@/lib/hooks";
import SectionHead from "@/components/SectionHead";

/** Asymmetric editorial mosaic of menu categories. */
export default function MenuPreview({ categories, items }: { categories: CategoryDTO[]; items: MenuItemDTO[] }) {
  const t = useDict();
  const isAr = useIsAr();

  const counts = new Map<string, number>();
  for (const it of items) counts.set(it.categoryId, (counts.get(it.categoryId) ?? 0) + 1);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <SectionHead
        icon={<UtensilsCrossed className="size-4" />}
        kicker={t.sections.menuKicker}
        title={t.sections.menuTitle}
        sub={t.sections.menuSub}
      />

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((c, i) => {
          const big = i === 0;
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={big ? "col-span-2 row-span-2" : ""}
            >
              <Link
                href={`/menu?c=${c.id}`}
                className="card-lift group relative flex h-full min-h-[170px] flex-col justify-end overflow-hidden rounded-3xl border border-line bg-carbon-950 p-5 text-white md:min-h-[190px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image || undefined} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon-950/95 via-carbon-950/30 to-transparent" />
                <div className="relative">
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold backdrop-blur">
                    {counts.get(c.id) ?? 0} {isAr ? "صنف" : "items"}
                  </span>
                  <h3 className={`mt-2 font-extrabold leading-tight ${big ? "text-2xl md:text-3xl" : "text-base md:text-lg"}`}>
                    {isAr ? c.nameAr : c.nameEn}
                  </h3>
                  <span className="mt-1 hidden text-[11px] font-semibold text-white/70 sm:block">{isAr ? c.nameEn : c.nameAr}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/menu"
          className="group inline-flex items-center gap-2 rounded-full border border-brand-500/60 px-7 py-3.5 text-sm font-extrabold text-brand-500 transition hover:bg-brand-500 hover:text-white"
        >
          {t.misc.viewAll}
          {isAr ? <ArrowLeft className="size-4 transition group-hover:-translate-x-1" /> : <ArrowRight className="size-4 transition group-hover:translate-x-1" />}
        </Link>
      </div>
    </section>
  );
}
