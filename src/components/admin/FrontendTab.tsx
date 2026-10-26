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
} from "lucide-react";

export default function FrontendTab(props: any) {
  const initialData = props?.bundle?.frontend || props?.bundle?.settings || props?.settings || {};

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
    // صور الإعلانات والواجهة الرئيسية
    heroImage1: initialData.heroImage1 || initialData.hero_image_1 || "",
    heroImage2: initialData.heroImage2 || initialData.hero_image_2 || "",
    heroImage3: initialData.heroImage3 || initialData.hero_image_3 || "",
    adBanner1: initialData.adBanner1 || initialData.ad_banner_1 || "",
    adBanner2: initialData.adBanner2 || initialData.ad_banner_2 || "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  // دالة تتيح لك اختيار صورة من جهازك مباشرة وتحويلها لرابط جاهز للحفظ
  const handleFileUpload = (key: string, file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        handleChange(key, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveFrontendSettingsAction(form);
      setSaved(true);
      if (props?.reload) await props.reload();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save frontend settings:", err);
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
    { key: "adBanner1", label: "بانر إعلاني عريض 1 (Promotional Banner 1)" },
    { key: "adBanner2", label: "بانر إعلاني عريض 2 (Promotional Banner 2)" },
  ];

  return (
    <div dir="rtl" className="space-y-8 text-white">
      {/* Header & Save Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-carbon-900 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Sparkles className="size-5 text-brand-500" />
            إدارة واجهة الموقع وصور الإعلانات
          </h2>
          <p className="mt-1 text-xs text-white/60">
            تحكم في صور السلايدر، الإعلانات الترويجية، اللوجو، النصوص، وأرقام التواصل في الصفحة الرئيسية.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="glow-brand flex items-center gap-2 rounded-2xl bg-brand-500 px-6 py-3 text-sm font-extrabold text-white transition hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
        >
          {saved ? <Check className="size-4" /> : <Save className="size-4" />}
          {saving ? "جاري الحفظ..." : saved ? "تم الحفظ بنجاح ✓" : "حفظ التعديلات"}
        </button>
      </div>

      {/* القسم الأول: صور الإعلانات والسلايدر في الواجهة الرئيسية */}
      <div className="rounded-2xl border border-brand-500/30 bg-carbon-900 p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <ImageIcon className="size-5 text-brand-500" />
          <h3 className="text-lg font-extrabold">صور الإعلانات والسلايدر بالواجهة الرئيسية</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adSlots.map((slot) => {
            const currentVal = (form as any)[slot.key] || "";
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
                    placeholder="https://... ضع رابط الصورة أو ارفعها من جهازك"
                    className={inputClass}
                  />
                  <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold hover:bg-white/20 transition">
                    <Upload className="size-4 text-brand-500" />
                    <span>رفع صورة</span>
                    <input
                      type="file"
                      accept="image/*"
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

                {/* معاينة الصورة */}
                {currentVal ? (
                  <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentVal}
                      alt={slot.label}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="grid h-24 w-full place-items-center rounded-xl border border-dashed border-white/10 text-xs text-white/30">
                    لا توجد صورة مخصصة (يتم عرض التصميم الافتراضي)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* القسم الثاني: الهوية والنصوص الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 space-y-4">
          <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3">
            <Building2 className="size-4 text-brand-500" />
            هوية المطعم واللوجو
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
            <label className="mb-1 block text-xs text-white/60">شعار المطعم (Logo)</label>
            <div className="flex gap-2">
              <input
                dir="ltr"
                value={form.logoUrl}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
                className={inputClass}
              />
              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-bold hover:bg-white/20 transition">
                <Upload className="size-4 text-brand-500" />
                <span>رفع</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload("logoUrl", e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        </div>

        {/* القسم الثالث: نصوص الواجهة وشريط الأخبار */}
        <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 space-y-4">
          <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3">
            <Globe className="size-4 text-brand-500" />
            نصوص الواجهة وشريط العروض المتحرك
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
            <label className="mb-1 block text-xs text-white/60">الوصف الفرعي تحت العنوان</label>
            <input
              value={form.heroSubtitleAr}
              onChange={(e) => handleChange("heroSubtitleAr", e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-white/60">النص المتحرك أعلى الصفحة (Marquee)</label>
            <input
              value={form.marqueeTextAr}
              onChange={(e) => handleChange("marqueeTextAr", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* القسم الرابع: الفروع وأرقام التواصل */}
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
            <Phone className="size-3.5 text-emerald-400" /> رقم الواتساب (مع كود الدولة 20)
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
            <MapPin className="size-3.5 text-brand-500" /> عنوان الفرع بالتفصيل
          </label>
          <input
            value={form.addressAr}
            onChange={(e) => handleChange("addressAr", e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-white/60">
            <Clock className="size-3.5 text-brand-500" /> مواعيد العمل الرسمية
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
