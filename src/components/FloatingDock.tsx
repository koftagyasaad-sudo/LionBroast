"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Megaphone, MessageCircle, PackageSearch, Plus, QrCode, X } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useDict } from "@/lib/hooks";
import { waLink } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";

interface Promo {
  enabled: boolean;
  textAr: string;
  textEn: string;
}

/** Collapsible floating action dock: WhatsApp, tracker, Lion Pass, promo bulletin. */
export default function FloatingDock({ promo }: { promo: Promo }) {
  const [expanded, setExpanded] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const t = useDict();
  const lang = useApp((s) => s.lang);
  const customer = useApp((s) => s.customer);
  const setTrackerOpen = useApp((s) => s.setTrackerOpen);
  const setPassOpen = useApp((s) => s.setPassOpen);
  const openOnboarding = useApp((s) => s.openOnboarding);

  const promoText = lang === "ar" ? promo.textAr || t.promo.default : promo.textEn || t.promo.default;

  const actions = [
    {
      key: "wa",
      icon: <MessageCircle className="size-5" />,
      label: "WhatsApp",
      cls: "bg-[#25D366] text-white",
      dot: false,
      onClick: () => window.open(waLink(WHATSAPP_NUMBER, lang === "ar" ? "أهلاً، عايز أطلب من بروست الأسد" : "Hi! I'd like to order from Broast El-Assad"), "_blank", "noopener"),
    },
    {
      key: "track",
      icon: <PackageSearch className="size-5" />,
      label: t.tracker.title,
      cls: "bg-surface text-brand-500 border border-line",
      dot: false,
      onClick: () => setTrackerOpen(true),
    },
    {
      key: "pass",
      icon: <QrCode className="size-5" />,
      label: t.pass.myPass,
      cls: "golden-card text-cheese-300 border border-cheese-400/40",
      dot: false,
      onClick: () => (customer ? setPassOpen(true) : openOnboarding("pass")),
    },
    ...(promo.enabled
      ? [
          {
            key: "promo",
            icon: <Megaphone className="size-5" />,
            label: t.promo.title,
            cls: "bg-cheese-400 text-carbon-950",
            dot: true,
            onClick: () => setPromoOpen(true),
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="fixed bottom-5 z-[70] flex flex-col items-end gap-3 end-4 md:end-6">
        <AnimatePresence>
          {expanded &&
            actions.map((a, i) => (
              <motion.button
                key={a.key}
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 380, damping: 26, delay: i * 0.04 }}
                onClick={() => {
                  a.onClick();
                  setExpanded(false);
                }}
                className={`relative flex items-center gap-2.5 rounded-full pe-4 ps-3 py-3 text-xs font-extrabold shadow-2xl transition hover:scale-105 ${a.cls}`}
              >
                {a.icon}
                {a.label}
                {a.dot && <span className="absolute -end-0.5 -top-0.5 size-3 animate-pulse-dot rounded-full bg-brand-500 ring-2 ring-white/80" />}
              </motion.button>
            ))}
        </AnimatePresence>

        <motion.button
          onClick={() => setExpanded((v) => !v)}
          whileTap={{ scale: 0.9 }}
          className="glow-brand grid size-14 place-items-center rounded-full bg-brand-500 text-white shadow-2xl"
          aria-label="quick actions"
        >
          <motion.span animate={{ rotate: expanded ? 45 : 0 }} transition={{ type: "spring", stiffness: 320, damping: 22 }}>
            {expanded ? <X className="size-6" /> : <Plus className="size-6" />}
          </motion.span>
          {!expanded && promo.enabled && <span className="absolute -end-0.5 -top-0.5 size-3.5 animate-pulse-dot rounded-full bg-cheese-400 ring-2 ring-bg" />}
        </motion.button>
      </div>

      {/* Promo bulletin modal */}
      <AnimatePresence>
        {promoOpen && (
          <motion.div className="fixed inset-0 z-[89] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="close" onClick={() => setPromoOpen(false)} className="absolute inset-0 bg-carbon-950/75 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.82, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="golden-card relative w-full max-w-sm rounded-[32px] border border-cheese-400/40 p-7 text-center text-white shadow-2xl"
            >
              <span className="flame-badge mx-auto grid size-14 place-items-center rounded-2xl shadow-lg">
                <Megaphone className="size-6" />
              </span>
              <h3 className="mt-4 text-xl font-extrabold">{t.promo.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">{promoText}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.4em] text-cheese-300/70">Broast El-Assad</p>
              <button
                onClick={() => setPromoOpen(false)}
                className="mt-5 w-full rounded-2xl bg-brand-500 py-3.5 text-sm font-extrabold text-white transition hover:scale-[1.01]"
              >
                {t.misc.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
