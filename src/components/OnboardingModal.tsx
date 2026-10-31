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
} from "lucide-react";
import { upsertCustomerAction } from "@/app/admin-actions";

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"form" | "card">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [customerCode, setCustomerCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // التحقق هل العميل مسجل مسبقاً أو أغلق النافذة من قبل
    if (typeof window !== "undefined") {
      const savedCode = localStorage.getItem("lion_vip_code");
      const dismissed = localStorage.getItem("lion_vip_dismissed");

      if (!savedCode && !dismissed) {
        // تأخير بسيط نصف ثانية لظهور سلس بعد تحميل الصفحة
        const timer = setTimeout(() => setIsOpen(true), 600);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lion_vip_dismissed", "true");
    }
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    try {
      // توليد كود VIP عشوائي مميز للعميل
      const generatedCode = `LION-${Math.floor(100000 + Math.random() * 900000)}`;

      // تسجيل العميل في قاعدة البيانات مع نقاط ترحيبية
      await upsertCustomerAction({
        code: generatedCode,
        name: name.trim(),
        phone: phone.trim(),
        loyaltyPoints: 50, // 50 نقطة ترحيبية هدية تسجيل
        discountPercent: 10, // 10% خصم ترحيبي
      });

      // حفظ البيانات محلياً في جهاز العميل
      if (typeof window !== "undefined") {
        localStorage.setItem("lion_vip_code", generatedCode);
        localStorage.setItem("lion_vip_name", name.trim());
        localStorage.setItem("lion_vip_phone", phone.trim());
      }

      setCustomerCode(generatedCode);
      setStep("card");
    } catch (err) {
      console.error(err);
      // في حال وجود مشكلة في الاتصال، يتم إنشاء الكارت محلياً لراحة العميل
      const fallbackCode = `LION-${Math.floor(100000 + Math.random() * 900000)}`;
      setCustomerCode(fallbackCode);
      if (typeof window !== "undefined") {
        localStorage.setItem("lion_vip_code", fallbackCode);
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
        {/* خلفية معتمة ناعمة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* حاوية الكارت المنبثق بحواف كيرفات ناعمة */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 260 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-amber-500/40 bg-gradient-to-b from-carbon-900 via-carbon-950 to-carbon-950 p-6 md:p-8 text-white shadow-2xl"
        >
          {/* زر إغلاق X دائري */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-5 left-5 grid size-9 place-items-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer border border-white/10"
          >
            <X className="size-4" />
          </button>

          {/* اللوجو بحجم محكوم ومثالي (لا يتجاوز 64px) */}
          <div className="mx-auto mb-4 size-16 rounded-2xl bg-brand-500/15 border border-brand-500/30 p-2.5 flex items-center justify-center shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/icon-512.png"
              alt="بروست الأسد"
              className="size-full object-contain max-h-12 max-w-12"
            />
          </div>

          {step === "form" ? (
            /* ================= 1. مرحلة تسجيل البيانات ================= */
            <div className="space-y-5 text-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-black text-amber-300 mb-2">
                  <Sparkles className="size-3 text-amber-400" />
                  <span>عضوية الأسد VIP الحصرية 🦁</span>
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white">
                  سجّل واستلم كارت الـ QR فوراً!
                </h3>
                <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto leading-relaxed">
                  احصل على 50 نقطة ترحيبية وخصومات حصرية على كل طلباتك من بروست الأسد في دسوق.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-right">
                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1 mr-1">
                    الاسم بالكامل:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثال: محمد سعيد"
                      className="w-full rounded-2xl border border-white/15 bg-carbon-900/90 pr-10 pl-4 py-3 text-xs font-bold text-white placeholder:text-white/30 outline-none focus:border-brand-500 transition shadow-inner"
                    />
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-brand-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/70 mb-1 mr-1">
                    رقم الموبايل (واتساب):
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="010XXXXXXXX"
                      className="w-full rounded-2xl border border-white/15 bg-carbon-900/90 pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-white/30 outline-none focus:border-brand-500 transition text-right shadow-inner"
                    />
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-brand-400" />
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 py-3.5 text-xs font-black text-white shadow-xl glow-brand transition cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Award className="size-4" />
                    )}
                    <span>{loading ? "جاري تجهيز الكارت والـ QR..." : "استلام كارت الأسد VIP الآن 🍗"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full py-2 text-[11px] font-bold text-white/40 hover:text-white/70 transition"
                  >
                    تصفح المنيو بدون تسجيل الآن
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ================= 2. مرحلة عرض كارت الـ QR ================= */
            <div className="space-y-5 text-center">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-black text-emerald-400 mb-1.5">
                  <Check className="size-3" /> تم إنشاء كارتك بنجاح
                </span>
                <h3 className="text-xl font-black text-white">
                  أهلاً بك يا بطل، <span className="text-amber-400">{name}</span> 🦁
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  أظهر هذا الرمز للكاشير أو عند طلب الدليفري لحساب نقاطك والخصم.
                </p>
              </div>

              {/* حاوية الـ QR كود */}
              <div className="relative mx-auto my-2 size-44 rounded-2xl bg-white p-2.5 shadow-2xl ring-4 ring-brand-500/40 flex items-center justify-center">
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
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-carbon-900/90 px-4 py-2.5 w-fit mx-auto">
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

              {/* مميزات الكارت الممنوحة */}
              <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-white/10 bg-carbon-900/40 p-3 text-xs">
                <div className="rounded-xl bg-black/30 p-2 border border-white/5">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-white/50 mb-0.5">
                    <Coins className="size-3 text-amber-400" />
                    <span>رصيد نقاطك</span>
                  </div>
                  <span className="text-sm font-black text-amber-400">50 نقطة هدية</span>
                </div>

                <div className="rounded-xl bg-black/30 p-2 border border-white/5">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-white/50 mb-0.5">
                    <Flame className="size-3 text-red-400" />
                    <span>خصم ترحيبي</span>
                  </div>
                  <span className="text-sm font-black text-emerald-400">10% خصم فوري</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 py-3.5 text-xs font-black text-white shadow-xl glow-brand transition cursor-pointer"
              >
                <UtensilsCrossed className="size-4" />
                <span>دخول للمنيو وبدء الطلب الآن 🍗</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
