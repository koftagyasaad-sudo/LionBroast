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
  ExternalLink,
} from "lucide-react";

// ضاغط الصور الفوري لتصغير الصور إلى أقل من 150KB قبل الإرسال
function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
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
        resolve(canvas.toDataURL("image/jpeg", quality));
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
    heroTitleAr: initialData.heroTitleAr || initialData.hero_title_ar || "أقوى بروست مقرمش وطازج في دسوق",
    heroSubtitleAr: initialData.heroSubtitleAr || initialData.hero_subtitle_ar || "طعم لا يُقاوم وخبرة سنوات من التتبيل السرّي الخاص!",
    marqueeTextAr: initialData.marqueeTextAr || initialData.marquee_text_ar || "🔥 توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥",
    addressAr: initialData.addressAr || initialData.address_ar || "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية",
    workingHoursAr: initialData.workingHoursAr || initialData.working_hours_ar || "يومياً من 10 صباحا حتى 4 فجرا",
    hotline: initialData.hotline || "0248813666",
    whatsapp: initialData.whatsapp || "201034419424",
    branchMapsUrl: initialData.branchMapsUrl || initialData.branch_maps_url || "https://maps.google.com/?q=دسوق+شارع+الجيش",
    promoTitleAr: initialData.promoTitleAr || initialData.promo_title_ar || "أكبر قطعة بروست في دسوق.. قرمشة وتتبيلة ملهاش زي! 🍗",
    promoSubtitleAr: initialData.promoSubtitleAr || initialData.promo_subtitle_ar || "اطلب دلوقتي من المنيو واستمتع بأقوى عروض التوفير العائلية والفردية، توصيل سريع وسخن لحد باب بيتك في دسوق وجميع القرى المجاورة.",
    ctaTitleAr: initialData.ctaTitleAr || initialData.cta_title_ar || "جوعان؟ الأسد مستنيك.",
    ctaSubtitleAr: initialData.ctaSubtitleAr || initialData.cta_subtitle_ar || "اطلب على واتساب في ٣٠ ثانية – أو كلم الخط الساخن والفرن يولّع على طول.",
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
      console.error(err);
      setErrorMsg("فشل معالجة الصورة. يرجى اختيار ملف صالح.");
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
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrorMsg(res?.error || "فشل حفظ التعديلات.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "فشل الاتصال أثناء الحفظ.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-carbon-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-brand-500 transition";

  return (
    <div dir="rtl" className="space-y-8 text-white">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-carbon-900 p-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Sparkles className="size-5 text-brand-500" />
            إدارة الواجهة، الشعار، والخرائط
          </h2>
          <p className="mt-1 text-xs text-white/60">
            تحكم في كل عناصر واجهة الموقع وصور السلايدر ورابط Google Maps والبانرات الترويجية.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || Boolean(compressing)}
          className="glow-brand flex items-center gap-2 rounded-2xl bg-brand-500 px-7 py-3 text-sm font-extrabold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-lg"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : <Save className="size-4" />}
          {saving ? "جاري الحفظ..." : saved ? "تم الحفظ بنجاح ✓" : "حفظ التعديلات الآن"}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-bold text-red-400">
          <AlertCircle className="size-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* قسم الشعار والهوية (يدعم رفع صورة مباشرة أو رابط) */}
      <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 space-y-4">
        <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3">
          <Building2 className="size-4 text-brand-500" />
          شعار المتجر وهوية البراند
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-3 md:col-span-2">
            <label className="block text-xs text-white/60">شعار المطعم (Logo) - يمكنك رفع صورة مباشرة من جهازك أو وضع رابط</label>
            <div className="flex gap-2">
              <input
                dir="ltr"
                value={form.logoUrl}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
                placeholder="/img/icon-512.png أو رابط صورة"
                className={inputClass}
              />
              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/20 transition">
                {compressing === "logoUrl" ? <Loader2 className="size-4 animate-spin text-brand-500" /> : <Upload className="size-4 text-brand-500" />}
                <span>{compressing === "logoUrl" ? "جاري التجهيز..." : "رفع لوجو"}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={compressing === "logoUrl"}
                  className="hidden"
                  onChange={(e) => handleFileUpload("logoUrl", e.target.files?.[0])}
                />
              </label>
            </div>
            <p className="text-[11px] text-white/40">عند رفع اللوجو، سيتم تحديثه في الهيدر والفوتر وجميع صفحات الموقع تلقائياً.</p>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-carbon-950">
            <span className="text-[10px] text-white/40 mb-2">معاينة الشعار المعتمد</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.logoUrl || "/img/icon-512.png"} alt="Logo Preview" className="size-20 rounded-2xl object-cover ring-2 ring-brand-500/50" />
          </div>
        </div>
      </div>

      {/* قسم موقع الفرع ورابط خرائط جوجل Google Maps */}
      <div className="rounded-2xl border border-brand-500/30 bg-carbon-900 p-6 space-y-4">
        <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3 text-amber-400">
          <MapPin className="size-4 text-amber-400" />
          بيانات الفرع وموقع Google Maps المباشر
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-white/60 font-bold text-amber-400">رابط موقع المطعم على خرائط جوجل (Google Maps Link)</label>
            <div className="flex gap-2">
              <input
                dir="ltr"
                value={form.branchMapsUrl}
                onChange={(e) => handleChange("branchMapsUrl", e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className={inputClass}
              />
              {form.branchMapsUrl && (
                <a
                  href={form.branchMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/20 transition shrink-0"
                >
                  <ExternalLink className="size-3.5" />
                  تجربة الرابط
                </a>
              )}
            </div>
            <p className="text-[11px] text-white/40 mt-1">عند الضغط على أزرار "عرض الاتجاهات" أو "افتح الموقع على خرائط جوجل" في الموقع، سيتم فتح هذا الرابط مباشرة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/60">عنوان الفرع بالتفصيل</label>
              <input
                value={form.addressAr}
                onChange={(e) => handleChange("addressAr", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">مواعيد العمل الرسمية</label>
              <input
                value={form.workingHoursAr}
                onChange={(e) => handleChange("workingHoursAr", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* قسم بانر العروض والمميزات VIP */}
      <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 space-y-4">
        <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3">
          <Sparkles className="size-4 text-brand-500" />
          بانر العروض والمميزات VIP (أكبر قطعة بروست)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-white/60">العنوان الرئيسي للبانر</label>
            <input
              value={form.promoTitleAr}
              onChange={(e) => handleChange("promoTitleAr", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">نص الوصف بالبانر</label>
            <textarea
              rows={2}
              value={form.promoSubtitleAr}
              onChange={(e) => handleChange("promoSubtitleAr", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* قسم البانر التحفيزي السفلي (جوعان؟ الأسد مستنيك) */}
      <div className="rounded-2xl border border-white/10 bg-carbon-900 p-6 space-y-4">
        <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3">
          <Phone className="size-4 text-brand-500" />
          بانر الطلب السريع (جوعان؟ الأسد مستنيك)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/60">العنوان الرئيسي</label>
            <input
              value={form.ctaTitleAr}
              onChange={(e) => handleChange("ctaTitleAr", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">الوصف الفرعي</label>
            <input
              value={form.ctaSubtitleAr}
              onChange={(e) => handleChange("ctaSubtitleAr", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">الخط الساخن</label>
            <input
              dir="ltr"
              value={form.hotline}
              onChange={(e) => handleChange("hotline", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">رقم الواتساب</label>
            <input
              dir="ltr"
              value={form.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
