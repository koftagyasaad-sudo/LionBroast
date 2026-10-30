"use client";

import { useState } from "react";
import { MapPin, Clock, Search, Bike, Sparkles, Navigation, ShieldCheck } from "lucide-react";

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
    <section
      id="zones"
      className="py-24 relative overflow-hidden bg-gradient-to-b from-stone-950 via-zinc-900 to-stone-950 text-white border-y border-brand-500/20"
      dir="rtl"
    >
      {/* خلفية معبرة عن خريطة ومسارات الدليفري */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* دوائر ضوئية لمسارات التوصيل السريع */}
      <div className="absolute -top-32 right-10 size-96 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-10 size-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* خطوط تعبيرية لشوارع وسكوتر دليفري في الخلفية */}
      <div className="absolute top-1/2 -right-16 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block text-brand-500">
        <Bike className="size-96" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 relative z-10">
        {/* عنوان السكشن */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/15 px-4 py-1.5 text-xs font-black text-brand-400 shadow-sm">
            <Bike className="size-4 animate-bounce" />
            <span>أسطول دليفري بروست الأسد السريع في خدمتك 🛵</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-md">
            مناطق وأسعار التوصيل 📍
          </h2>

          <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto leading-relaxed">
            طلبك بيوصلك سخن مولع ومقرمش في أسرع وقت لحد باب بيتك في دسوق والمناطق المحيطة بها بأفضل تسعيرة.
          </p>

          {/* شريط البحث المباشر في المناطق */}
          <div className="pt-4 max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن منطقتك أو قريتك في دسوق..."
                className="w-full rounded-2xl border border-white/20 bg-black/60 px-11 py-3.5 text-sm font-bold text-white placeholder:text-white/40 focus:border-brand-500 focus:outline-none transition shadow-2xl backdrop-blur-md"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-brand-400" />
            </div>
          </div>
        </div>

        {/* شبكة كروت المناطق */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((zone, idx) => {
              const displayName = String(zone.nameAr || zone.name || "منطقة دسوق").trim();
              const price = Number(zone.fee ?? zone.price ?? 15);
              const minutes = Number(zone.estimatedMinutes ?? 25);

              return (
                <div
                  key={zone.id || idx}
                  className="group relative rounded-3xl border border-white/10 bg-zinc-950/80 p-6 transition duration-300 hover:border-brand-500/60 hover:bg-black/90 hover:-translate-y-1.5 shadow-xl backdrop-blur-md flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="grid size-12 place-items-center rounded-2xl bg-brand-500/20 text-brand-400 ring-2 ring-brand-500/30 group-hover:scale-110 transition shadow-inner">
                        <MapPin className="size-6" />
                      </div>
                      <h3 className="text-base font-extrabold text-white group-hover:text-amber-400 transition leading-snug">
                        {displayName}
                      </h3>
                    </div>

                    <div className="text-left shrink-0">
                      <span className="text-2xl font-black text-amber-400">{price}</span>
                      <span className="text-xs font-bold text-white/60 mr-1">ج.م</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Clock className="size-4" />
                      <span>{minutes} دقيقة تقريباً</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-brand-400 font-semibold">
                      <Navigation className="size-3" />
                      <span>توصيل مباشر</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-black/40 p-12 text-center max-w-md mx-auto">
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
