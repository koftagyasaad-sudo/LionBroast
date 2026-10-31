"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Flame, UtensilsCrossed, Clock, Star, ShieldCheck } from "lucide-react";

export default function HeroSlider({ frontend, slides }: { frontend?: any; slides?: any[] }) {
  const defaultSlides = [
    {
      id: "slide-1",
      badge: "إصدار التحدي 🔥",
      title: "أقوى وأحلى سندوتش في دسوق 🦁",
      subtitle: "طبقات من الدجاج المقرمش مع صوص الجبنة السايحة الغني، طازج ومحضر يومياً بأعلى معايير الجودة.",
      image: frontend?.heroImage1 || "/img/hero-1.png",
      cta1Text: "اطلب السندوتش الآن 🍗",
      cta1Link: "/menu",
      cta2Text: "تصفح المنيو",
      cta2Link: "/menu",
    },
    {
      id: "slide-2",
      badge: "وليمة التوفير",
      title: "عزومة البروست جاهزة للأسود",
      subtitle: "قطع بروست مقرمشة مع البطاطس العائلية، الكول سلو والثومية، توصيل سخن ومقرمش لحد باب بيتك.",
      image: frontend?.heroImage2 || "/img/hero-2.png",
      cta1Text: "اطلب الوجبة الآن",
      cta1Link: "/menu",
      cta2Text: "قائمة العروض",
      cta2Link: "/menu",
    },
  ];

  const currentSlides =
    frontend?.heroSlides && Array.isArray(frontend.heroSlides) && frontend.heroSlides.length > 0
      ? frontend.heroSlides
      : slides && slides.length > 0
      ? slides
      : defaultSlides;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % currentSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlides.length]);

  const slide = currentSlides[current] || currentSlides[0];

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 pt-24 pb-4" dir="rtl">
      {/* حاوية السلايدر بكيرفات عريضة وتوزيع Split ذكي */}
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-carbon-900 via-carbon-950 to-carbon-950 p-6 md:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[500px]">
          
          {/* 1. الجانب الأيمن: النصوص والأزرار التفاعلية */}
          <div className="lg:col-span-6 space-y-5 text-right z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                {slide.badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-black text-amber-300 shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                    <span>{slide.badge}</span>
                  </span>
                )}

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                  {slide.title}
                </h1>

                <p className="text-xs sm:text-sm md:text-base font-semibold text-white/70 leading-relaxed max-w-lg">
                  {slide.subtitle}
                </p>

                {/* أزرار الطلب والمنيو بكيرفات كاملة */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href={slide.cta1Link || "/menu"}
                    className="rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 px-7 py-3.5 text-xs md:text-sm font-black text-white shadow-xl glow-brand transition active:scale-95"
                  >
                    {slide.cta1Text || "اطلب الآن 🍗"}
                  </Link>

                  <Link
                    href={slide.cta2Link || "/menu"}
                    className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3.5 text-xs md:text-sm font-black text-white transition"
                  >
                    <UtensilsCrossed className="w-4 h-4 text-brand-400" />
                    <span>{slide.cta2Text || "شوف المنيو"}</span>
                  </Link>
                </div>

                {/* مزايا سريعة */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 text-[11px] font-bold text-white/80">
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 border border-white/5">
                    <Clock className="w-3.5 h-3.5 text-brand-400" /> ٣٠-٤٥ دقيقة
                  </span>
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 border border-white/5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> ٤.٩ تقييم العملاء
                  </span>
                  <span className="flex items-center gap-1.5 rounded-xl bg-white/5 px-3 py-1.5 border border-white/5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> دجاج طازج 100%
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 2. الجانب الأيسر: صورة الساندوتش واضحة 100% بدون أي كلام فوقها */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-carbon-900 flex items-center justify-center"
              >
                {slide.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full max-h-[420px] object-contain rounded-3xl"
                  />
                ) : (
                  <div className="size-64 flex items-center justify-center text-7xl">🍗</div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* أزرار تقليب الشرائح أسفل الصورة */}
            <div className="absolute -bottom-4 left-4 z-20 flex items-center gap-2">
              <button
                onClick={() => setCurrent((prev) => (prev - 1 + currentSlides.length) % currentSlides.length)}
                className="grid size-9 place-items-center rounded-full border border-white/20 bg-carbon-900/90 text-white hover:bg-brand-500 transition cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrent((prev) => (prev + 1) % currentSlides.length)}
                className="grid size-9 place-items-center rounded-full border border-white/20 bg-carbon-900/90 text-white hover:bg-brand-500 transition cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
