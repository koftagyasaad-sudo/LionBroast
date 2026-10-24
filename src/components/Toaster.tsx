"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCheck, Flame, TriangleAlert, X } from "lucide-react";
import { useApp } from "@/store/app-store";
import { useIsAr } from "@/lib/hooks";

export default function Toaster() {
  const toasts = useApp((s) => s.toasts);
  const dismiss = useApp((s) => s.dismissToast);
  const isAr = useIsAr();

  return (
    <div className={`pointer-events-none fixed bottom-24 z-[90] flex w-full flex-col items-center gap-2 px-4 md:bottom-8 ${isAr ? "items-center" : "items-center"}`}>
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface/90 p-3.5 shadow-2xl backdrop-blur-xl"
          >
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-xl text-white ${
                t.tone === "fire" ? "flame-badge" : t.tone === "warn" ? "bg-amber-500" : "bg-emerald-500"
              }`}
            >
              {t.tone === "fire" ? <Flame className="size-5" /> : t.tone === "warn" ? <TriangleAlert className="size-5" /> : <CheckCheck className="size-5" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{t.title}</p>
              {t.desc && <p className="truncate text-xs text-ink-2">{t.desc}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="grid size-7 shrink-0 place-items-center rounded-full text-ink-2 transition hover:bg-surface-2"
              aria-label="dismiss"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
