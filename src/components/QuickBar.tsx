"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bike, Contact2, Flame, QrCode, UtensilsCrossed } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useDict } from "@/lib/hooks";

/** Sub-hero circular quick-action bar. */
export default function QuickBar() {
  const t = useDict();
  const customer = useApp((s) => s.customer);
  const setPassOpen = useApp((s) => s.setPassOpen);
  const openOnboarding = useApp((s) => s.openOnboarding);

  const items = [
    { key: "menu", label: t.quick.menu, icon: UtensilsCrossed, href: "/menu" },
    { key: "best", label: t.quick.best, icon: Flame, href: "/#best" },
    { key: "zones", label: t.quick.zones, icon: Bike, href: "/#zones" },
    { key: "contact", label: t.quick.contact, icon: Contact2, href: "/#contact" },
  ];

  return (
    <div className="relative z-20 mx-auto -mt-12 max-w-3xl px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 24 }}
        className="glass grid grid-cols-5 gap-1 rounded-[28px] border border-line p-2 shadow-2xl"
      >
        {items.map((it) => (
          <Link
            key={it.key}
            href={it.href}
            className="group flex flex-col items-center gap-1.5 rounded-3xl px-1 py-3 transition hover:bg-brand-500/10"
          >
            <span className="grid size-12 place-items-center rounded-full border border-line bg-surface text-brand-500 shadow-sm transition group-hover:scale-110 group-hover:border-brand-500 group-hover:bg-brand-500 group-hover:text-white">
              <it.icon className="size-5" />
            </span>
            <span className="text-center text-[10px] font-extrabold leading-tight text-ink-2 transition group-hover:text-ink sm:text-[11px]">
              {it.label}
            </span>
          </Link>
        ))}
        <button
          onClick={() => (customer ? setPassOpen(true) : openOnboarding("pass"))}
          className="group flex flex-col items-center gap-1.5 rounded-3xl px-1 py-3 transition hover:bg-cheese-400/10"
        >
          <span className="golden-card grid size-12 place-items-center rounded-full border border-cheese-400/50 text-cheese-300 shadow transition group-hover:scale-110">
            <QrCode className="size-5" />
          </span>
          <span className="text-center text-[10px] font-extrabold leading-tight text-cheese-400 sm:text-[11px]">{t.quick.pass}</span>
        </button>
      </motion.div>
    </div>
  );
}
