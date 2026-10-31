"use client";

import { Flame } from "lucide-react";

export default function MarqueeStrip({ marqueeAr, text }: { marqueeAr?: string; text?: string; [key: string]: any }) {
  const displayText =
    marqueeAr ||
    text ||
    "توصيل سريع وساخن لجميع أنحاء دسوق • اطلب الآن واستمتع بالطعم الأسدي الأصلي 🍗";

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-3" dir="rtl">
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/20 bg-carbon-900/80 py-2.5 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 text-xs md:text-sm font-black text-amber-300 shrink-0">
              <Flame className="w-4 h-4 text-brand-500 fill-brand-500" />
              <span>{displayText}</span>
              <span className="text-white/30">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
