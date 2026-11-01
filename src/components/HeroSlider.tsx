"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Flame, UtensilsCrossed, Clock, Star, ShieldCheck } from "lucide-react";

export default function HeroSlider({ frontend, slides }: { frontend?: any; slides?: any[] }) {
  const defaultSlides = [
    {
      id: "slide-1",
      badge: "إصدار النار 🔥",
      title: "الحار اللي يولّع",
      subtitle: "ستريبس النار بغمسة الهالبينو المدخنة، خصم 20% طوال الأسبوع - جرّبها لو قدها.",
      image: frontend?.heroImage1 || "/img/hero-1.png",
      cta1Text: "تحدي النار 🍗",
      cta1Link: "/menu",
      cta2Text: "شوف المنيو",
      cta2Link: "/menu",
    },
    {
      id: "slide-2",
      badge: "وليمة العيلة",
      title: "العزومة جاهزة",
      subtitle: "١٥ قطعة بروست، بطاطس عائلية، كول سلو و٤ مشروبات. اطلبها ووصلها السكة.",
      image: frontend?.heroImage2 || "/img/hero-2.png",
      cta1Text: "اطلب الوليمة",
      cta1Link: "/menu",
      cta2Text: "شوف المنيو",
      cta2Link: "/menu",
    },
    {
      id: "slide-3",
      badge: "أقوى قرمشة",
      title: "أكبر قطعة بروست في دسوق",
      subtitle: "قرمشة وتتبيلة سرية ملهاش زي! اطلب دلوقتي واستمتع بأقوى عروض التوفير.",
      image: frontend?.heroImage3 || "/img/hero-3.png",
      cta1Text: "شوف العروض",
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
    <section className="relative h-[85vh] min-h-[580px] max-h-[780px] w-full overflow-hidden bg-carbon-950 text-white" dir="rtl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* صورة خلفية الشريحة */}
          {slide.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={slide.image} alt={slide.title} className="size-full object-cover object-center brightness-[0.45]" />
          ) : (
            <div className="size-full bg-gradient-to-r from-red-950 via-carbon-950 to-amber-950" />
          )}

          {/* طبقة تظليل متدرجة لحماية النصوص */}
          <div className="absolute inset-0 bg-gradient-to-t from-carbon-950 via-carbon-950/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-carbon-950/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* محتوى الشريحة التفاعلي */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 md:px-8">
        <div className="max-w-2xl space-y-5">
          {slide.badge && (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/20 px-4 py-1.5 text-xs font-black text-amber-300 backdrop-blur-md">
              <Flame className="size-3.5 text-brand-500" />
              <span>{slide.badge}</span>
            </span>
          )}

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight drop-shadow-xl text-white">
            {slide.title}
          </h1>

          <p className="text-sm sm:text-base md:text-lg font-semibold text-white/80 leading-relaxed drop-shadow-md">
            {slide.subtitle}
          </p>

          {/* أزرار الإجراء السريع (Buttons) */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href={slide.cta1Link || "/menu"}
              className="rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 px-8 py-4 text-sm font-black text-white shadow-xl glow-brand transition hover:scale-105 active:scale-95"
            >
              {slide.cta1Text || "اطلب الآن 🍗"}
            </Link>

            <Link
              href={slide.cta2Link || "/menu"}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <UtensilsCrossed className="size-4" />
              <span>{slide.cta2Text || "شوف المنيو"}</span>
            </Link>
          </div>

          {/* شريط الإحصائيات الصغير */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-bold text-white/70">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-brand-400" />
              <span>يوصلك في ٣٠-٤٥ دقيقة</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="size-4 text-amber-400 fill-amber-400" />
              <span>٤.٩ من +٢٬٤٠٠ تقييم</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>دجاج طازج يومياً</span>
            </div>
          </div>
        </div>
      </div>

      {/* أزرار وأسهم التنقل بين الشرائح */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
        <button
          onClick={() => setCurrent((prev) => (prev - 1 + currentSlides.length) % currentSlides.length)}
          className="grid size-10 place-items-center rounded-full border border-white/20 bg-carbon-950/70 text-white backdrop-blur-md hover:bg-white/20 transition cursor-pointer"
        >
          <ChevronRight className="size-5" />
        </button>
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % currentSlides.length)}
          className="grid size-10 place-items-center rounded-full border border-white/20 bg-carbon-950/70 text-white backdrop-blur-md hover:bg-white/20 transition cursor-pointer"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>
    </section>
  );
}
