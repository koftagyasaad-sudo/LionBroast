"use client";

import Link from "next/link";
import {
  MapPin,
  Clock,
  PhoneCall,
  Navigation,
  MessageCircle,
} from "lucide-react";

interface LocationBlockProps {
  frontend?: any;
  settings?: any;
}

export default function LocationBlock({ frontend, settings }: LocationBlockProps) {
  const current = frontend || settings || {};

  const address =
    current.addressAr ||
    current.address_ar ||
    "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية";

  const workingHours =
    current.workingHoursAr ||
    current.working_hours_ar ||
    "يومياً من 10 صباحا حتى 4 فجرا";

  const hotline = current.hotline || "0248813666";
  const whatsapp = current.whatsapp || "201034419424";
  const branchMapsUrl =
    current.branchMapsUrl ||
    current.branch_maps_url ||
    "https://maps.google.com/?q=دسوق+شارع+الجيش";

  const ctaTitle = current.ctaTitleAr || current.cta_title_ar || "جوعان؟ الأسد مستنيك.";
  const ctaSubtitle =
    current.ctaSubtitleAr ||
    current.cta_subtitle_ar ||
    "اطلب على واتساب لسرعه التواصل والطلبات – أو كلمنا على الخط الساخن والفرن يولّع على طول.";

  return (
    <section id="location" className="py-14 bg-zinc-950 text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-12">
        
        {/* 1. تفاصيل الفرع والعنوان في دسوق */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 md:p-12 shadow-2xl backdrop-blur-xl">
          <div className="max-w-2xl space-y-3 mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-black text-orange-400">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>مركز الاتصال والتواصل المباشر</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              شرفنا في فرع بروست الأسد 🦁
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-semibold leading-relaxed">
              نقدم لك أعلى جودة وأسرع خدمة تيك واي ودليفري في دسوق والمناطق المجاورة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-2">
              <div className="flex items-center gap-2 text-orange-500 font-black text-sm">
                <MapPin className="w-4 h-4" />
                <span>العنوان واللوكيشن</span>
              </div>
              <p className="text-xs font-bold text-zinc-300 leading-relaxed">
                {address}
              </p>
              <div className="pt-2">
                <a
                  href={branchMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>الموقع على Google Maps 📍</span>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-2">
              <div className="flex items-center gap-2 text-orange-500 font-black text-sm">
                <Clock className="w-4 h-4" />
                <span>مواعيد العمل واستقبال الطلبات</span>
              </div>
              <p className="text-xs font-bold text-zinc-300 leading-relaxed">
                {workingHours}
              </p>
              <span className="inline-block rounded-full bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 text-[10px] font-black">
                مفتوح الآن لخدمتكم ⚡
              </span>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 space-y-2">
              <div className="flex items-center gap-2 text-orange-500 font-black text-sm">
                <PhoneCall className="w-4 h-4" />
                <span>أرقام الدليفري والطلبات</span>
              </div>
              <div className="text-base font-black text-amber-400 font-mono" dir="ltr">
                {hotline}
              </div>
              <p className="text-[11px] text-zinc-400 font-bold">
                توصيل سريع ساخن لحد باب بيتك في دسوق والقرى المجاورة.
              </p>
            </div>
          </div>
        </div>

        {/* 2. بانر الطلب والواتساب (تم تأمين مقاس الماسكوت بحيث لا يتعدى 120px نهائياً) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-8 md:p-10 shadow-2xl text-white">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* النصوص وأزرار التواصل */}
            <div className="max-w-xl space-y-3 text-center md:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/30 px-3.5 py-1 text-xs font-black text-amber-300 border border-white/10">
                BROAST EL-ASSAD
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                {ctaTitle}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-white/90 leading-relaxed">
                {ctaSubtitle}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("مرحباً بروست الأسد، أرغب في طلب أوردر دليفري 🍗")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-xs sm:text-sm font-black text-zinc-950 shadow-xl transition hover:bg-amber-100 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>اطلب على WhatsApp فوراً</span>
                </a>
                <a
                  href={`tel:${hotline}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-black/30 hover:bg-black/50 px-6 py-3.5 text-xs sm:text-sm font-black text-white transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{hotline}</span>
                </a>
              </div>
            </div>

            {/* صورة الماسكوت محكومة بأبعاد صارمة تمنع تضخمها نهائياً */}
            <div
              className="shrink-0 rounded-2xl bg-black/20 border border-white/20 p-2 flex items-center justify-center shadow-xl"
              style={{
                width: "120px",
                height: "120px",
                minWidth: "120px",
                maxWidth: "120px",
                maxHeight: "120px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/icon-512.png"
                alt="بروست الأسد"
                width={100}
                height={100}
                style={{
                  width: "100px",
                  height: "100px",
                  maxWidth: "100px",
                  maxHeight: "100px",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
