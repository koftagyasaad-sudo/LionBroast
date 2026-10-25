"use client";

import { useState } from "react";
import { saveFrontendSettingsAction } from "@/app/admin-actions";
import { FrontendSettings } from "@/db/queries";
import { Save, Image as ImageIcon, Check, Globe, Phone, Sparkles, Building2, MapPin, Clock } from "lucide-react";

interface FrontendTabProps {
  initialSettings: FrontendSettings;
}

export default function FrontendTab({ initialSettings }: FrontendTabProps) {
  const [formData, setFormData] = useState<FrontendSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (key: keyof FrontendSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setSavedSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await saveFrontendSettingsAction(formData);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert("حدث خطأ أثناء الحفظ: " + res.error);
      }
    } catch (err) {
      alert("حدث خطأ غير متوقع أثناء الحفظ.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12" dir="rtl">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-orange-500" />
            إعدادات الواجهة · Site Content
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            التحكم الشامل بنصوص الموقع، اللوجو، الخط الساخن، والعناوين من مكان واحد.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <Check className="w-5 h-5 text-emerald-300" />
              <span>تم الحفظ بنجاح!</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Brand & Logo */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Globe className="w-5 h-5 text-orange-500" />
            هوية العلامة التجارية واللوجو (Brand & Logo)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-2">
                اسم المطعم (عربي)
              </label>
              <input
                type="text"
                value={formData.brand_ar}
                onChange={(e) => handleChange("brand_ar", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-2">
                Brand Name (English)
              </label>
              <input
                type="text"
                value={formData.brand_en}
                onChange={(e) => handleChange("brand_en", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-left"
                dir="ltr"
                required
              />
            </div>
          </div>

          {/* Logo URL Input Field */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-amber-400 tracking-wider uppercase flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              رابط شعار / لوجو المطعم (Logo Image URL)
            </label>
            <input
              type="url"
              placeholder="https://i.postimg.cc/xxx/logo.png"
              value={formData.logo_url || ""}
              onChange={(e) => handleChange("logo_url", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-amber-500/30 bg-zinc-950 text-amber-300 focus:ring-2 focus:ring-orange-500 focus:outline-none text-left"
              dir="ltr"
            />
            <p className="text-xs text-zinc-500">
              ارفع صوّرة اللوجو بفرعية شّفافة PNG ثم ضع رابط الصورة المباشر هنا ليحل مكان اسم المطعم النصي.
            </p>

            {formData.logo_url && (
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-4">
                <span className="text-xs text-zinc-400">معاينة اللوجو الحالي:</span>
                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <img
                    src={formData.logo_url}
                    alt="Logo Preview"
                    className="h-10 w-auto object-contain max-w-[180px]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Main Hero Content & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Hero */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              الواجهة الرئيسية (Hero)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5">
                العنوان الرئيسي (عربي)
              </label>
              <input
                type="text"
                value={formData.hero_title_ar}
                onChange={(e) => handleChange("hero_title_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5">
                Main Title (English)
              </label>
              <input
                type="text"
                value={formData.hero_title_en}
                onChange={(e) => handleChange("hero_title_en", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5">
                الوصف (عربي)
              </label>
              <textarea
                rows={2}
                value={formData.hero_subtitle_ar}
                onChange={(e) => handleChange("hero_subtitle_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5">
                Subtitle (English)
              </label>
              <textarea
                rows={2}
                value={formData.hero_subtitle_en}
                onChange={(e) => handleChange("hero_subtitle_en", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm text-left"
                dir="ltr"
              />
            </div>
          </div>

          {/* Contact Details & Addresses */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Phone className="w-5 h-5 text-emerald-500" />
              بيانات التواصل والعنوان
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> الخط الساخن
                </label>
                <input
                  type="text"
                  value={formData.hotline}
                  onChange={(e) => handleChange("hotline", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> الواتساب (بالكود)
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" /> العنوان (عربي)
              </label>
              <input
                type="text"
                value={formData.address_ar}
                onChange={(e) => handleChange("address_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> مواعيد العمل
              </label>
              <input
                type="text"
                value={formData.working_hours_ar}
                onChange={(e) => handleChange("working_hours_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Marquee & Footer Texts */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3">
            الشريط المتحرك ونصوص أسفل الصفحة (Footer)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5">
                الشريط المتحرك (عربي)
              </label>
              <textarea
                rows={2}
                value={formData.marquee_text_ar}
                onChange={(e) => handleChange("marquee_text_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5">
                Marquee (English)
              </label>
              <textarea
                rows={2}
                value={formData.marquee_text_en}
                onChange={(e) => handleChange("marquee_text_en", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5">
                وصف الفوتر (عربي)
              </label>
              <textarea
                rows={2}
                value={formData.footer_about_ar}
                onChange={(e) => handleChange("footer_about_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-1.5">
                Footer About (English)
              </label>
              <textarea
                rows={2}
                value={formData.footer_about_en}
                onChange={(e) => handleChange("footer_about_en", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:ring-2 focus:ring-orange-500 focus:outline-none text-sm text-left"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-xl shadow-orange-500/20 transition-all disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>تم حفظ التغييرات بنجاح!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>{isSaving ? "جاري الحفظ..." : "حفظ جميع التغييرات"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
