"use client";

import { useState } from "react";
import { MapPin, Clock, Search, Bike, Sparkles } from "lucide-react";

interface ZoneItem {
  id: string | number;
  nameAr?: string;
  name?: string;
  fee?: number;
  price?: number;
  estimatedMinutes?: number;
}

interface ZonesSectionProps {
  zones?: ZoneItem[];
  deliveryZones?: ZoneItem[];
  settings?: any;
}

export default function ZonesSection({ zones, deliveryZones }: ZonesSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const rawList = zones || deliveryZones || [];
  const fallbackZones: ZoneItem[] = [
    { id: 1, nameAr: "دسوق - وسط البلد وشارع الجيش", fee: 15, estimatedMinutes: 25 },
    { id: 2, nameAr: "دسوق - منطقة المستشفى والمحطة", fee: 15, estimatedMinutes: 25 },
    { id: 3, nameAr: "دسوق - حي الكشلة والميدان الإبراهيمي", fee: 15, estimatedMinutes: 30 },
    { id: 4, nameAr: "دسوق - دحروج وقرى الساحل", fee: 20, estimatedMinutes: 35 },
    { id: 5, nameAr: "القرى والمناطق المجاورة لدسوق", fee: 25, estimatedMinutes: 40 },
  ];

  const currentList = rawList.length > 0 ? rawList : fallbackZones;

  const filtered = currentList.filter((z) => {
    const name = String(z.nameAr || z.name || "").toLowerCase();
    return name.includes(searchTerm.trim().toLowerCase());
  });

  return (
    <section className="py-20 bg-carbon-950 text-white relative overflow-hidden" dir="rtl">
      {/* إضاءات خلفية هادئة */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 size-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
        {/* عنوان السكشن */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-400">
            <Bike className="size-4" />
            <span>خدمة التوصيل السريع لجميع أنحاء دسوق</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            مناطق وأسعار التوصيل 🛵
          </h2>

          <p className="text-sm md:text-base text-white/60">
            طلبك بيوصلك سخن ومقرمش في أسرع وقت لحد باب بيتك في دسوق والمناطق المحيطة بها.
          </p>

          {/* شريط البحث المباشر في المناطق */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن منطقتك أو قريتك..."
                className="w-full rounded-2xl border border-white/15 bg-carbon-900/80 px-11 py-3.5 text-sm font-semibold text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none transition shadow-lg backdrop-blur-md"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            </div>
          </div>
        </div>

        {/* شبكة كروت المناطق (بالعربي فقط) */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((zone, idx) => {
              const displayName = String(zone.nameAr || zone.name || "منطقة دسوق").trim();
              const price = Number(zone.fee ?? zone.price ?? 15);
              const minutes = Number(zone.estimatedMinutes ?? 30);

              return (
                <div
                  key={zone.id || idx}
                  className="group relative rounded-2xl border border-white/10 bg-carbon-900/50 p-6 transition duration-300 hover:border-brand-500/50 hover:bg-carbon-900/80 hover:-translate-y-1 shadow-lg backdrop-blur-md flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-xl bg-brand-500/15 text-brand-500 ring-1 ring-brand-500/30 group-hover:scale-110 transition">
                        <MapPin className="size-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition">
                        {displayName}
                      </h3>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-xl font-black text-amber-400">{price}</span>
                      <span className="text-xs font-bold text-white/60 mr-1">ج.م</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-white/50">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Clock className="size-3.5" />
                      <span>{minutes} دقيقة تقريباً</span>
                    </div>
                    <span className="text-[11px] text-white/40">توصيل ساخن ومباشر</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-carbon-900/30 p-12 text-center max-w-md mx-auto">
            <Sparkles className="size-8 text-brand-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">لم يتم العثور على منطقة بهذا الاسم</p>
            <p className="text-xs text-white/40 mt-1">
              نوصل لجميع أنحاء دسوق والقرى المجاورة، كلمنا على الخط الساخن للتأكيد!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
