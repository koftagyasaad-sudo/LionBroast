"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  Radio,
  PhoneCall,
  Sparkles,
  Wifi,
} from "lucide-react";

export default function LocationBlock({ frontend, settings }: { frontend?: any; settings?: any }) {
  const [imgError, setImgError] = useState(false);
  const data = frontend || settings || {};

  // بيانات الفرع واللوكيشن
  const branchTitle = data.locationTitleAr || data.location_title_ar || "شرفنا في فرع بروست الأسد 🦁";
  const branchSubtitle =
    data.locationSubtitleAr ||
    data.location_subtitle_ar ||
    "نقدم لك أعلى جودة وأسرع خدمة تيك واي ودليفري في دسوق والمناطق المجاورة.";
  const branchName = data.brandNameAr || data.brand_name_ar || "بروست الأسد";
  const address =
    data.addressAr ||
    data.address_ar ||
    "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية";
  const workingHours = data.workingHoursAr || data.working_hours_ar || "يومياً من 10 صباحا حتى 4 فجرا";
  const mapsUrl =
    data.branchMapsUrl ||
    data.branch_maps_url ||
    "https://maps.google.com/?q=دسوق+شارع+الجيش";

  // بيانات الطلب السريع والواتساب
  const ctaTitle = data.ctaTitleAr || data.cta_title_ar || "جوعان؟ الأسد مستنيك.";
  const ctaSubtitle =
    data.ctaSubtitleAr ||
    data.cta_subtitle_ar ||
    "اطلب على واتساب في ٣٠ ثانية – أو كلم الخط الساخن والفرن يولّع على طول.";
  const hotline = data.hotline || "0248813666";
  const rawWhatsapp = data.whatsapp || "201034419424";
  const cleanWhatsapp = String(rawWhatsapp).replace(/\D/g, "");
  const logoUrl = data.logoUrl || data.logo_url;

  return (
    <section id="contact" className="py-20 relative overflow-hidden" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
        {/* الحاوية الكبرى المدمجة باللون البرتقالي المميز وخلفية الاتصال */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/30 bg-gradient-to-br from-orange-600 via-brand-600 to-amber-700 p-8 md:p-12 shadow-2xl text-white">
          
          {/* تأثيرات ونقوش تعبر عن شبكات الاتصال والتواصل وموجات الصوت */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
          
          {/* موجات رادار وشبكة اتصال دائرية في الخلفية */}
          <div className="absolute -top-24 -left-24 size-96 rounded-full border border-white/20 pointer-events-none animate-pulse" />
          <div className="absolute -top-12 -left-12 size-72 rounded-full border border-white/25 pointer-events-none" />
          
          <div className="absolute -bottom-24 -right-24 size-96 rounded-full border border-white/20 pointer-events-none" />

          {/* أيقونات اتصال خافتة معبرة في الخلفية */}
          <div className="absolute top-8 left-12 opacity-15 pointer-events-none hidden md:block">
            <Radio className="size-24 text-white animate-pulse" />
          </div>
          <div className="absolute bottom-8 right-12 opacity-15 pointer-events-none hidden md:block">
            <Wifi className="size-24 text-white" />
          </div>

          {/* الرأس الترويجي الموحد */}
          <div className="text-center max-w-3xl mx-auto mb-12 relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/20 backdrop-blur-md px-4 py-1.5 text-xs font-black text-amber-200 shadow-sm">
              <PhoneCall className="size-3.5 text-amber-300 animate-bounce" />
              <span>مركز الاتصال والتواصل المباشر 📞</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
              {branchTitle}
            </h2>

            <p className="text-sm md:text-base font-semibold text-white/90 leading-relaxed drop-shadow-sm max-w-2xl mx-auto">
              {branchSubtitle}
            </p>
          </div>

          {/* الشبكة المدمجة: تفاصيل الفرع على جانب، وطلب الواتساب السريع على الجانب الآخر */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative z-10">
            
            {/* الجزء الأول: بيانات الفرع وموقع خرائط Google Maps */}
            <div className="rounded-3xl border border-white/20 bg-black/35 backdrop-blur-xl p-7 flex flex-col justify-between shadow-xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/20 text-white ring-2 ring-white/30 shadow-md">
                    <MapPin className="size-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{branchName}</h3>
                    <p className="text-xs text-white/80 mt-1 leading-relaxed">{address}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 flex items-center gap-3.5">
                  <Clock className="size-5 text-amber-300 shrink-0" />
                  <div>
                    <span className="text-[10px] text-white/60 font-bold block">مواعيد العمل واستقبال الطلبات</span>
                    <span className="text-xs font-black text-white">{workingHours}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 flex items-center gap-3.5">
                  <Phone className="size-5 text-emerald-300 shrink-0" />
                  <div>
                    <span className="text-[10px] text-white/60 font-bold block">رقم الدليفري والطلبات</span>
                    <a href={`tel:${hotline}`} dir="ltr" className="text-sm font-black text-white hover:text-amber-300 transition">
                      {hotline}
                    </a>
                  </div>
                </div>
              </div>

              {/* أزرار خرائط جوجل */}
              <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 py-3.5 px-4 text-xs font-black text-white transition shadow-md"
                >
                  <ExternalLink className="size-4 text-amber-300" />
                  <span>عرض الاتجاهات</span>
                </a>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-300 py-3.5 px-4 text-xs font-black text-carbon-950 transition shadow-lg"
                >
                  <MapPin className="size-4" />
                  <span>الموقع على Google Maps 📍</span>
                </a>
              </div>
            </div>

            {/* الجزء الثاني: بانر الطلب السريع والواتساب (جوعان؟ الأسد مستنيك) */}
            <div className="rounded-3xl border border-white/20 bg-black/35 backdrop-blur-xl p-7 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-4">
                  {/* الشعار المعتمد */}
                  <div className="size-20 shrink-0 rounded-2xl overflow-hidden border-2 border-white/30 bg-black/40 flex items-center justify-center shadow-lg p-1.5">
                    {logoUrl && !imgError ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoUrl}
                        alt="Broast El-Assad"
                        onError={() => setImgError(true)}
                        className="size-full rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-4xl select-none">🦁</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                      BROAST EL-ASSAD
                    </span>
                    <h3 className="text-2xl font-black text-white mt-0.5">{ctaTitle}</h3>
                  </div>
                </div>

                <p className="mt-4 text-xs font-semibold text-white/85 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/10">
                  {ctaSubtitle}
                </p>
              </div>

              {/* أزرار الاتصال السريع */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("مرحباً بروست الأسد، حابب أطلب أوردر 🍗")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 py-4 px-6 text-sm font-black text-white shadow-xl transition"
                >
                  <MessageCircle className="size-5 fill-current" />
                  <span>اطلب على WhatsApp فوراً</span>
                </a>

                <a
                  href={`tel:${hotline}`}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-white text-carbon-950 hover:bg-amber-100 active:scale-95 py-4 px-6 text-sm font-black shadow-xl transition"
                >
                  <Phone className="size-4 text-brand-600" />
                  <span dir="ltr">{hotline}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
