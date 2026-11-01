"use client";

import { Flame } from "lucide-react";

export default function MarqueeStrip({
  marqueeAr,
  text,
}: {
  marqueeAr?: string;
  text?: string;
  [key: string]: any;
}) {
  const displayText =
    marqueeAr ||
    text ||
    "🔥 توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥";

  return (
    <div className="w-full bg-zinc-900/90 border-y border-zinc-800 py-3 overflow-hidden backdrop-blur-md" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 flex items-center justify-center gap-4 text-xs md:text-sm font-bold text-amber-400">
        <Flame className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
        <span className="truncate">{displayText}</span>
        <Flame className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
      </div>
    </div>
  );
}
