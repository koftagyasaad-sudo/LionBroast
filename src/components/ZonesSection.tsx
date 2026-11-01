"use client";

import { MapPin, Clock, Bike, ShieldCheck, Sparkles } from "lucide-react";

interface ZonesSectionProps {
  zones?: any[];
  deliveryZones?: any[];
  settings?: any;
}

export default function ZonesSection({ zones, deliveryZones, settings }: ZonesSectionProps) {
  // دمج وقراءة المناطق سواء جاءت من الجدول المباشر أو من إعدادات الواجهة
  const rawList =
    (zones && zones.length > 0 ? zones : null) ||
    (deliveryZones && deliveryZones.length > 0 ? deliveryZones : null) ||
    (settings?.delivery_zones && Array.isArray(settings.delivery_zones)
      ? settings.delivery_zones
      : null);

  const defaultZones = [
    { nameAr: "وسط البلد - شارع الجيش والميدان", deliveryFee: 10, estimatedMinutes: "20-30 دقيقة" },
    { nameAr: "محيط مستشفى النيل ودرويش", deliveryFee: 10, estimatedMinutes: "20-30 دقيقة" },
    { nameAr: "شارع الشركات والكورنيش", deliveryFee: 15, estimatedMinutes: "25-35 دقيقة" },
    { nameAr: "طريق فوة والقرى المجاورة", deliveryFee: 25, estimatedMinutes: "35-45 دقيقة" },
  ];

  const list = rawList && rawList.length > 0 ? rawList : defaultZones;

  return (
    <section id="zones" className="py-16 bg-carbon-950 text-white border-t border-white/5" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-8">
        
        {/* رأس السكشن */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-400">
              <Bike className="size-3.5 text-emerald-400" />
              <span>خدمة الدليفري السريع في دسوق</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              مناطق وأسعار التوصيل الميداني 🛵
            </h2>
            <p className="text-xs sm:text-sm text-white/60 font-medium">
              نوصلك طلبك ساخن ومقرمش لأي مكان في دسوق والمناطق والقرى المجاورة في أسرع وقت.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-bold text-amber-400 w-fit">
            <Sparkles className="size-4" />
            <span>توصيل فوري من 10 صباحاً حتى 4 فجراً</span>
          </div>
        </div>

        {/* شبكة كروت مناطق التوصيل */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {list.map((z: any, idx: number) => {
            const fee = Number(z.deliveryFee || z.fee || 0);
            const name = z.nameAr || z.name || "منطقة دسوق";
            const time = z.estimatedMinutes || z.time || "25-35 دقيقة";

            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-carbon-900 to-carbon-950 p-6 shadow-xl hover:border-brand-500/40 transition duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="size-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-105 transition">
                    <MapPin className="size-5" />
                  </div>
                  <h3 className="text-base font-black text-white group-hover:text-brand-400 transition leading-snug">
                    {name}
                  </h3>
                </div>

                <div className="pt-6 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white/60">
                    <Clock className="size-3.5 text-amber-400" />
                    <span>{time}</span>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-emerald-400">{fee}</span>
                    <span className="text-[10px] font-bold text-white/40">ج.م</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* شريط الضمان والتأكيد */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-white/60 text-center">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>تغليف حراري مخصص للحفاظ على قرمشة وسخونة البروست</span>
          </span>
          <span className="text-white/20 hidden sm:inline">•</span>
          <span>لطلب الدليفري الفوري كلمنا على: <strong className="text-amber-400 font-mono" dir="ltr">0248813666</strong></span>
        </div>

      </div>
    </section>
  );
}
