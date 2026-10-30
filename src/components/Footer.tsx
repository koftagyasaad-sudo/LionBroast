"use client";

import Link from "next/link";
import { MapPin, Clock, Phone, MessageCircle, ShieldCheck } from "lucide-react";

export default function Footer({ frontend, settings }: { frontend?: any; settings?: any }) {
  const data = frontend || settings || {};
  const logoUrl = data.logoUrl || data.logo_url || "/img/icon-512.png";
  const brandName = data.brandNameAr || data.brand_name_ar || "بروست الأسد";
  const address = data.addressAr || data.address_ar || "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية";
  const workingHours = data.workingHoursAr || data.working_hours_ar || "يومياً من 10 صباحا حتى 4 فجرا";
  const hotline = data.hotline || "0248813666";
  const whatsapp = data.whatsapp || "201034419424";
  const aboutText =
    data.footerAboutAr ||
    data.footer_about_ar ||
    "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر.";
  const copyrightText =
    data.footerCopyrightAr ||
    data.footer_copyright_ar ||
    "© 2026 بروست الأسد . جميع الحقوق محفوظة.";
  const sloganText =
    data.footerSloganAr ||
    data.footer_slogan_ar ||
    "توصيل سريع داخل دسوق • طعم أسدي أصلي";

  return (
    <footer className="border-t border-white/10 bg-carbon-950 text-white pt-16 pb-12" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & About */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={brandName} className="size-12 rounded-2xl object-cover ring-2 ring-brand-500/60 shadow-lg" />
              <div>
                <h3 className="text-xl font-extrabold text-white">{brandName}</h3>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-400">BROAST EL-ASSAD</span>
              </div>
            </div>

            <p className="text-xs text-white/60 leading-relaxed max-w-md">
              {aboutText}
            </p>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="size-3.5" />
              <span>جميع الوجبات تُحضر يومياً طازجة 100% بأعلى معايير الجودة</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold border-r-2 border-brand-500 pr-2">روابط سريعة</h4>
            <ul className="space-y-2 text-xs font-semibold text-white/60">
              <li>
                <Link href="/" className="hover:text-amber-400 transition">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-amber-400 transition">
                  قائمة الطعام
                </Link>
              </li>
              <li>
                <Link href="/pass" className="hover:text-amber-400 transition">
                  كارت الولاء VIP
                </Link>
              </li>
              <li>
                <Link href="/#zones" className="hover:text-amber-400 transition">
                  مناطق التوصيل
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold border-r-2 border-brand-500 pr-2">تواصل معنا</h4>
            <div className="space-y-2.5 text-xs text-white/60">
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-brand-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-amber-400 shrink-0" />
                <span>{workingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-emerald-400 shrink-0" />
                <a href={`tel:${hotline}`} dir="ltr" className="font-bold text-white hover:text-amber-400">
                  {hotline}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="size-4 text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-400 hover:underline"
                >
                  واتساب الخدمة
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-white/50">
          <p>{copyrightText}</p>
          <p className="text-amber-400/80">{sloganText}</p>
        </div>
      </div>
    </footer>
  );
}
