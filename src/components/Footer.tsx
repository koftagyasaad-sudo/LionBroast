"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone, MessageSquare, ShieldCheck } from "lucide-react";
import type { FrontendSettings } from "@/lib/types";

interface FooterProps {
  settings?: FrontendSettings;
}

export default function Footer({ settings }: FooterProps) {
  const brandName = settings?.brandNameAr || "بروست الأسد";
  const address = settings?.addressAr || "دسوق - شارع الجلاء - بجوار مسجد الإبراهيمي";
  const workingHours = settings?.workingHoursAr || "يومياً من 12 ظهراً حتى 2 صباحاً";
  const hotline = settings?.hotline || "01000000000";
  const whatsapp = settings?.whatsapp || "201000000000";
  const footerText = settings?.footerTextAr || "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر.";

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-amber-500/40">
                  <Image src={settings.logoUrl} alt={brandName} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg">
                  🦁
                </div>
              )}
              <span className="font-extrabold text-xl text-amber-500">{brandName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">{footerText}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>جميع الوجبات تُحضر يومياً طازجة 100% بأعلى معايير الجودة</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-base mb-2 border-r-2 border-amber-500 pr-2">روابط السريعة</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-amber-400 transition-colors">
                  قائمة الطعام
                </Link>
              </li>
              <li>
                <Link href="/pass" className="hover:text-amber-400 transition-colors">
                  كارت الولاء
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-amber-400 transition-colors">
                  تتبع طلبك
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 text-base mb-2 border-r-2 border-amber-500 pr-2">تواصل معنا</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href={`tel:${hotline}`} className="hover:text-amber-400 dir-ltr">{hotline}</a>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">
                  واتساب الخدمة
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {brandName}. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <span>توصيل سريع داخل دسوق</span>
            <span>•</span>
            <span>طعم أسدي أصلي</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
