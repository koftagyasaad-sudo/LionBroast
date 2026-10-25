"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu as MenuIcon, X, Phone, Flame } from "lucide-react";
import type { ZoneDTO, Promo, FrontendSettings } from "@/lib/types";

interface HeaderProps {
  zones?: ZoneDTO[];
  promo?: Promo | null;
  settings?: FrontendSettings;
}

export default function Header({ promo, settings }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = settings?.brandNameAr || "بروست الأسد";
  const hotline = settings?.hotline || "01000000000";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Promo Bar */}
      {promo && promo.enabled && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 text-xs md:text-sm py-1.5 px-4 font-bold text-center flex items-center justify-center gap-2 shadow-inner">
          <Flame className="w-4 h-4 animate-bounce text-slate-950" />
          <span>{promo.textAr || promo.title}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            {settings?.logoUrl ? (
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/50 group-hover:border-amber-400 transition-all shadow-lg shadow-amber-500/10">
                <Image
                  src={settings.logoUrl}
                  alt={brandName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                🦁
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-extrabold text-xl md:text-2xl text-amber-500 tracking-tight group-hover:text-amber-400 transition-colors">
                {brandName}
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 font-semibold tracking-wider">
                DESOUK ORIGINAL
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-300">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              الرئيسية
            </Link>
            <Link href="/menu" className="hover:text-amber-400 transition-colors">
              قائمة الطعام
            </Link>
            <Link href="/pass" className="hover:text-amber-400 transition-colors">
              بطاقة الولاء
            </Link>
            <Link href="/track" className="hover:text-amber-400 transition-colors">
              تتبع الطلب
            </Link>
          </nav>

          {/* Contact & Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={`tel:${hotline}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold hover:bg-slate-800 transition-colors text-sm"
            >
              <Phone className="w-4 h-4 text-amber-500" />
              <span>{hotline}</span>
            </a>
            <Link
              href="/menu"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>اطلب الآن</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 font-semibold hover:text-amber-400"
          >
            الرئيسية
          </Link>
          <Link
            href="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 font-semibold hover:text-amber-400"
          >
            قائمة الطعام
          </Link>
          <Link
            href="/pass"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 font-semibold hover:text-amber-400"
          >
            بطاقة الولاء
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 font-semibold hover:text-amber-400"
          >
            تتبع الطلب
          </Link>

          <div className="pt-4 border-t border-slate-900 flex flex-col gap-3">
            <a
              href={`tel:${hotline}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>اتصل بنا: {hotline}</span>
            </a>
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-slate-950 font-black"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>عرض المنيو والطلب</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
