"use client";

import { Flame } from "lucide-react";
import { useIsAr } from "@/lib/hooks";

export default function MarqueeStrip({ 
  marqueeAr, 
  marqueeEn 
}: { 
  marqueeAr?: string; 
  marqueeEn?: string 
}) {
  const isAr = useIsAr();
  
  // نصوص افتراضية في حالة إن لوحة التحكم لسه فاضية
  const defaultAr = "كرسبي ١٠٠٪ 🔥 دجاج طازج يومياً 🔥 تتبيلة سرية من 1998 🔥 حار بجد";
  const defaultEn = "100% CRISPY 🔥 Fresh chicken daily 🔥 Secret recipe since 1998 🔥 Seriously hot";

  // اختيار النص حسب اللغة
  const rawText = isAr ? (marqueeAr || defaultAr) : (marqueeEn || defaultEn);

  // تقسيم النص بناءً على رمز النار عشان الشريط يشتغل صح
  const words = rawText.split('🔥').map(w => w.trim()).filter(Boolean);
  
  // تكرار الكلمات عشان حركة الشريط تفضل شغالة بدون تقطيع
  const row = [...words, ...words, ...words, ...words]; 

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
