"use client";

import Link from "next/link";
import { UtensilsCrossed, Phone, MapPin, Clock } from "lucide-react";
import { FrontendSettings } from "@/db/queries";

interface FooterProps {
  frontend?: FrontendSettings;
}

export default function Footer({ frontend }: FooterProps) {
  const brandName = frontend?.brand_ar || "مطعمنا";
  const logoUrl = frontend?.logo_url;
  const footerAbout = frontend?.footer_about_ar || "أفضل المأكولات والمشروبات المجهزة بأعلى معايير الجودة.";
  const hotline = frontend?.hotline || "19000";
  const address = frontend?.address_ar || "القاهرة، مصر";
  const workingHours = frontend?.working_hours_ar || "يومياً من 10 صباحاً حتى 2 صباحاً";

  return (
    <footer className="bg-zinc-900 text-zinc-300 pt-12 pb-8 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-zinc-800">
          
          {/* Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={brandName}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-xl text-white">
                    {brandName}
                  </span>
                </>
              )}
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
              {footerAbout}
            </p>
          </div>

          {/* Quick Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base mb-4">معلومات التواصل</h4>
            
            {hotline && (
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                <span>الخط الساخن: <strong className="text-white" dir="ltr">{hotline}</strong></span>
              </div>
            )}

            {address && (
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{address}</span>
              </div>
            )}

            {workingHours && (
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <Clock className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{workingHours}</span>
              </div>
            )}
          </div>

          {/* Admin Hidden Footer Link */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-white font-bold text-base mb-4">خدمة العملاء</h4>
              <p className="text-sm text-zinc-400">
                يسعدنا خدمتكم دائماً. نضمن لكم طعاماً طازجاً وسريع التوصيل.
              </p>
            </div>
            
            <div className="pt-4">
              <Link 
                href="/admin" 
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                لوحة الإدارة
              </Link>
            </div>
          </div>

        </div>

        <div className="pt-8 text-center text-xs text-zinc-500">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} {brandName}.
        </div>
      </div>
    </footer>
  );
}
