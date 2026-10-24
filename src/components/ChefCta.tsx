"use client";

import { motion } from "framer-motion";
import { MessageCircle, PhoneCall } from "lucide-react";
import { HOTLINE, WHATSAPP_NUMBER } from "@/lib/constants";
import { waLink } from "@/lib/utils";
import { useDict, useIsAr } from "@/lib/hooks";

/** Closing CTA band with the mascot. */
export default function ChefCta() {
  const t = useDict();
  const isAr = useIsAr();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="golden-card relative overflow-hidden rounded-[36px] border border-cheese-400/30 p-8 text-white md:p-14"
      >
        <div className="absolute -end-16 -top-16 size-64 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/mascot-lion.png" alt="Chef Assd mascot" className="size-28 animate-float shrink-0 rounded-[28px] object-cover ring-4 ring-cheese-400/40 md:size-36" />
          <div className="flex-1 text-center md:text-start">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.3em] text-cheese-300">{t.brandEn}</p>
            <h3 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
              {isAr ? "جوعان؟ الأسد مستنيك." : "Hungry? The lion is waiting."}
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/75">
              {isAr
                ? "اطلب على واتساب في ٣٠ ثانية — أو كلم الخط الساخن والفرن يولّع على طول."
                : "Order over WhatsApp in 30 seconds — or ring the hotline and the fryer fires up instantly."}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={waLink(WHATSAPP_NUMBER, isAr ? "أهلاً، عايز أطلب من بروست الأسد" : "Hi! I'd like to order from Broast El-Assad")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-7 py-4 text-sm font-extrabold text-white shadow-[0_14px_40px_-10px_rgba(37,211,102,0.6)] transition hover:scale-105"
            >
              <MessageCircle className="size-5" /> WhatsApp
            </a>
            <a
              href={`tel:${HOTLINE}`}
              className="flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-4 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/20"
              dir="ltr"
            >
              <PhoneCall className="size-5" /> {HOTLINE}
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
