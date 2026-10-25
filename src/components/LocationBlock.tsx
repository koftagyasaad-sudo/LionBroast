"use client";

import React from "react";

interface LocationBlockProps {
  settings?: Record<string, any> | null;
}

export default function LocationBlock({ settings }: LocationBlockProps) {
  const address =
    settings?.addressAr ||
    settings?.address ||
    settings?.branchAddress ||
    "دسوق - كفر الشيخ، جمهورية مصر العربية";

  const phone =
    settings?.phone ||
    settings?.hotline ||
    settings?.contactPhone ||
    settings?.whatsappNumber ||
    "";

  const workingHours =
    settings?.workingHoursAr ||
    settings?.workingHours ||
    settings?.openHours ||
    "يومياً من 11:00 صباحاً حتى 3:00 فجراً";

  const mapUrl =
    settings?.mapUrl ||
    settings?.googleMapsUrl ||
    "https://maps.google.com/?q=Desouk,Egypt";

  return (
    <section
      dir="rtl"
      className="rounded-3xl bg-neutral-900 text-white p-8 md:p-12 shadow-xl border border-neutral-800"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-sm font-bold text-amber-400 border border-amber-500/20">
            <span>📍</span>
            <span>موقعنا وفروعنا</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            شرفنا في فرع بروست الأسد 🦁
          </h2>

          <p className="text-neutral-400 text-base leading-relaxed">
            بنقدملك أعلى جودة وأسرع خدمة تيك أواي ودليفري في دسوق والمناطق المجاورة.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-4 rounded-2xl bg-neutral-800/60 p-4 border border-neutral-700/50">
              <span className="text-2xl">🏢</span>
              <div>
                <h3 className="font-bold text-amber-400 text-sm">العنوان</h3>
                <p className="text-neutral-200 font-medium mt-1">{address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl bg-neutral-800/60 p-4 border border-neutral-700/50">
              <span className="text-2xl">⏰</span>
              <div>
                <h3 className="font-bold text-amber-400 text-sm">مواعيد العمل</h3>
                <p className="text-neutral-200 font-medium mt-1">{workingHours}</p>
              </div>
            </div>

            {phone && (
              <div className="flex items-start gap-4 rounded-2xl bg-neutral-800/60 p-4 border border-neutral-700/50">
                <span className="text-2xl">📞</span>
                <div>
                  <h3 className="font-bold text-amber-400 text-sm">رقم الدليفري والطلبات</h3>
                  <a
                    href={`tel:${phone}`}
                    dir="ltr"
                    className="inline-block text-neutral-200 font-bold mt-1 hover:text-amber-400 transition-colors"
                  >
                    {phone}
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-6 py-3.5 font-bold text-neutral-950 shadow-lg hover:bg-amber-400 transition-all"
            >
              <span>افتح الموقع على خرائط جوجل</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* بلوك الخريطة التفاعلي */}
        <div className="relative h-72 md:h-96 w-full overflow-hidden rounded-2xl bg-neutral-800 border border-neutral-700 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-white mb-2">بروست الأسد - دسوق</h3>
          <p className="text-neutral-400 text-sm max-w-md mb-6">
            {address}
          </p>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white/10 hover:bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all border border-white/10"
          >
            عرض الاتجاهات على Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
