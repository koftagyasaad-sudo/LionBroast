"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function SectionHead({
  icon,
  kicker,
  title,
  sub,
}: {
  icon?: ReactNode;
  kicker: string;
  title: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-500">
        {icon}
        {kicker}
      </span>
      <h2 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">{title}</h2>
      {sub && <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-2 md:text-base">{sub}</p>}
    </motion.div>
  );
}
