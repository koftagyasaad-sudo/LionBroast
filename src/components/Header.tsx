"use client";

import Link from "next/link";
import { UtensilsCrossed, Phone } from "lucide-react";
import { FrontendSettings } from "@/db/queries";

interface HeaderProps {
  frontend?: FrontendSettings;
}

export default function Header({ frontend }: HeaderProps) {
  const brandName = frontend?.brand_ar || "مطعمنا";
  const hotline = frontend?.hotline || "19000";
  const logoUrl = frontend?.logo_url;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo or Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName}
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                {brandName}
              </span>
            </>
          )}
        </Link>

        {/* Hotline Contact Button */}
        {hotline && (
          <a
            href={`tel:${hotline}`}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
          >
            <Phone className="w-4 h-4 animate-pulse" />
            <span dir="ltr">{hotline}</span>
          </a>
        )}
      </div>
    </header>
  );
}
