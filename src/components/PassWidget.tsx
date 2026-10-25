"use client";

import React from "react";

export default function PassWidget() {
  return (
    <section
      dir="rtl"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 p-8 md:p-12 text-white shadow-2xl border border-amber-400/30"
    >
      {/* خلفية زخرفية خفيفة */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-black/20 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 text-center md:text-right max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-black/30 px-4 py-1.5 text-sm font-bold text-amber-300 backdrop-blur-sm border border-white/10">
            <span>🦁</span>
            <span>عروض ومميزات بروست الأسد VIP</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            أكبر قطعة بروست في دسوق.. قرمشة وتتبيلة ملهاش زي! 🔥
          </h2>

          <p className="text-white/90 text-base md:text-lg leading-relaxed">
            اطلب دلوقتي من المنيو واستمتع بأقوى عروض التوفير العائلية والفردية، توصيل سريع وسخن لحد باب بيتك في دسوق وجميع القرى المجاورة.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
          <a
            href="#menu"
            className="w-full sm:w-auto text-center rounded-2xl bg-white px-8 py-4 text-lg font-black text-red-700 shadow-lg transition-all duration-200 hover:bg-amber-50 hover:scale-105 active:scale-95"
          >
            اطلب الآن 🍗
          </a>
        </div>
      </div>
    </section>
  );
}
