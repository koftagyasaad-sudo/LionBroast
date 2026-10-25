"use client";

import Link from "next/link";
import { UtensilsCrossed, Phone } from "lucide-react";
import { FrontendSettings } from "@/db/queries";

interface HeaderProps {
  frontend?: FrontendSettings;
}

export default function Header({ frontend }: HeaderProps) {
  const brandName = frontend?.brand_ar || "بروست الأسد";
  const hotline = frontend?.hotline || "19955";
  const logoUrl = frontend?.logo_url;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-zinc-950/90 border-b border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo or Name */}
        <Link href="/" className="flex items-center gap-3 group">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={brandName}
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-black text-xl bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent">
                {brandName}
              </span>
            </>
          )}
        </Link>

        {/* Hotline Contact Button */}
        {hotline && (
          <a
            href={`tel:${hotline}`}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-bold hover:bg-orange-500/20 transition-colors"
          >
            <Phone className="w-4 h-4 animate-pulse" />
            <span dir="ltr">{hotline}</span>
          </a>
        )}
      </div>
    </header>
  );
}
