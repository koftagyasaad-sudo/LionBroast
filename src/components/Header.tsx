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
        className="fixed top-0 inset-x-0 z-40 h-20 bg-carbon-950/90 backdrop-blur-xl border-b border-white/10"
        style={{ height: "80px", maxHeight: "80px" }}
        dir="rtl"
      >
        <div className="mx-auto max-w-7xl h-full px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* 1. الشعار واسم المطعم (محصن بمقاس صريح 44px لا يمكن تجاوزه) */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div
              className="rounded-2xl overflow-hidden bg-brand-500/10 border border-brand-500/30 p-1 flex items-center justify-center shrink-0 shadow-lg"
              style={{
                width: "48px",
                height: "48px",
                minWidth: "48px",
                minHeight: "48px",
                maxWidth: "48px",
                maxHeight: "48px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={brandNameAr}
                width={40}
                height={40}
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",
                  minHeight: "40px",
                  maxWidth: "40px",
                  maxHeight: "40px",
                  objectFit: "contain",
                }}
                className="rounded-xl block"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg text-white hover:text-brand-400 transition tracking-tight">
                {brandNameAr}
              </span>
              <span className="text-[9px] font-black text-amber-400 tracking-wider font-mono">
                {brandNameEn}
              </span>
            </div>
          </Link>

          {/* 2. روابط التنقل للشاشات الكبيرة */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-white/70">
            <Link
              href="/"
              className="rounded-xl px-3.5 py-2 hover:bg-white/10 hover:text-white transition"
            >
              الرئيسية
            </Link>
            <Link
              href="/menu"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 hover:bg-white/10 hover:text-white transition"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-brand-500" />
              <span>المنيو</span>
            </Link>
            <Link
              href="/#best"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 hover:bg-white/10 hover:text-white transition"
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>الأكثر مبيعاً</span>
            </Link>
            <Link
              href="/#zones"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 hover:bg-white/10 hover:text-white transition"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>مناطق التوصيل</span>
            </Link>
            <Link
              href="/#location"
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 hover:bg-white/10 hover:text-white transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>الفروع والتواصل</span>
            </Link>
          </nav>

          {/* 3. الإجراءات: كارت VIP + سلة الطلبات + القائمة للموبايل */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* زر بطاقة الأسد VIP */}
            <button
              type="button"
              onClick={() => setVipOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-xs font-black text-amber-300 transition cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">بطاقة الأسد VIP</span>
            </button>

            {/* زر سلة الطلبات مع عداد الأصناف */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 px-4 py-2 text-xs font-black text-white shadow-xl glow-brand transition active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">السلة</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-carbon-950 font-black text-[10px] grid place-items-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* زر قائمة الموبايل */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid lg:hidden w-10 h-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80 hover:text-white transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* قائمة الموبايل المنسدلة */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-white/10 bg-carbon-950/95 backdrop-blur-2xl px-6 py-6 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-white/5"
            >
              الرئيسية
            </Link>
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-white/5"
            >
              قائمة الطعام (المنيو)
            </Link>
            <Link
              href="/#best"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-white/5"
            >
              الأكثر طلباً ومبيعاً 🔥
            </Link>
            <Link
              href="/#zones"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-white/5"
            >
              مناطق وأسعار التوصيل 🛵
            </Link>
            <Link
              href="/#location"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-xl p-2.5 text-sm font-bold text-white hover:bg-white/5"
            >
              الفرع والاتصال المباشر 📞
            </Link>
          </div>
        )}
      </header>

      {/* نافذة بطاقة كارت الأسد VIP المنبثقة */}
      <CustomerQRCode open={vipOpen} onClose={() => setVipOpen(false)} />
    </>
  );
}
