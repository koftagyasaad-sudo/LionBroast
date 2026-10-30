"use client";

import { useState } from "react";
import { saveFrontendSettingsAction } from "@/app/admin-actions";
import {
  Save,
  Image as ImageIcon,
  Check,
  Building2,
  MapPin,
  Clock,
  Upload,
  Trash2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Plus,
  Sliders,
  FileText,
} from "lucide-react";

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
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function FrontendTab(props: any) {
  const initialData = props?.data?.frontend || props?.data?.settings || {};

  // تحميل شرائح السلايدر من قاعدة البيانات أو استخدام الافتراضية
  let initialSlides = [
    {
      id: "slide-1",
      badge: "إصدار النار 🔥",
      title: "الحار اللي يولّع",
      subtitle: "ستريبس النار بغمسة الهالبينو المدخنة، خصم 20% طوال الأسبوع - جرّبها لو قدها.",
      image: initialData.heroImage1 || "/img/hero-1.png",
      cta1Text: "تحدي النار 🍗",
      cta1Link: "/menu",
      cta2Text: "شوف المنيو",
      cta2Link: "/menu",
    },
    {
      id: "slide-2",
      badge: "وليمة العيلة",
      title: "العزومة جاهزة",
      subtitle: "١٥ قطعة بروست، بطاطس عائلية، كول سلو و٤ مشروبات. اطلبها ووصلها السكة.",
      image: initialData.heroImage2 || "/img/hero-2.png",
      cta1Text: "اطلب الوليمة",
      cta1Link: "/menu",
      cta2Text: "شوف المنيو",
      cta2Link: "/menu",
    },
    {
      id: "slide-3",
      badge: "أقوى قرمشة",
      title: "أكبر قطعة بروست في دسوق",
      subtitle: "قرمشة وتتبيلة سرية ملهاش زي! اطلب دلوقتي واستمتع بأقوى عروض التوفير.",
      image: initialData.heroImage3 || "/img/hero-3.png",
      cta1Text: "شوف العروض",
      cta1Link: "/menu",
      cta2Text: "المنيو كامل",
      cta2Link: "/menu",
    },
  ];

  try {
    if (initialData.heroSlides && Array.isArray(initialData.heroSlides)) {
      initialSlides = initialData.heroSlides;
    } else if (initialData.hero_slides) {
      const parsed = JSON.parse(initialData.hero_slides);
      if (Array.isArray(parsed) && parsed.length > 0) initialSlides = parsed;
    }
  } catch {}

  const [slides, setSlides] = useState<any[]>(initialSlides);

  const [form, setForm] = useState({
    brandNameAr: initialData.brandNameAr || initialData.brand_name_ar || "بروست الأسد",
    logoUrl: initialData.logoUrl || initialData.logo_url || "/img/icon-512.png",
    marqueeTextAr: initialData.marqueeTextAr || initialData.marquee_text_ar || "🔥 توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥",
    addressAr: initialData.addressAr || initialData.address_ar || "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية",
    workingHoursAr: initialData.workingHoursAr || initialData.working_hours_ar || "يومياً من 10 صباحا حتى 4 فجرا",
    hotline: initialData.hotline || "0248813666",
    whatsapp: initialData.whatsapp || "201034419424",
    branchMapsUrl: initialData.branchMapsUrl || initialData.branch_maps_url || "https://maps.app.goo.gl/tyfeGxKLMaMZ8vdJ6",
    promoTitleAr: initialData.promoTitleAr || initialData.promo_title_ar || "أكبر قطعة بروست في دسوق.. قرمشة وتتبيلة ملهاش زي! 🍗",
    promoSubtitleAr: initialData.promoSubtitleAr || initialData.promo_subtitle_ar || "اطلب دلوقتي من المنيو واستمتع بأقوى عروض التوفير العائلية والفردية، توصيل سريع وسخن لحد باب بيتك في دسوق وجميع القرى المجاورة.",
    ctaTitleAr: initialData.ctaTitleAr || initialData.cta_title_ar || "جوعان؟ الأسد مستنيك.",
    ctaSubtitleAr: initialData.ctaSubtitleAr || initialData.cta_subtitle_ar || "اطلب على واتساب لسرعه التواصل و الطلبات – أو كلمنا علي الخط الساخن 0248813666",
    footerAboutAr: initialData.footerAboutAr || initialData.footer_about_ar || "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر. جميع الوجبات تُحضر يومياً طازجة 100% بأعلى معايير الجودة.",
    footerCopyrightAr: initialData.footerCopyrightAr || initialData.footer_copyright_ar || "© 2026 بروست الأسد . جميع الحقوق محفوظة.",
    footerSloganAr: initialData.footerSloganAr || initialData.footer_slogan_ar || "توصيل سريع داخل دسوق • طعم أسدي أصلي",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // تحديث شريحة في السلايدر
  const handleSlideChange = (index: number, field: string, value: any) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // رفع صورة لشريحة
  const handleSlideImageUpload = async (index: number, file?: File | null) => {
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      handleSlideChange(index, "image", base64);
    } catch {
      setErrorMsg("فشل معالجة الصورة");
    }
  };

  // إضافة شريحة جديدة
  const handleAddSlide = () => {
    setSlides((prev) => [
      ...prev,
      {
        id: `slide-${Date.now()}`,
        badge: "عرض خاص",
        title: "عنوان العرض الجديد",
        subtitle: "تفاصيل العرض الترويجي والوجبة هنا.",
        image: "",
        cta1Text: "اطلب الآن",
        cta1Link: "/menu",
        cta2Text: "شوف المنيو",
        cta2Link: "/menu",
      },
    ]);
  };

  // حذف شريحة
  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert("يجب أن يحتوي السلايدر على شريحة واحدة على الأقل.");
      return;
    }
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setErrorMsg(null);

    try {
      const payload = {
        ...form,
        heroSlides: slides,
        heroImage1: slides[0]?.image || "",
        heroImage2: slides[1]?.image || "",
        heroImage3: slides[2]?.image || "",
      };

      const res = await saveFrontendSettingsAction(payload);
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
    "w-full rounded-xl border border-white/10 bg-carbon-950 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-brand-500 transition";

  return (
    <div dir="rtl" className="space-y-8 text-white">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 backdrop-blur-xl">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Sliders className="size-5 text-brand-500" />
            إدارة الواجهة، السلايدر والفوتر الشاملة
          </h2>
          <p className="mt-1 text-xs text-white/60">
            تحكم في صور وعناوين وأزرار السلايدر العلوي، ونصوص الفوتر السفلية، واللوجو، وروابط الخرائط.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="glow-brand flex items-center gap-2 rounded-2xl bg-brand-500 px-7 py-3 text-sm font-black text-white transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-xl"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : <Save className="size-4" />}
          <span>{saving ? "جاري الحفظ..." : saved ? "تم حفظ الواجهة بنجاح ✓" : "حفظ كل التعديلات الآن"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs font-bold text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. قسم إدارة السلايدر العلوي يدوياً (Hero Slider Manager) */}
      <div className="rounded-3xl border border-brand-500/40 bg-carbon-900/60 p-6 md:p-8 space-y-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black flex items-center gap-2 text-amber-400">
              <ImageIcon className="size-5 text-brand-500" />
              التحكم في شرائح السلايدر العلوي (Hero Slider)
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              يمكنك إضافة أو حذف شرائح، تغيير الصورة، العنوان الكبير، النص الفرعي، والزراير.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSlide}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-xs font-black text-white shadow-lg transition cursor-pointer"
          >
            <Plus className="size-4" />
            <span>إضافة شريحة جديدة للسلايدر</span>
          </button>
        </div>

        <div className="space-y-6">
          {slides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="rounded-2xl border border-white/10 bg-carbon-950/80 p-5 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-black text-amber-400">الشريحة رقم #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(idx)}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300"
                >
                  <Trash2 className="size-3.5" />
                  <span>حذف الشريحة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* معاينة ورفع صورة الشريحة */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-white/60">صورة العرض:</label>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-white/10 bg-black/60 flex items-center justify-center">
                    {slide.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={slide.image} alt={slide.title} className="size-full object-cover" />
                    ) : (
                      <span className="text-xs text-white/40">لا توجد صورة</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={slide.image || ""}
                      onChange={(e) => handleSlideChange(idx, "image", e.target.value)}
                      placeholder="رابط مباشر"
                      className={inputClass}
                    />
                    <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-[11px] font-bold hover:bg-white/20 transition">
                      <Upload className="size-3.5 text-brand-500" />
                      <span>رفع</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSlideImageUpload(idx, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>

                {/* العناوين والنصوص */}
                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1">شارة العرض (Badge):</label>
                      <input
                        type="text"
                        value={slide.badge || ""}
                        onChange={(e) => handleSlideChange(idx, "badge", e.target.value)}
                        placeholder="مثال: إصدار النار 🔥"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1">العنوان الرئيسي الكبير:</label>
                      <input
                        type="text"
                        value={slide.title || ""}
                        onChange={(e) => handleSlideChange(idx, "title", e.target.value)}
                        placeholder="مثال: الحار اللي يولّع"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/60 mb-1">النص الصغير والشرح:</label>
                    <textarea
                      rows={2}
                      value={slide.subtitle || ""}
                      onChange={(e) => handleSlideChange(idx, "subtitle", e.target.value)}
                      placeholder="وصف الوجبة والعرض..."
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1">نص الزر الأساسي (CTA 1):</label>
                      <input
                        type="text"
                        value={slide.cta1Text || ""}
                        onChange={(e) => handleSlideChange(idx, "cta1Text", e.target.value)}
                        placeholder="مثال: تحدي النار 🍗"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1">نص الزر الثانوي (CTA 2):</label>
                      <input
                        type="text"
                        value={slide.cta2Text || ""}
                        onChange={(e) => handleSlideChange(idx, "cta2Text", e.target.value)}
                        placeholder="مثال: شوف المنيو"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. قسم الشعار وهوية المتجر */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 space-y-4 backdrop-blur-xl">
        <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3">
          <Building2 className="size-4 text-brand-500" />
          شعار المتجر وهوية البراند
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-3 md:col-span-2">
            <label className="block text-xs text-white/60">شعار المطعم (Logo) - ارفع ملف أو ضع رابط:</label>
            <div className="flex gap-2">
              <input
                dir="ltr"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                className={inputClass}
              />
              <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold hover:bg-white/20 transition">
                <Upload className="size-4 text-brand-500" />
                <span>رفع لوجو</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const b64 = await compressImage(f);
                      setForm({ ...form, logoUrl: b64 });
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-white/10 bg-carbon-950">
            <span className="text-[10px] text-white/40 mb-2">معاينة الشعار</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.logoUrl} alt="Logo" className="size-20 rounded-2xl object-cover ring-2 ring-brand-500/50" />
          </div>
        </div>
      </div>

      {/* 3. موقع Google Maps وبيانات الفرع */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 space-y-4 backdrop-blur-xl">
        <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3 text-amber-400">
          <MapPin className="size-4 text-amber-400" />
          رابط Google Maps وبيانات الفرع
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-white/60 font-bold">رابط الفرع على خرائط جوجل:</label>
            <div className="flex gap-2">
              <input
                dir="ltr"
                value={form.branchMapsUrl}
                onChange={(e) => setForm({ ...form, branchMapsUrl: e.target.value })}
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
                  تجربة
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/60">العنوان بالتفصيل:</label>
              <input
                value={form.addressAr}
                onChange={(e) => setForm({ ...form, addressAr: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">مواعيد العمل:</label>
              <input
                value={form.workingHoursAr}
                onChange={(e) => setForm({ ...form, workingHoursAr: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. الجزء السفلي خالص (الفوتر - Footer Settings) */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 space-y-4 backdrop-blur-xl">
        <h3 className="flex items-center gap-2 font-extrabold text-base border-b border-white/10 pb-3">
          <FileText className="size-4 text-brand-500" />
          بيانات ونصوص الفوتر (الجزء السفلي خالص)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-white/60">نبذة تعريف المطعم في الفوتر:</label>
            <textarea
              rows={3}
              value={form.footerAboutAr}
              onChange={(e) => setForm({ ...form, footerAboutAr: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-white/60">نص حقوق الملكية (Copyright):</label>
              <input
                value={form.footerCopyrightAr}
                onChange={(e) => setForm({ ...form, footerCopyrightAr: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/60">الشعار الترويجي في الأسفل:</label>
              <input
                value={form.footerSloganAr}
                onChange={(e) => setForm({ ...form, footerSloganAr: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
