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
    <div className="mx-auto max-w-7xl px-4 md:px-8 pt-24 pb-6" dir="rtl">
      {/* حاوية السلايدر بكيرفات دائرية عريضة وتصميم عصري */}
      <section className="relative h-[78vh] min-h-[580px] max-h-[720px] w-full overflow-hidden rounded-[36px] border border-white/15 bg-carbon-950 text-white shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 size-full"
          >
            {/* الصورة ساطعة وطبيعية 100% بدون أي تغميق أسود */}
            {slide.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.image}
                alt={slide.title}
                className="size-full object-cover object-center brightness-100 contrast-[1.02]"
              />
            ) : (
              <div className="size-full bg-gradient-to-r from-red-900 via-carbon-900 to-amber-900" />
            )}

            {/* تظليل جانبي ناعم وذكي جهة اليمين فقط لحماية وضوح النص مع ترك الصورة صافية بالكامل في المنتصف واليسار */}
            <div className="absolute inset-y-0 right-0 w-full md:w-3/5 bg-gradient-to-l from-carbon-950/95 via-carbon-950/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-carbon-950/80 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* محتوى الشريحة */}
        <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-14">
          <div className="max-w-2xl space-y-5">
            {slide.badge && (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/40 px-4 py-1.5 text-xs font-black text-amber-300 backdrop-blur-md shadow-md">
                <Flame className="size-3.5 text-brand-500 animate-pulse" />
                <span>{slide.badge}</span>
              </span>
            )}

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] text-white">
              {slide.title}
            </h1>

            <p className="text-sm sm:text-base md:text-lg font-bold text-white/95 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-xl">
              {slide.subtitle}
            </p>

            {/* أزرار الإجراء بكيرفات كاملة */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                href={slide.cta1Link || "/menu"}
                className="rounded-full bg-gradient-to-r from-brand-500 to-amber-500 px-8 py-4 text-sm font-black text-white shadow-xl glow-brand transition hover:scale-105 active:scale-95 border border-white/20"
              >
                {slide.cta1Text || "اطلب الآن 🍗"}
              </Link>

              <Link
                href={slide.cta2Link || "/menu"}
                className="flex items-center gap-2 rounded-full border border-white/30 bg-black/40 px-7 py-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-black/60 hover:scale-105"
              >
                <UtensilsCrossed className="size-4 text-amber-400" />
                <span>{slide.cta2Text || "شوف المنيو"}</span>
              </Link>
            </div>

            {/* شريط الإحصائيات الصغير بكيرفات دائرية */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-xs font-black text-white/90">
              <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3.5 py-1.5 backdrop-blur-md border border-white/10">
                <Clock className="size-4 text-brand-400" />
                <span>٣٠-٤٥ دقيقة</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3.5 py-1.5 backdrop-blur-md border border-white/10">
                <Star className="size-4 text-amber-400 fill-amber-400" />
                <span>٤.٩ تقييم</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3.5 py-1.5 backdrop-blur-md border border-white/10">
                <ShieldCheck className="size-4 text-emerald-400" />
                <span>دجاج طازج 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* أسهم وأزرار التنقل الدائرية */}
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2.5">
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + currentSlides.length) % currentSlides.length)}
            className="grid size-11 place-items-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-md hover:bg-brand-500 hover:border-brand-500 transition shadow-xl cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % currentSlides.length)}
            className="grid size-11 place-items-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-md hover:bg-brand-500 hover:border-brand-500 transition shadow-xl cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
