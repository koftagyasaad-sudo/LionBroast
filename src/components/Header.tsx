"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShoppingBag,
  Award,
  Menu,
  X,
  Moon,
  Globe,
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
        className="fixed top-0 inset-x-0 z-50 h-20 bg-carbon-950/85 backdrop-blur-md border-b border-white/10"
        dir="rtl"
      >
        <div className="mx-auto max-w-7xl h-full px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* الشعار واسم المطعم (اليمين) */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="size-11 rounded-2xl overflow-hidden bg-brand-500/10 border border-brand-500/30 p-1 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={brandNameAr}
                className="size-full object-contain rounded-xl"
              />
            </div>

            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg text-white group-hover:text-brand-400 transition tracking-tight">
                {brandNameAr}
              </span>
              <span className="text-[10px] font-black text-amber-400 tracking-wider font-mono">
                {brandNameEn}
              </span>
            </div>
          </Link>

          {/* أزرار الإجراءات اليسار (مطابقة تماماً للصورة) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* زر اللغة */}
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-bold text-white/80 transition cursor-pointer"
            >
              <Globe className="size-3.5 text-white/60" />
              <span>English</span>
            </button>

            {/* زر الدارك مود / القمر */}
            <button
              type="button"
              className="grid size-9 place-items-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 transition cursor-pointer"
              title="تغيير المظهر"
            >
              <Moon className="size-4 text-amber-400" />
            </button>

            {/* زر بطاقة الأسد VIP */}
            <button
              type="button"
              onClick={() => setVipOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-xs font-black text-amber-300 transition cursor-pointer"
            >
              <Award className="size-4 text-amber-400" />
              <span className="hidden sm:inline">بطاقة الأسد VIP</span>
            </button>

            {/* زر سلة الطلبات البرتقالي */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative grid size-10 place-items-center rounded-2xl bg-brand-500 hover:bg-brand-600 text-white shadow-xl glow-brand transition active:scale-95 cursor-pointer"
              title="السلة"
            >
              <ShoppingBag className="size-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 size-5 rounded-full bg-white text-carbon-950 font-black text-[10px] grid place-items-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* زر قائمة الموبايل */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/80 hover:text-white transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* قائمة الموبايل */}
        {mobileMenuOpen && (
          <div className="border-b border-white/10 bg-carbon-950/95 backdrop-blur-2xl px-6 py-6 space-y-3">
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
