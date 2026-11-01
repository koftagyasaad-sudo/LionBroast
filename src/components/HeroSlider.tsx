"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Flame, UtensilsCrossed, Clock, Star, ShieldCheck } from "lucide-react";

export default function HeroSlider({ frontend, slides }: { frontend?: any; slides?: any[] }) {
  const defaultSlides = [
    {
      id: "slide-1",
      badge: "أقوى قرمشة في دسوق 🔥",
      title: "أكبر قطعة بروست في دسوق 🦁",
      subtitle: "قرمشة وتتبيلة سرية ملهاش زي! اطلب دلوقتي واستمتع بأقوى عروض التوفير الفردية والعائلية.",
      image: frontend?.heroImage1 || "/img/hero-1.png",
      cta1Text: "اطلب دلوقتي 🍗",
      cta1Link: "/menu",
      cta2Text: "شوف المنيو",
      cta2Link: "/menu",
    },
    {
      id: "slide-2",
      badge: "وليمة التوفير للأسود",
      title: "العزومة جاهزة لكل العيلة",
      subtitle: "قطع بروست مقرمشة مع البطاطس العائلية، الكول سلو والثومية، توصيل سخن ومقرمش لحد باب بيتك.",
      image: frontend?.heroImage2 || "/img/hero-2.png",
      cta1Text: "اطلب الوليمة الآن",
      cta1Link: "/menu",
      cta2Text: "قائمة العروض",
      cta2Link: "/menu",
    },
    {
      id: "slide-3",
      badge: "إصدار التحدي الناري",
      title: "الحار اللي يولّع 🔥",
      subtitle: "ستريبس النار بغمسة الهالبينو المدخنة، خصم 20% طوال الأسبوع - جرّبها لو قدها.",
      image: frontend?.heroImage3 || "/img/hero-3.png",
      cta1Text: "تحدي النار 🍗",
      cta1Link: "/menu",
      cta2Text: "المنيو كامل",
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
    <div className="mx-auto max-w-7xl px-4 md:px-8 pt-28 pb-6" dir="rtl">
      <section className="relative h-[520px] md:h-[580px] w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 text-white shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 size-full"
          >
            {slide.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.image}
                alt={slide.title}
                className="size-full object-cover object-center"
              />
            ) : (
              <div className="size-full bg-gradient-to-r from-red-950 via-zinc-950 to-amber-950" />
            )}

            {/* تدرج التظليل الأصلي لحماية قراءة النصوص فوق الصورة */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* محتوى الشريحة التفاعلي */}
        <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-14">
          <div className="max-w-2xl space-y-4 text-right">
            {slide.badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/15 px-4 py-1.5 text-xs font-black text-orange-400 backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span>{slide.badge}</span>
              </span>
            )}

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight drop-shadow-lg">
              {slide.title}
            </h1>

            <p className="text-xs sm:text-base md:text-lg font-medium text-zinc-300 leading-relaxed max-w-xl drop-shadow">
              {slide.subtitle}
            </p>

            {/* أزرار الإجراء */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href={slide.cta1Link || "/menu"}
                className="rounded-2xl bg-orange-600 hover:bg-orange-500 px-8 py-3.5 text-xs md:text-sm font-black text-white shadow-xl glow-brand transition active:scale-95"
              >
                {slide.cta1Text || "اطلب الآن 🍗"}
              </Link>

              <Link
                href={slide.cta2Link || "/menu"}
                className="flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 px-6 py-3.5 text-xs md:text-sm font-bold text-white backdrop-blur-md transition"
              >
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <span>{slide.cta2Text || "شوف المنيو"}</span>
              </Link>
            </div>

            {/* مميزات سريعة */}
            <div className="flex flex-wrap items-center gap-3 pt-4 text-xs font-bold text-zinc-300">
              <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900/80 px-3 py-1.5 backdrop-blur-md border border-zinc-800">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>٣٠-٤٥ دقيقة</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900/80 px-3 py-1.5 backdrop-blur-md border border-zinc-800">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>٤.٩ تقييم</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900/80 px-3 py-1.5 backdrop-blur-md border border-zinc-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>دجاج طازج 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار التقليب */}
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + currentSlides.length) % currentSlides.length)}
            className="grid size-10 place-items-center rounded-full border border-zinc-700 bg-zinc-900/80 text-white backdrop-blur-md hover:bg-orange-600 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % currentSlides.length)}
            className="grid size-10 place-items-center rounded-full border border-zinc-700 bg-zinc-900/80 text-white backdrop-blur-md hover:bg-orange-600 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
