"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingBag,
  Award,
  Menu,
  X,
  Flame,
  UtensilsCrossed,
  MapPin,
  PhoneCall,
} from "lucide-react";
import { useApp } from "@/store/app-store";
import CustomerQRCode from "@/components/CustomerQRCode";

interface HeaderProps {
  frontend?: any;
  settings?: any;
  promo?: any;
}

export default function Header({ frontend, settings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vipOpen, setVipOpen] = useState(false);

  const app = useApp() as any;
  const cart: any[] = Array.isArray(app?.cart) ? app.cart : [];
  const cartCount = cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
  const setCartOpen = app?.setCartOpen || app?.openCart || (() => {});

  const currentSettings = frontend || settings || {};
  const logoUrl =
    currentSettings.logoUrl ||
    currentSettings.logo_url ||
    "/img/icon-512.png";

  const brandNameAr = currentSettings.brandNameAr || currentSettings.brand_name_ar || "بروست الأسد";
  const brandNameEn = currentSettings.brandNameEn || currentSettings.brand_name_en || "BROAST EL-ASSAD";

  return (
    <>
      <header
        className="fixed top-0 inset-x-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 shadow-xl"
        style={{ height: "76px", maxHeight: "76px" }}
        dir="rtl"
      >
        <div className="mx-auto max-w-7xl h-full px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* الشعار واسم المطعم */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div
              className="rounded-2xl overflow-hidden bg-orange-500/10 border border-orange-500/30 p-1 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition"
              style={{
                width: "44px",
                height: "44px",
                minWidth: "44px",
                maxWidth: "44px",
                maxHeight: "44px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={brandNameAr}
                width={36}
                height={36}
                style={{
                  width: "36px",
                  height: "36px",
                  maxWidth: "36px",
                  maxHeight: "36px",
                  objectFit: "contain",
                  display: "block",
                }}
                className="rounded-xl"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg text-white group-hover:text-orange-400 transition tracking-tight">
                {brandNameAr}
              </span>
              <span className="text-[9px] font-black text-amber-400 tracking-wider font-mono">
                {brandNameEn}
              </span>
            </div>
          </Link>

          {/* روابط التنقل الرئيسية */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-zinc-300">
            <Link
              href="/"
              className="rounded-xl px-3.5 py-2 hover:bg-zinc-900 hover:text-white transition"
            >
              الرئيسية
            </Link>
            <Link
              href="/menu"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 hover:bg-zinc-900 hover:text-white transition"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
              <span>المنيو</span>
            </Link>
            <Link
              href="/#best"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 hover:bg-zinc-900 hover:text-white transition"
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>الأكثر مبيعاً</span>
            </Link>
            <Link
              href="/#zones"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 hover:bg-zinc-900 hover:text-white transition"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>مناطق التوصيل</span>
            </Link>
            <Link
              href="/#location"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 hover:bg-zinc-900 hover:text-white transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>الفروع والتواصل</span>
            </Link>
          </nav>

          {/* كارت VIP وسلة الطلبات */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setVipOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-xs font-black text-amber-300 transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">بطاقة الأسد VIP</span>
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-500 px-4 py-2 text-xs font-black text-white shadow-lg transition active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">السلة</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-zinc-950 font-black text-[10px] grid place-items-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid lg:hidden w-10 h-10 place-items-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* قائمة الموبايل */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-zinc-800 bg-zinc-950 px-6 py-6 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-zinc-900"
            >
              الرئيسية
            </Link>
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-zinc-900"
            >
              قائمة الطعام (المنيو)
            </Link>
            <Link
              href="/#best"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-zinc-900"
            >
              الأكثر طلباً ومبيعاً 🔥
            </Link>
            <Link
              href="/#zones"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-zinc-900"
            >
              مناطق وأسعار التوصيل 🛵
            </Link>
            <Link
              href="/#location"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-zinc-900"
            >
              الفرع والاتصال المباشر 📞
            </Link>
          </div>
        )}
      </header>

      <CustomerQRCode open={vipOpen} onClose={() => setVipOpen(false)} />
    </>
  );
}
