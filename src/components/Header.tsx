"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, Languages, Menu, Moon, QrCode, ShoppingBag, Sun, UtensilsCrossed, X } from "lucide-react";
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
  const [imgError, setImgError] = useState(false);

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
  const logoUrl = storeData.logoUrl || storeData.logo || "/img/icon-512.png";
  const brandName = storeData.brandNameAr || t.brand || "بروست الأسد";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = mounted ? cartCount(cart) : 0;

  const links = [
    { href: "/menu", label: t.nav?.menu || "المنيو" },
    { href: "/#best", label: t.nav?.best || "الأكثر طلباً" },
    { href: "/#zones", label: t.nav?.zones || "مناطق التوصيل" },
    { href: "/#contact", label: t.nav?.contact || "اتصل بنا" },
  ];

  const openPass = () => {
    if (customer) setPassOpen(true);
    else openOnboarding("pass");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass border-b border-line py-2 shadow-lg" : "bg-transparent py-4",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          {!imgError ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt="Broast El-Assad"
              onError={() => setImgError(true)}
              className="size-11 rounded-2xl object-cover ring-2 ring-brand-500/60 transition group-hover:rotate-6 group-hover:ring-brand-500"
            />
          ) : (
            <div className="grid size-11 place-items-center rounded-2xl bg-brand-500/15 text-2xl ring-2 ring-brand-500/60">
              🦁
            </div>
          )}
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight">{brandName}</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-500">
              {lang === "ar" ? "Broast El-Assad" : "بروست الأسد"}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink-2 transition hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-bold transition hover:border-brand-500/60"
            aria-label="toggle language"
          >
            <Languages className="size-4 text-brand-500" />
            {t.misc?.lang || (lang === "ar" ? "EN" : "AR")}
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="grid size-10 place-items-center rounded-full border border-line bg-surface transition hover:border-brand-500/60"
            aria-label="toggle theme"
          >
            {mounted && theme === "light" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
            {!mounted && <Moon className="size-4.5" />}
          </button>

          <button
            onClick={openPass}
            className="hidden h-10 items-center gap-1.5 rounded-full border border-cheese-400/50 bg-cheese-400/10 px-3 text-xs font-bold text-cheese-400 transition hover:bg-cheese-400/20 sm:flex"
            aria-label="lion pass"
          >
            <QrCode className="size-4" />
            {t.nav?.pass || "بطاقة الأسد"}
          </button>

          <button
            onClick={() => setCartOpen(true)}
            className="relative grid size-10 place-items-center rounded-full bg-brand-500 text-white transition glow-brand hover:scale-105"
            aria-label="cart"
          >
            <ShoppingBag className="size-4.5" />
            {count > 0 && (
              <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-cheese-400 text-[10px] font-extrabold text-carbon-950 ring-2 ring-bg">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-line bg-surface lg:hidden"
            aria-label="menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass overflow-hidden border-b border-line lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-ink transition hover:bg-surface-2"
                >
                  {l.href === "/menu" ? <UtensilsCrossed className="size-4 text-brand-500" /> : <Flame className="size-4 text-brand-500" />}
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
                {t.nav?.pass || "بطاقة الأسد"}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
