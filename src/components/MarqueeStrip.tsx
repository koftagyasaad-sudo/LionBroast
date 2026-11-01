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
    "توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي";

  return (
    <div className="w-full bg-carbon-900/90 border-y border-white/5 py-3 overflow-hidden backdrop-blur-md" dir="rtl">
      <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3 text-xs md:text-sm font-bold text-amber-400 shrink-0">
            <Flame className="w-3.5 h-3.5 text-brand-500 fill-brand-500 shrink-0" />
            <span>{displayText}</span>
            <span className="text-white/20 mr-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
