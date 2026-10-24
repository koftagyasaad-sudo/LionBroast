"use client";

import { Flame } from "lucide-react";
import { useIsAr } from "@/lib/hooks";

export default function MarqueeStrip() {
  const isAr = useIsAr();
  const words = isAr
    ? ["كرسبي ١٠٠٪", "دجاج طازج يومياً", "تتبيلة سرية من 1998", "حار بجد", "توصيل 30 دقيقة", "زيت نظيف كل يوم"]
    : ["100% CRISPY", "Fresh chicken daily", "Secret recipe since 1998", "Seriously hot", "30-min delivery", "Fresh oil every day"];
  const row = [...words, ...words];
  return (
    <div className="relative mt-16 overflow-hidden border-y border-line bg-surface py-4">
      <div className="marquee-track items-center gap-8">
        {row.map((w, i) => (
          <span key={i} className="flex shrink-0 items-center gap-8">
            <span className="text-sm font-extrabold uppercase tracking-[0.2em] text-ink-2">{w}</span>
            <Flame className="size-4 shrink-0 text-brand-500" fill="currentColor" />
          </span>
        ))}
      </div>
    </div>
  );
}
