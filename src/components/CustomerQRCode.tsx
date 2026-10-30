"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Award,
  Coins,
  ShoppingBag,
  Flame,
  Sparkles,
} from "lucide-react";
import { passStatsAction } from "@/app/actions";

interface CustomerQRCodeProps {
  open: boolean;
  onClose: () => void;
  code?: string;
  customer?: any;
  setOpen?: (v: boolean) => void;
}

export default function CustomerQRCode({
  open,
  onClose,
  code,
  customer,
  setOpen,
}: CustomerQRCodeProps) {
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [, setLoading] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
    if (setOpen) setOpen(false);
  };

  useEffect(() => {
    if (open && code) {
      setStats(null);
      setLoading(true);
      passStatsAction(code)
        .then((s: any) => {
          if (s && !s.error && (s.customer || s.loyaltyPoints !== undefined)) {
            setStats(s);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, code]);

  const activeCustomer = stats?.customer || customer || {};
  const displayCode = code || activeCustomer?.passCode || activeCustomer?.code || "LION-VIP";
  const points = stats?.customer?.loyaltyPoints ?? activeCustomer?.loyaltyPoints ?? 0;
  const discount = stats?.customer?.discountPercent ?? activeCustomer?.discountPercent ?? 0;
  const ordersCount = stats?.customer?.totalOrders ?? activeCustomer?.totalOrders ?? 0;
  const spent = stats?.customer?.totalSpent ?? activeCustomer?.totalSpent ?? 0;

  const handleCopy = () => {
    if (displayCode) {
      navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Card Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 260 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-b from-carbon-900 via-carbon-950 to-carbon-950 p-6 text-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
                  <Award className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">بطاقة الأسد VIP 🦁</h3>
                  <p className="text-[10px] font-bold text-amber-400">عضوية التوفير والولاء الحصرية</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="grid size-8 place-items-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* QR Code Container */}
            <div className="my-5 flex flex-col items-center justify-center space-y-3">
              <div className="relative rounded-2xl bg-white p-3 shadow-xl ring-4 ring-brand-500/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    displayCode
                  )}&color=000000&bgcolor=ffffff`}
                  alt="Customer Pass QR"
                  className="size-44 rounded-lg object-contain"
                />
                <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                  <span className="rounded-full bg-carbon-950 px-2.5 py-0.5 text-[9px] font-black text-brand-400 border border-brand-500/40">
                    امسح للكاشير
                  </span>
                </div>
              </div>

              {/* Code Bar & Copy */}
              <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-carbon-900/80 px-3.5 py-2">
                <span className="text-xs font-black tracking-widest text-amber-400 font-mono" dir="ltr">
                  {displayCode}
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/20 px-2 py-1 text-[10px] font-bold text-white transition cursor-pointer"
                  title="نسخ الكود"
                >
                  {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  <span>{copied ? "تم النسخ" : "نسخ"}</span>
                </button>
              </div>

              {activeCustomer?.name && (
                <p className="text-xs font-bold text-white/80">
                  مرحباً بك، <span className="text-amber-400">{activeCustomer.name}</span>
                </p>
              )}
            </div>

            {/* Loyalty Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-white/10 bg-carbon-900/40 p-3.5 text-xs">
              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-white/50 font-bold mb-0.5">
                  <Coins className="size-3 text-amber-400" />
                  <span>نقاط الولاء</span>
                </div>
                <span className="text-base font-black text-amber-400">{points}</span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-white/50 font-bold mb-0.5">
                  <Sparkles className="size-3 text-emerald-400" />
                  <span>نسبة الخصم</span>
                </div>
                <span className="text-base font-black text-emerald-400">%{discount}</span>
              </div>

              <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 text-[10px] text-white/50 font-bold mb-0
