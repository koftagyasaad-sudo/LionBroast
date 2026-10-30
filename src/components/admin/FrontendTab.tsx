"use client";

import { useState } from "react";
import { saveFrontendSettingsAction } from "@/app/admin-actions";
import {
  Save,
  Image as ImageIcon,
  Check,
  Globe,
  Phone,
  Sparkles,
  Building2,
  MapPin,
  Clock,
  Upload,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";

// محرك ضغط الصور الفوري لحل مشكلة عدم الحفظ ومنع تجاوز حدود Vercel
function compressImage(file: File, maxWidth = 1400, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // تحويل الصورة لصيغة JPEG مضغوطة عالية الجودة بحجم أقل من 200KB
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function FrontendTab(props: any) {
  const initialData = props?.data?.frontend || props?.data?.settings || {};

  const [form, setForm] = useState({
    brandNameAr: initialData.brandNameAr || initialData.brand_name_ar || "بروست الأسد",
    brandNameEn: initialData.brandNameEn || initialData.brand_name_en || "Lion Broast",
    logoUrl: initialData.logoUrl || initialData.logo_url || "/img/icon-512.png",
    heroTitleAr:
      initialData.heroTitleAr ||
      initialData.hero_title_ar ||
      "أقوى بروست مقرمش وطازج في دسوق",
    heroSubtitleAr:
      initialData.heroSubtitleAr ||
      initialData.hero_subtitle_ar ||
      "طعم لا يُقاوم وخبرة سنوات من التتبيل السرّي الخاص!",
    marqueeTextAr:
      initialData.marqueeTextAr ||
      initialData.marquee_text_ar ||
      "🔥 توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥",
    addressAr:
      initialData.addressAr ||
      initialData.address_ar ||
      "دسوق - شارع الجلاء - بجوار مسجد الإبراهيمي",
    workingHoursAr:
      initialData.workingHoursAr ||
      initialData.working_hours_ar ||
      "يومياً من 12 ظهراً حتى 2 صباحاً",
    hotline: initialData.hotline || "01068390982",
    whatsapp: initialData.whatsapp || "201068390982",
    heroImage1: initialData.heroImage1 || initialData.hero_image_1 || "",
    heroImage2: initialData.heroImage2 || initialData.hero_image_2 || "",
    heroImage3: initialData.heroImage3 || initialData.hero_image_3 || "",
    adBanner1: initialData.adBanner1 || initialData.ad_banner_1 || "",
    adBanner2: initialData.adBanner2 || initialData.ad_banner_2 || "",
  });

  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleFileUpload = async (key: string, file?: File | null) => {
    if (!file) return;
    setCompressing(key);
    setErrorMsg(null);
    try {
      const compressedDataUrl = await compressImage(file);
      handleChange(key, compressedDataUrl);
    } catch (err) {
      console.error("Compression failed:", err);
      setErrorMsg("فشل تجهيز الصورة، يرجى اختيار ملف صورة صالح.");
    } finally {
      setCompressing(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setErrorMsg(null);

    try {
      const res = await saveFrontendSettingsAction(form);
      if (res && res.success) {
        setSaved(true);
        if (props?.refresh) await props.refresh();
        setTimeout(() => setSaved(false), 4000);
      } else {
        setErrorMsg(res?.error || "حدث خطأ أثناء حفظ الإعدادات في قاعدة البيانات.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "فشل الاتصال بالسيرفر أثناء الحفظ.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-carbon-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-brand-500 transition";

  const adSlots = [
    { key: "heroImage1", label: "صورة السلايدر الرئيسي 1 (Hero Slide 1)" },
    { key: "heroImage2", label: "صورة السلايدر الرئيسي 2 (Hero Slide 2)" },
    { key: "heroImage3", label: "صورة السلايدر الرئيسي 3 (Hero Slide 3)" },
    { key: "adBanner1", label: "بانر إعلاني عريض 1 (Promo Banner 1)" },
    { key: "adBanner2", label: "بانر إعلاني عريض 2 (Promo Banner 2)" },
  ];

  return (
    <div dir="rtl" className="space-y-8 text-white">
      {/* الشريط العلوي وزر الحفظ */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-carbon-900 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Sparkles className="size-5 text-brand-500" />
            إدارة الواجهة وصور الإعلانات والسلايدر
          </h2>
          <p className="mt-1 text-xs text-white/60">
            أي صورة أو تعديل تقوم به هنا يُحفظ فوراً في قاعدة بيانات المتجر ويظهر على الواجهة الرئيسية.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || Boolean(compressing)}
          className="glow-brand flex items-center gap-2 rounded-2xl bg-brand-500 px-7 py-3 text-sm font-extrabold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-lg"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <Check className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "جاري الحفظ في الداتابيز..." : saved ? "تم الحفظ بنجاح ✓" : "حفظ التعديلات الآن"}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-bold text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* قسم إدارة صور السلايدر والبانرات الإعلانية */}
      <div className="rounded-2xl border border-brand-500/30 bg-carbon-900 p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <ImageIcon className="size-5 text-brand-500" />
          <h3 className="text-lg font-extrabold">صور السلايدر الرئيسي والبانرات الإعلانية</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adSlots.map((slot) => {
            const currentVal = (form as any)[slot.key] || "";
            const isThisCompressing = compressing === slot.key;

            return (
              <div
                key={slot.key}
                className="rounded-2xl border border-white/10 bg-carbon-950/60 p-4 space-y-3"
              >
                <label className="block text-xs font-bold text-amber-400">
                  {slot.label}
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    dir="ltr"
                    value={currentVal}
                    onChange={(e) => handleChange(slot.key, e.target.value)}
                    placeholder="ضع رابط صورة مباشر أو ارفع ملف صورة"
                    className={inputClass}
                  />

                  <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold hover:bg-white/20 transition">
                    {isThisCompressing ? (
                      <Loader2 className="size-4 animate-spin text-brand-500" />
                    ) : (
                      <Upload className="size-4 text-brand-500" />
                    )}
                    <span>{isThisCompressing ? "جاري التجهيز..." : "رفع صورة"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isThisCompressing}
                      className="hidden"
                      onChange={(e) => handleFileUpload(slot.key, e.target.files?.[0])}
                    />
                  </label>

                  {currentVal && (
                    <button
                      type="button"
                      onClick={() => handleChange(slot.key, "")}
                      className="rounded-xl bg-red-500/15 px-3 text-red-400 hover:bg-red-500/25 transition"
                      title="حذف الصورة"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>

                {/* معاينة الصورة المرفوعة */}
                {currentVal ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentVal}
                      alt={slot.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid h-24 w-full place-items-center rounded-xl border border-dashed border-white/10 text-xs text-white/30">
                    لا توجد صورة مخصصة (يتم استخدام التصميم الافتراضي للموقع)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* باقي إعدادات النصوص والأرقام */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 space-y-4">
          <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3">
            <Building2 className="size-4 text-brand-500" />
            هوية المتجر والشعار
          </h3>
          <div>
            <label className="mb-1 block text-xs text-white/60">اسم المطعم (عربي)</label>
            <input
              value={form.brandNameAr}
              onChange={(e) => handleChange("brandNameAr", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">اسم المطعم (إنجليزي)</label>
            <input
              dir="ltr"
              value={form.brandNameEn}
              onChange={(e) => handleChange("brandNameEn", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">رابط الشعار (Logo)</label>
            <input
              dir="ltr"
              value={form.logoUrl}
              onChange={(e) => handleChange("logoUrl", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 space-y-4">
          <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3">
            <Globe className="size-4 text-brand-500" />
            نصوص الواجهة والرسائل الترويجية
          </h3>
          <div>
            <label className="mb-1 block text-xs text-white/60">العنوان الترحيبي الرئيسي (Hero Title)</label>
            <input
              value={form.heroTitleAr}
              onChange={(e) => handleChange("heroTitleAr", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">الوصف الفرعي</label>
            <input
              value={form.heroSubtitleAr}
              onChange={(e) => handleChange("heroSubtitleAr", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">شريط العروض المتحرك (Marquee)</label>
            <input
              value={form.marqueeTextAr}
              onChange={(e) => handleChange("marqueeTextAr", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-white/60">
            <Phone className="size-3.5 text-brand-500" /> رقم الدليفري / الخط الساخن
          </label>
          <input
            dir="ltr"
            value={form.hotline}
            onChange={(e) => handleChange("hotline", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-white/60">
            <Phone className="size-3.5 text-emerald-400" /> رقم الواتساب (مثال: 201068390982)
          </label>
          <input
            dir="ltr"
            value={form.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-white/60">
            <MapPin className="size-3.5 text-brand-500" /> عنوان المطعم
          </label>
          <input
            value={form.addressAr}
            onChange={(e) => handleChange("addressAr", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-white/60">
            <Clock className="size-3.5 text-brand-500" /> مواعيد العمل
          </label>
          <input
            value={form.workingHoursAr}
            onChange={(e) => handleChange("workingHoursAr", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
