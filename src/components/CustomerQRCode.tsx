"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Award,
  Sparkles,
  Phone,
  User,
  Check,
  Copy,
  UtensilsCrossed,
  Loader2,
  Coins,
  Flame,
  QrCode,
  Edit2,
} from "lucide-react";
import { upsertCustomerAction } from "@/app/admin-actions";

interface CustomerQRCodeProps {
  open: boolean;
  onClose: () => void;
}

export default function CustomerQRCode({ open, onClose }: CustomerQRCodeProps) {
  const [step, setStep] = useState<"loading" | "form" | "card">("loading");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerCode, setCustomerCode] = useState("");
  const [points, setPoints] = useState(50);
  const [copied, setCopied] = useState(false);

  // فحص بيانات العميل المسجلة مسبقاً عند الفتح
  useEffect(() => {
    if (open) {
      if (typeof window !== "undefined") {
        const savedCode = localStorage.getItem("lion_vip_code");
        const savedName = localStorage.getItem("lion_vip_name");
        const savedPhone = localStorage.getItem("lion_vip_phone");

        if (savedCode && savedName) {
          setCustomerCode(savedCode);
          setName(savedName);
          setPhone(savedPhone || "");
          setStep("card");
        } else {
          setStep("form");
        }
      } else {
        setStep("form");
      }
    }
  }, [open]);

  // تسجيل عميل جديد وتوليد الكود فوراً
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    try {
      const generatedCode = `LION-${Math.floor(100000 + Math.random() * 900000)}`;

      await upsertCustomerAction({
        code: generatedCode,
        name: name.trim(),
        phone: phone.trim(),
        loyaltyPoints: 50,
        discountPercent: 10,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("lion_vip_code", generatedCode);
        localStorage.setItem("lion_vip_name", name.trim());
        localStorage.setItem("lion_vip_phone", phone.trim());
      }

      setCustomerCode(generatedCode);
      setPoints(50);
      setStep("card");
    } catch (err) {
      console.error(err);
      const fallbackCode = `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      setCustomerCode(fallbackCode);
      if (typeof window !== "undefined") {
        localStorage.setItem("lion_vip_code", fallbackCode);
        localStorage.setItem("lion_vip_name", name.trim());
      }
      setStep("card");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (customerCode) {
      navigator.clipboard.writeText(customerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
        {/* خلفية معتمة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* حاوية النافذة المنبثقة */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/40 bg-zinc-950 p-6 md:p-8 text-white shadow-2xl"
        >
          {/* زر إغلاق X */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 grid size-9 place-items-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer border border-white/10"
          >
            <X className="size-4" />
          </button>

          {/* لوجو المطعم بحجم محكوم */}
          <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 p-2 flex items-center justify-center shadow-lg shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/icon-512.png"
              alt="بروست الأسد"
              className="w-8 h-8 object-contain rounded-xl block"
            />
          </div>

          {step === "loading" ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="size-8 text-amber-400 animate-spin" />
              <p className="text-xs text-zinc-400 font-bold">جاري تحميل بيانات العضوية...</p>
            </div>
          ) : step === "form" ? (
            /* ================= 1. نموذج تسجيل العميل الجديد ================= */
            <div className="space-y-5 text-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-black text-amber-300 mb-2">
                  <Sparkles className="size-3 text-amber-400" />
                  <span>عضوية الأسد VIP الحصرية 🦁</span>
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white">
                  سجّل واستلم كارت الـ QR فوراً!
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  احصل على 50 نقطة ترحيبية وخصومات حصرية على جميع وجباتك في دسوق.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1 mr-1">
                    الاسم بالكامل:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: محمد سعيد"
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 pr-10 pl-4 py-3 text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 transition shadow-inner"
                    />
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-orange-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-300 mb-1 mr-1">
                    رقم الموبايل (واتساب للطلبات):
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 transition text-right shadow-inner"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-orange-500" />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 py-3.5 text-xs font-black text-white shadow-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Award className="size-4" />
                    )}
                    <span>{loading ? "جاري إصدار الكارت..." : "إصدار كارت الأسد VIP الآن 🍗"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2 text-[11px] font-bold text-zinc-500 hover:text-zinc-300 transition"
                  >
                    تصفح الموقع بدون تسجيل
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ================= 2. بطاقة العميل ورمز الـ QR ================= */
            <div className="space-y-5 text-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-black text-emerald-400 mb-1.5">
                  <Check className="size-3" /> بطاقة VIP نشطة
                </span>
                <h3 className="text-xl font-black text-white">
                  أهلاً بك يا بطل، <span className="text-amber-400">{name}</span> 🦁
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  أظهر هذا الرمز للكاشير أو عند طلب الدليفري لحساب نقاطك والخصم.
                </p>
              </div>

              {/* حاوية الـ QR كود الرسمية */}
              <div className="relative mx-auto my-2 size-44 rounded-2xl bg-white p-2.5 shadow-2xl ring-4 ring-orange-500/30 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    customerCode
                  )}&color=000000&bgcolor=ffffff`}
                  alt="QR Pass"
                  className="size-full object-contain rounded-xl"
                />
              </div>

              {/* شريط الكود مع زر النسخ */}
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 w-fit mx-auto">
                <span className="text-xs font-black tracking-widest text-amber-400 font-mono" dir="ltr">
                  {customerCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded-xl bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white transition cursor-pointer"
                >
                  {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  <span>{copied ? "تم النسخ" : "نسخ"}</span>
                </button>
              </div>

              {/* مميزات العضوية */}
              <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs">
                <div className="rounded-xl bg-black/40 p-2 border border-zinc-800/80">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400 mb-0.5">
                    <Coins className="size-3 text-amber-400" />
                    <span>رصيد نقاطك</span>
                  </div>
                  <span className="text-sm font-black text-amber-400">{points} نقطة</span>
                </div>

                <div className="rounded-xl bg-black/40 p-2 border border-zinc-800/80">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-400 mb-0.5">
                    <Flame className="size-3 text-red-500" />
                    <span>خصم الولاء</span>
                  </div>
                  <span className="text-sm font-black text-emerald-400">10% خصم فوري</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 py-3 text-xs font-bold text-zinc-300 transition cursor-pointer"
                >
                  <Edit2 className="size-3.5" />
                  <span>تعديل البيانات</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-orange-600 hover:bg-orange-500 py-3 text-xs font-black text-white shadow-xl transition cursor-pointer"
                >
                  <UtensilsCrossed className="size-3.5" />
                  <span>دخول للمنيو</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
