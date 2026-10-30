"use client";

import { MapPin, Clock, Phone, ExternalLink } from "lucide-react";

export default function LocationBlock({ frontend }: { frontend?: any }) {
  const branchName = frontend?.brandNameAr || "بروست الأسد - دسوق";
  const address =
    frontend?.addressAr ||
    "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية";
  const hours = frontend?.workingHoursAr || "يومياً من 10 صباحا حتى 4 فجرا";
  const phone = frontend?.hotline || "0248813666";
  const mapsUrl =
    frontend?.branchMapsUrl ||
    frontend?.branch_maps_url ||
    "https://maps.google.com/?q=دسوق+شارع+الجيش";

  return (
    <section id="contact" className="py-16 bg-carbon-950 text-white" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-black">شرفنا في فرع بروست الأسد 🦁</h2>
          <p className="mt-2 text-white/60 text-sm">
            نقدم لك أعلى جودة وأسرع خدمة تيك واي ودليفري في دسوق والمناطق المجاورة.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-8 flex flex-col justify-between backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="grid size-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-500 ring-2 ring-brand-500/30">
                <MapPin className="size-7" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">{branchName}</h3>
                <p className="text-sm text-white/60 mt-1">{address}</p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/10 hover:bg-brand-500 hover:text-white px-6 py-4 text-base font-extrabold text-white transition shadow-xl border border-white/15"
              >
                <ExternalLink className="size-5" />
                <span>عرض الاتجاهات على Google Maps</span>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-carbon-900/40 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Clock className="size-6 text-amber-400" />
                <div>
                  <div className="text-xs text-white/40 font-bold">مواعيد العمل</div>
                  <div className="text-base font-extrabold mt-0.5">{hours}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-carbon-900/40 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Phone className="size-6 text-emerald-400" />
                <div>
                  <div className="text-xs text-white/40 font-bold">رقم الدليفري والطلبات</div>
                  <div className="text-base font-extrabold mt-0.5">{phone}</div>
                </div>
              </div>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-cheese-400 hover:bg-cheese-500 text-carbon-950 font-black py-4 px-6 text-base transition shadow-lg"
            >
              <span>افتح الموقع على خرائط جوجل 📍</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
