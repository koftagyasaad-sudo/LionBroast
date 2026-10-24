"use client";

import Link from "next/link";
import { Clock4, Flame, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { BRAND, HOTLINE, WHATSAPP_NUMBER } from "@/lib/constants";
import { waLink } from "@/lib/utils";
import { useDict, useIsAr } from "@/lib/hooks";

export default function Footer({ 
  aboutAr, 
  aboutEn,
  dbHotline,
  dbWhatsapp 
}: { 
  aboutAr?: string; 
  aboutEn?: string;
  dbHotline?: string;
  dbWhatsapp?: string;
}) {
  const t = useDict();
  const isAr = useIsAr();
  
  const aboutText = isAr ? (aboutAr || t.footer.about) : (aboutEn || t.footer.about);
  
  // بنستخدم الرقم الجاي من لوحة التحكم لو موجود، ولو مش موجود نستخدم الأساسي
  const activeHotline = dbHotline || HOTLINE;
  const activeWhatsapp = dbWhatsapp || WHATSAPP_NUMBER;

  return (
    <footer id="contact" className="relative mt-24 border-t border-line bg-surface">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/70 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/icon-512.png" alt="logo" className="size-12 rounded-2xl object-cover ring-2 ring-brand-500/50" />
            <div>
              <p className="text-lg font-extrabold">{t.brand}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500">{isAr ? BRAND.name : BRAND.nameAr}</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">{aboutText}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-cheese-400/40 bg-cheese-400/10 px-3 py-1.5 text-xs font-bold text-cheese-400">
            <Flame className="size-3.5" /> {t.footer.made}
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-ink-2">{t.footer.links}</h4>
          <ul className="space-y-2.5 text-sm font-semibold">
            <li><Link className="transition hover:text-brand-500" href="/menu">{t.nav.menu}</Link></li>
            <li><Link className="transition hover:text-brand-500" href="/#best">{t.nav.best}</Link></li>
            <li><Link className="transition hover:text-brand-500" href="/#zones">{t.nav.zones}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-extrabold uppercase tracking-wider text-ink-2">{t.footer.contact}</h4>
          <ul className="space-y-3 text-sm font-semibold">
            <li className="flex items-center gap-2">
              <PhoneCall className="size-4 shrink-0 text-brand-500" />
              <span dir="ltr">{t.footer.hotline}: {activeHotline}</span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="size-4 shrink-0 text-[#25D366]" />
              <a href={waLink(activeWhatsapp, "مرحباً")} target="_blank" rel="noreferrer" className="transition hover:text-[#25D366]" dir="ltr">
                +{activeWhatsapp}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" />
              <span>{t.footer.branch}: {isAr ? BRAND.addressAr : BRAND.addressEn}</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock4 className="size-4 shrink-0 text-cheese-400" />
              <span>{t.footer.hours}: <span dir="ltr">{BRAND.hours}</span></span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-[11px] font-semibold text-ink-2">
        {t.footer.rights} © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
