"use client";

import { motion } from "framer-motion";
import { Bike, CircleHelp, MousePointerClick, PackageCheck, Send, Timer } from "lucide-react";
import type { ZoneDTO } from "@/lib/types";
import { useDict, useIsAr, useLang } from "@/lib/hooks";
import { money } from "@/lib/utils";
import SectionHead from "@/components/SectionHead";

export default function ZonesSection({ zones }: { zones: ZoneDTO[] }) {
  const t = useDict();
  const isAr = useIsAr();
  const lang = useLang();

  const steps = [
    { icon: MousePointerClick, title: t.sections.step1, sub: t.sections.step1s },
    { icon: Send, title: t.sections.step2, sub: t.sections.step2s },
    { icon: PackageCheck, title: t.sections.step3, sub: t.sections.step3s },
  ];

  return (
    <section id="zones" className="scroll-mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <SectionHead icon={<Bike className="size-4" />} kicker={t.sections.zonesKicker} title={t.sections.zonesTitle} sub={t.sections.zonesSub} />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((z, i) => (
            <motion.div
              key={z.id}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="card-lift group flex items-center justify-between rounded-3xl border border-line bg-bg p-5"
            >
              <div>
                <h3 className="text-base font-extrabold">{isAr ? z.nameAr : z.nameEn}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink-2">
                  <Timer className="size-3.5 text-brand-500" /> 30–45 {t.zones.min}
                </p>
              </div>
              <div className="text-end">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-2">{t.zones.fee}</p>
                <p className="text-xl font-extrabold text-brand-500">{z.price === 0 ? (isAr ? "مجاني" : "Free") : money(z.price, lang)}</p>
              </div>
            </motion.div>
          ))}

          {/* Out-of-range card */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: zones.length * 0.05 }}
            className="golden-card flex items-center justify-between gap-3 rounded-3xl border border-cheese-400/40 p-5 text-white"
          >
            <div className="flex items-start gap-3">
              <CircleHelp className="mt-1 size-5 shrink-0 text-cheese-300" />
              <div>
                <h3 className="text-base font-extrabold text-cheese-300">{t.sections.outRangeTitle}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{t.sections.outRangeSub}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3-step ordering strip */}
        <div className="mt-16">
          <h3 className="text-center text-2xl font-extrabold tracking-tight">{t.sections.stepsTitle}</h3>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative rounded-3xl border border-line bg-bg p-6 text-center"
              >
                <span className="absolute -top-3 start-5 grid size-7 place-items-center rounded-full bg-brand-500 text-xs font-extrabold text-white shadow-lg">
                  {i + 1}
                </span>
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
                  <s.icon className="size-6" />
                </span>
                <h4 className="mt-4 text-base font-extrabold">{s.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
