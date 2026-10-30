"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Flame,
  Languages,
  Menu,
  Moon,
  QrCode,
  ShoppingBag,
  Sun,
  UtensilsCrossed,
  X,
  MapPin,
  PhoneCall,
} from "lucide-react";
import { cartCount, useApp } from "@/store/app-store";
import { useDict, useMounted } from "@/lib/hooks";
import { cn } from "@/lib/utils";

interface HeaderProps {
  settings?: any;
  frontend?: any;
  promo?: any;
}

export default function Header({ settings, frontend }: HeaderProps) {
  const t = useDict();
  const mounted = useMounted();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const lang = useApp((s) => s.lang);
  const theme = useApp((s) => s.theme);
  const cart = useApp((s) => s.cart);
  const customer = useApp((s) => s.customer);
  const setLang = useApp((s) => s.setLang);
  const setTheme = useApp((s) => s.setTheme);
  const setCartOpen = useApp((s) => s.setCartOpen);
  const setPassOpen = useApp((s) => s.setPassOpen);
  const openOnboarding = useApp((s) => s.openOnboarding);

  const storeData = frontend || settings || {};
  const logoUrl = storeData.logoUrl || storeData.logo_url || "/img/icon-512.png";
  const brandName = storeData.brandNameAr || storeData.brand_name_ar || t.brand || "بروست الأسد";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = mounted ? cartCount(cart) : 0;

  const links = [
    { href: "/menu", label: "المنيو", icon: UtensilsCrossed },
    { href: "/#best", label: "الأكثر مبيعاً", icon: Flame },
    { href: "/#zones", label: "مناطق التوصيل", icon: MapPin },
    { href: "/#contact", label: "الفروع والتواصل", icon: PhoneCall },
  ];

  const openPass = () => {
    if (customer) setPassOpen(true);
    else openOnboarding("pass");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-carbon-950/95 backdrop-blur-xl border-b border-white/15 py-2.5 shadow-2xl"
          : "bg-gradient-to-b from-carbon-950/90 via-carbon-950/60 to-transparent py-4 backdrop-blur-[2px]"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        {/* Logo & Brand Name */}
        <Link href="/" className="group flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt="Broast El-Assad"
            className="size-11 rounded-2xl object-cover ring-2 ring-brand-500/80 shadow-lg transition group-hover:scale-105"
          />
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              {brandName}
            </span>
            <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-brand-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {lang === "ar" ? "Broast El-Assad" : "بروست الأسد"}
            </span>
          </span>
        </Link>

        {/* Desktop Navigation with high contrast pill container */}
        <nav className="hidden items-center gap-1 lg:flex bg-carbon-950/70 border border-white/15 rounded-full px-3 py-1 shadow-xl backdrop-blur-md">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-bold text-white/90 hover:text-white hover:bg-white/15 transition drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex h-10 items-center gap-1.5 rounded-full border border-white/20 bg-carbon-950/80 px-3 text-xs font-bold text-white shadow-md backdrop-blur-md hover:border-brand-500 transition"
          >
            <Languages className="size-4 text-brand-400" />
            <span>{lang === "ar" ? "English" : "العربية"}</span>
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid size-10 place-items-center rounded-full border border-white/20 bg-carbon-950/80 text-white shadow-md backdrop-blur-md hover:border-brand-500 transition"
          >
            {mounted && theme === "light" ? <Sun className="size-4.5 text-amber-400" /> : <Moon className="size-4.5 text-blue-400" />}
          </button>

          <button
            onClick={openPass}
            className="hidden h-10 items-center gap-1.5 rounded-full border border-cheese-400/60 bg-carbon-950/90 px-3.5 text-xs font-black text-cheese-300 shadow-md backdrop-blur-md hover:bg-cheese-400/20 transition sm:flex"
          >
            <QrCode className="size-4 text-cheese-400" />
            <span>بطاقة الأسد VIP</span>
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="relative grid size-10 place-items-center rounded-full bg-brand-500 text-white transition glow-brand hover:scale-105 shadow-xl"
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-cheese-400 text-[10px] font-black text-carbon-950 ring-2 ring-bg">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-white/20 bg-carbon-950/80 text-white lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-carbon-950/98 border-b border-white/15 backdrop-blur-2xl lg:hidden"
          >
            <div className="space-y-1.5 px-4 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                >
                  <l.icon className="size-4 text-brand-500" />
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  openPass();
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-cheese-400/10 px-4 py-3 text-sm font-bold text-cheese-400"
              >
                <QrCode className="size-4" />
                بطاقة الأسد VIP
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
