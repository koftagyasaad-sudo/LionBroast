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
  Phone,
  Sparkles,
  MessageCircle,
  PhoneCall,
} from "lucide-react";

function compressImage(file: File, maxWidth = 900, quality = 0.65): Promise<string> {
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
    if (initialData.heroSlides && Array.isArray(initialData.heroSlides) && initialData.heroSlides.length > 0) {
      initialSlides = initialData.heroSlides;
    } else if (initialData.hero_slides) {
      const parsed = JSON.parse(initialData.hero_slides);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialSlides = parsed;
      }
    }
  } catch {}

  const [slides, setSlides] = useState<any[]>(initialSlides);

  const [form, setForm] = useState({
    // هوية المطعم والشعار
    brandNameAr: initialData.brandNameAr || initialData.brand_name_ar || "بروست الأسد",
    logoUrl: initialData.logoUrl || initialData.logo_url || "/img/icon-512.png",
    marqueeTextAr:
      initialData.marqueeTextAr ||
      initialData.marquee_text_ar ||
      "🔥 توصيل سريع وساخن لجميع أنحاء دسوق | اطلب الآن واستمتع بالطعم الأسدي الأصلي 🔥",

    // 1. المكان الأول: بانر الـ VIP (أكبر قطعة بروست في دسوق)
    promoBadgeAr:
      initialData.promoBadgeAr || initialData.promo_badge_ar || "عروض ومميزات بروست الأسد VIP 🍗",
    promoTitleAr:
      initialData.promoTitleAr ||
      initialData.promo_title_ar ||
      "أكبر قطعة بروست في دسوق.. قرمشة وتتبيلة ملهاش زي! 🍗",
    promoSubtitleAr:
      initialData.promoSubtitleAr ||
      initialData.promo_subtitle_ar ||
      "اطلب دلوقتي من المنيو واستمتع بأقوى عروض التوفير العائلية والفردية، توصيل سريع وسخن لحد باب بيتك في دسوق وجميع القرى المجاورة.",
    promoBtnTextAr:
      initialData.promoBtnTextAr || initialData.promo_btn_text_ar || "اطلب الآن 🍗",
    promoBtnLink:
      initialData.promoBtnLink || initialData.promo_btn_link || "/menu",

    // 2. المكان الثاني: سكشن الفرع واللوكيشن وخرائط Google Maps
    locationTitleAr:
      initialData.locationTitleAr || initialData.location_title_ar || "شرفنا في فرع بروست الأسد 🦁",
    locationSubtitleAr:
      initialData.locationSubtitleAr ||
      initialData.location_subtitle_ar ||
      "نقدم لك أعلى جودة وأسرع خدمة تيك واي ودليفري في دسوق والمناطق المجاورة.",
    addressAr:
      initialData.addressAr ||
      initialData.address_ar ||
      "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية",
    workingHoursAr:
      initialData.workingHoursAr || initialData.working_hours_ar || "يومياً من 10 صباحا حتى 4 فجرا",
    branchMapsUrl:
      initialData.branchMapsUrl ||
      initialData.branch_maps_url ||
      "https://maps.google.com/?q=دسوق+شارع+الجيش",

    // 3. المكان الثالث: بانر الطلب السريع والواتساب (جوعان؟ الأسد مستنيك)
    ctaTitleAr: initialData.ctaTitleAr || initialData.cta_title_ar || "جوعان؟ الأسد مستنيك.",
    ctaSubtitleAr:
      initialData.ctaSubtitleAr ||
      initialData.cta_subtitle_ar ||
      "اطلب على واتساب في ٣٠ ثانية – أو كلم الخط الساخن والفرن يولّع على طول.",
    hotline: initialData.hotline || "0248813666",
    whatsapp: initialData.whatsapp || "201034419424",

    // الفوتر السفلي
    footerAboutAr:
      initialData.footerAboutAr ||
      initialData.footer_about_ar ||
      "مطعم بروست الأسد - يقدم أفضل الوجبات السريعة والبروست المقرمش في دسوق بأعلى جودة وأفضل سعر. جميع الوجبات تُحضر يومياً طازجة 100% بأعلى معايير الجودة.",
    footerCopyrightAr:
      initialData.footerCopyrightAr ||
      initialData.footer_copyright_ar ||
      "© 2026 بروست الأسد . جميع الحقوق محفوظة.",
    footerSloganAr:
      initialData.footerSloganAr ||
      initialData.footer_slogan_ar ||
      "توصيل سريع داخل دسوق • طعم أسدي أصلي",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSlideChange = (index: number, field: string, value: any) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSlideImageUpload = async (index: number, file?: File | null) => {
    if (!file) return;
    setUploadingIdx(index);
    setErrorMsg(null);
    try {
      const base64 = await compressImage(file);
      handleSlideChange(index, "image", base64);
    } catch {
      setErrorMsg("فشل معالجة وضغط الصورة، يرجى اختيار ملف صالح.");
    } finally {
      setUploadingIdx(null);
    }
  };

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
        setErrorMsg(res?.error || "فشل حفظ التعديلات في قاعدة البيانات.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "فشل الاتصال بالسيرفر أثناء الحفظ.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-carbon-950 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-brand-500 transition";

  return (
    <div dir="rtl" className="space-y-8 text-white">
      {/* الشريط العلوي وزر الحفظ */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 backdrop-blur-xl">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Sliders className="size-5 text-brand-500" />
            إدارة الواجهة والسكاشن الثلاثة الشاملة
          </h2>
          <p className="mt-1 text-xs text-white/60">
            تحكم في بانر الـ VIP، سكشن الفرع واللوكيشن المدمج، بانر الطلب والواتساب، والسلايدر.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || uploadingIdx !== null}
          className="glow-brand flex items-center gap-2 rounded-2xl bg-brand-500 px-7 py-3 text-sm font-black text-white transition hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer shadow-xl"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : saved ? (
            <Check className="size-4" />
          ) : (
            <Save className="size-4" />
          )}
          <span>{saving ? "جاري الحفظ..." : saved ? "تم حفظ كل التعديلات بنجاح ✓" : "حفظ كل التعديلات الآن"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs font-bold text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. المكان الأول: تعديل بانر العروض والمميزات VIP (أكبر قطعة بروست في دسوق) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-amber-500/40 bg-carbon-900/60 p-6 md:p-8 space-y-4 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <Sparkles className="size-5 text-amber-400" />
          <h3 className="font-extrabold text-base text-amber-400">
            المكان 1: بانر العروض والمميزات VIP (أكبر قطعة بروست في دسوق)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">الشارة العلوية (Badge):</label>
            <input
              value={form.promoBadgeAr}
              onChange={(e) => setForm({ ...form, promoBadgeAr: e.target.value })}
              placeholder="مثال: عروض ومميزات بروست الأسد VIP 🍗"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">العنوان الرئيسي للبانر:</label>
            <input
              value={form.promoTitleAr}
              onChange={(e) => setForm({ ...form, promoTitleAr: e.target.value })}
              placeholder="مثال: أكبر قطعة بروست في دسوق.. قرمشة وتتبيلة ملهاش زي! 🍗"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/70 font-bold">النص الفرعي والشرح بالبانر:</label>
          <textarea
            rows={2}
            value={form.promoSubtitleAr}
            onChange={(e) => setForm({ ...form, promoSubtitleAr: e.target.value })}
            placeholder="شرح العرض والتوصيل..."
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">نص زر البانر:</label>
            <input
              value={form.promoBtnTextAr}
              onChange={(e) => setForm({ ...form, promoBtnTextAr: e.target.value })}
              placeholder="مثال: اطلب الآن 🍗"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">رابط الزر:</label>
            <input
              dir="ltr"
              value={form.promoBtnLink}
              onChange={(e) => setForm({ ...form, promoBtnLink: e.target.value })}
              placeholder="/menu"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. المكان الثاني: تعديل سكشن الفرع واللوكيشن وخرائط Google Maps */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-brand-500/40 bg-carbon-900/60 p-6 md:p-8 space-y-4 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <MapPin className="size-5 text-brand-500" />
          <h3 className="font-extrabold text-base text-brand-400">
            المكان 2: بيانات سكشن الفرع واللوكيشن وخرائط Google Maps
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">عنوان السكشن الرئيسي:</label>
            <input
              value={form.locationTitleAr}
              onChange={(e) => setForm({ ...form, locationTitleAr: e.target.value })}
              placeholder="مثال: شرفنا في فرع بروست الأسد 🦁"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">الوصف الترحيبي للفرع:</label>
            <input
              value={form.locationSubtitleAr}
              onChange={(e) => setForm({ ...form, locationSubtitleAr: e.target.value })}
              placeholder="نقدم لك أعلى جودة وأسرع خدمة..."
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/70 font-bold">العنوان التفصيلي للفرع:</label>
          <input
            value={form.addressAr}
            onChange={(e) => setForm({ ...form, addressAr: e.target.value })}
            placeholder="دسوق - شارع الجيش - بجوار مستشفي النيل..."
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">مواعيد العمل:</label>
            <input
              value={form.workingHoursAr}
              onChange={(e) => setForm({ ...form, workingHoursAr: e.target.value })}
              placeholder="يومياً من 10 صباحا حتى 4 فجرا"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">رابط الفرع على خرائط جوجل (Maps):</label>
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
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 transition shrink-0"
                >
                  <ExternalLink className="size-3.5" />
                  تجربة
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. المكان الثالث: تعديل بانر الطلب السريع والواتساب (جوعان؟ الأسد مستنيك) */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-emerald-500/40 bg-carbon-900/60 p-6 md:p-8 space-y-4 backdrop-blur-xl">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <PhoneCall className="size-5 text-emerald-400" />
          <h3 className="font-extrabold text-base text-emerald-400">
            المكان 3: بيانات بانر الطلب السريع والواتساب (جوعان؟ الأسد مستنيك)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">العنوان التشويقي:</label>
            <input
              value={form.ctaTitleAr}
              onChange={(e) => setForm({ ...form, ctaTitleAr: e.target.value })}
              placeholder="مثال: جوعان؟ الأسد مستنيك."
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold">نص الحث على الطلب:</label>
            <input
              value={form.ctaSubtitleAr}
              onChange={(e) => setForm({ ...form, ctaSubtitleAr: e.target.value })}
              placeholder="اطلب على واتساب في ٣٠ ثانية..."
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold flex items-center gap-1">
              <Phone className="size-3.5 text-brand-400" />
              رقم الخط الساخن للطلبات:
            </label>
            <input
              dir="ltr"
              value={form.hotline}
              onChange={(e) => setForm({ ...form, hotline: e.target.value })}
              placeholder="0248813666"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/70 font-bold flex items-center gap-1">
              <MessageCircle className="size-3.5 text-emerald-400" />
              رقم الواتساب السريع:
            </label>
            <input
              dir="ltr"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="201034419424"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* قسم السلايدر العلوي */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 space-y-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-black flex items-center gap-2 text-white">
              <ImageIcon className="size-5 text-brand-500" />
              التحكم في شرائح السلايدر العلوي (Hero Slider)
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              إضافة وحذف شرائح، تغيير الصورة، العنوان الكبير، النص الفرعي، والزراير.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSlide}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-xs font-black text-white shadow-lg transition cursor-pointer"
          >
            <Plus className="size-4" />
            <span>إضافة شريحة جديدة</span>
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
                  className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>حذف الشريحة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
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
                      {uploadingIdx === idx ? (
                        <Loader2 className="size-3.5 animate-spin text-brand-500" />
                      ) : (
                        <Upload className="size-3.5 text-brand-500" />
                      )}
                      <span>{uploadingIdx === idx ? "جاري..." : "رفع"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingIdx !== null}
                        className="hidden"
                        onChange={(e) => handleSlideImageUpload(idx, e.target.files?.[0])}
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1">شارة العرض (Badge):</label>
                      <input
                        type="text"
                        value={slide.badge || ""}
                        onChange={(e) => handleSlideChange(idx, "badge", e.target.value)}
                        placeholder="إصدار النار 🔥"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1">العنوان الرئيسي الكبير:</label>
                      <input
                        type="text"
                        value={slide.title || ""}
                        onChange={(e) => handleSlideChange(idx, "title", e.target.value)}
                        placeholder="الحار اللي يولّع"
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
                      placeholder="وصف الوجبة..."
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
                        placeholder="تحدي النار 🍗"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-white/60 mb-1">نص الزر الثانوي (CTA 2):</label>
                      <input
                        type="text"
                        value={slide.cta2Text || ""}
                        onChange={(e) => handleSlideChange(idx, "cta2Text", e.target.value)}
                        placeholder="شوف المنيو"
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

      {/* قسم الشعار وهوية المتجر */}
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
                      const b64 = await compressImage(f, 400, 0.7);
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

      {/* بيانات ونصوص الفوتر (الجزء السفلي خالص) */}
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
