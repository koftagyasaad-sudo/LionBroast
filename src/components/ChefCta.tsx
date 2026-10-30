"use client";

import { useState } from "react";
import { MessageCircle, Phone } from "lucide-react";

interface ChefCtaProps {
  frontend?: any;
  settings?: any;
}

export default function ChefCta({ frontend, settings }: ChefCtaProps) {
  const [imgError, setImgError] = useState(false);

  const data = frontend || settings || {};
  const logoUrl = data.logoUrl || data.logo_url;
  const title = data.ctaTitleAr || data.cta_title_ar || "جوعان؟ الأسد مستنيك.";
  const subtitle =
    data.ctaSubtitleAr ||
    data.cta_subtitle_ar ||
    "اطلب على واتساب في ٣٠ ثانية – أو كلم الخط الساخن والفرن يولّع على طول.";
  const hotline = data.hotline || "0248813666";
  const rawWhatsapp = data.whatsapp || "201034419424";
  const cleanWhatsapp = String(rawWhatsapp).replace(/\D/g, "");

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-8" dir="rtl">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-carbon-950 via-carbon-900 to-amber-950/40 p-6 md:p-10 shadow-2xl">
        <div className="flex flex-col-reverse items-center justify-between gap-8 md:flex-row">
          {/* Action Buttons */}
          <div className="flex w-full flex-col gap-3 sm:w-auto">
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("مرحباً بروست الأسد، حابب أطلب أوردر 🍗")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="size-5 fill-current" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:${hotline}`}
              className="flex items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Phone className="size-4 text-brand-400" />
              <span dir="ltr">{hotline}</span>
            </a>
          </div>

          {/* Texts */}
          <div className="text-center md:text-right flex-1 md:px-8">
            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-400">
              BROAST EL-ASSAD
            </span>
            <h2 className="mt-1 text-2xl font-black text-white md:text-4xl">
              {title}
            </h2>
            <p className="mt-2 text-xs font-semibold text-white/70 md:text-sm max-w-xl mx-auto md:mx-0">
              {subtitle}
            </p>
          </div>

          {/* Logo / Mascot Card */}
          <div className="relative flex shrink-0 items-center justify-center rounded-3xl border border-amber-500/30 bg-carbon-950/80 p-3 shadow-xl ring-2 ring-brand-500/20 size-28 md:size-36">
            {logoUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Broast El-Assad"
                onError={() => setImgError(true)}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center rounded-2xl bg-brand-500/15 text-5xl md:text-6xl select-none">
                🦁
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
