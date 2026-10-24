"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock3, Flame, Leaf, ShoppingBag, Star, UtensilsCrossed } from "lucide-react";
import { IMG } from "@/lib/img";
import { useDict, useIsAr } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const HERO_IMGS = [IMG.heroClassic, IMG.heroSpicy, IMG.heroCombo];

export default function HeroSlider({ frontend }: { frontend?: any }) {
  const t = useDict();
  const isAr = useIsAr();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // سحب الشرائح الأساسية وتعديل الشريحة الأولى بالبيانات الجاية من الداتا بيز
  const rawSlides = t.hero.slides;
  const slides = [...rawSlides];
  
  if (frontend) {
    slides[0] = {
      ...slides[0],
      title: isAr ? (frontend.heroTitleAr || slides[0].title) : (frontend.heroTitleEn || slides[0].title),
      sub: isAr ? (frontend.heroSubAr || slides[0].sub) : (frontend.heroSubEn || slides[0].sub),
    };
  }

  const count = slides.length;
  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6500);
    return () => clearInterval(id);
  }, [paused, count]);

  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  return (
    <section
      className="grain relative flex min-h-[96svh] items-end overflow-hidden bg-carbon-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: reduce ? 1 : 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMGS[index % HERO_IMGS.length]} alt="" className="h-full w-full object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="hero-vignette absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-24 select-none overflow-hidden text-center">
        <span className="text-outline-faint whitespace-nowrap text-[19vw] font-extrabold leading-none tracking-tight opacity-70 md:text-[11rem]">
          {isAr ? "كرسبي" : "CRISPY"}
        </span>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-40 md:px-8 md:pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09 } }, exit: { opacity: 0, y: -24, transition: { duration: 0.35 } } }}
            className="max-w-2xl"
          >
            <motion.span
              variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              className="flame-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest shadow-lg"
            >
              <Flame className="size-3.5" />
              {slides[index].kicker}
            </motion.span>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 34 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
              className="mt-5 text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl md:text-7xl"
            >
              {slides[index].title}
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              className="mt-5 max-w-lg text-base leading-relaxed text-white/80 md:text-lg"
            >
              {slides[index].sub}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/menu"
                className="glow-brand group flex items-center gap-2.5 rounded-full bg-brand-500 px-7 py-4 text-base font-extrabold text-white transition hover:scale-[1.03] active:scale-[0.98]"
              >
                <ShoppingBag className="size-5 transition group-hover:-rotate-12" />
                {slides[index].cta}
              </Link>
              <Link
                href="/menu"
                className="flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-7 py-4 text-base font-bold text-white backdrop-blur transition hover:border-white/60 hover:bg-white/20"
              >
                <UtensilsCrossed className="size-5" />
                {t.hero.viewMenu}
              </Link>
            </motion.div>

            <motion.div
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8 } } }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-white/75"
            >
              <span className="flex items-center gap-1.5"><Clock3 className="size-4 text-cheese-300" /> {t.hero.deliveryTime}</span>
              <span className="flex items-center gap-1.5"><Star className="size-4 fill-cheese-300 text-cheese-300" /> {t.hero.rating}</span>
              <span className="flex items-center gap-1.5"><Leaf className="size-4 text-emerald-400" /> {t.hero.fresh}</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 z-10 flex items-center gap-4 end-4 md:end-8">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => go(i)} aria-label={`slide ${i + 1}`} className="group relative h-1.5 w-10 overflow-hidden rounded-full bg-white/25">
              <span className={cn("absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-cheese-300 to-brand-500 transition-all duration-500", i === index ? "w-full" : "w-0")} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[prev, next].map((fn, i) => (
            <button key={i} onClick={fn} aria-label={i === 0 ? "previous" : "next"} className="grid size-11 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur transition hover:border-brand-500 hover:bg-brand-500">
              {(i === 0) === isAr ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
