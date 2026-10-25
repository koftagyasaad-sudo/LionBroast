"use client";

import { useState } from "react";
import { saveFrontendSettingsAction } from "@/app/admin-actions";
import { FrontendSettings } from "@/db/queries";
import { Save, Image as ImageIcon, Check, Globe, Phone, Clock, MapPin, Sparkles, Building } from "lucide-react";

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
      <div className="flex items-center justify-between border-b pb-4 dark:border-zinc-800">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Building className="w-6 h-6 text-rose-600" />
            إعدادات هوية الموقع والمحتوى (CMS)
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            قم بتعديل اللوجو، الاسم، النصوص الرئيسية، وبيانات التواصل لتظهر على الواجهة مباشرة.
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
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

      <form onSubmit={handleSave} className="space-y-8">
        {/* Brand & Logo Settings */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-3 dark:border-zinc-800">
            <Globe className="w-5 h-5 text-rose-500" />
            هوية العلامة التجارية واللوجو
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                اسم العلامة التجارية (عربي)
              </label>
              <input
                type="text"
                value={formData.brand_ar}
                onChange={(e) => handleChange("brand_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                اسم العلامة التجارية (إنجليزي)
              </label>
              <input
                type="text"
                value={formData.brand_en}
                onChange={(e) => handleChange("brand_en", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-rose-500" />
              رابط شعار / لوجو الموقع (Logo URL)
            </label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logo_url || ""}
              onChange={(e) => handleChange("logo_url", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none text-left"
              dir="ltr"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              ضع رابط صورة اللوجو (PNG أو SVG بخلفية شفافة يفضل). في حال تركه فارغاً سيتم إظهار اسم المطعم كنص.
            </p>

            {formData.logo_url && (
              <div className="mt-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl inline-flex items-center gap-3">
                <span className="text-xs text-zinc-500">معاينة اللوجو:</span>
                <img
                  src={formData.logo_url}
                  alt="Logo Preview"
                  className="h-10 w-auto object-contain max-w-[150px]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Hero Banner Settings */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-3 dark:border-zinc-800">
            <Sparkles className="w-5 h-5 text-amber-500" />
            واجهة الصفحة الرئيسية (Hero Section)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                العنوان الرئيسي (عربي)
              </label>
              <input
                type="text"
                value={formData.hero_title_ar}
                onChange={(e) => handleChange("hero_title_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                العنوان الرئيسي (إنجليزي)
              </label>
              <input
                type="text"
                value={formData.hero_title_en}
                onChange={(e) => handleChange("hero_title_en", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                الوصف الفرعي (عربي)
              </label>
              <textarea
                rows={2}
                value={formData.hero_subtitle_ar}
                onChange={(e) => handleChange("hero_subtitle_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                الوصف الفرعي (إنجليزي)
              </label>
              <textarea
                rows={2}
                value={formData.hero_subtitle_en}
                onChange={(e) => handleChange("hero_subtitle_en", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              رابط صورة البانر الرئيسي (Hero Image URL)
            </label>
            <input
              type="url"
              value={formData.hero_image_url}
              onChange={(e) => handleChange("hero_image_url", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none text-left"
              dir="ltr"
            />
          </div>
        </div>

        {/* Dynamic Ticker / Marquee */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-3 dark:border-zinc-800">
            <Clock className="w-5 h-5 text-blue-500" />
            شريط الإعلانات العريض (Marquee Ticker)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                نص الشريط (عربي)
              </label>
              <input
                type="text"
                value={formData.marquee_text_ar}
                onChange={(e) => handleChange("marquee_text_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                نص الشريط (إنجليزي)
              </label>
              <input
                type="text"
                value={formData.marquee_text_en}
                onChange={(e) => handleChange("marquee_text_en", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-3 dark:border-zinc-800">
            <Phone className="w-5 h-5 text-emerald-500" />
            بيانات التواصل والعنوان
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                الخط الساخن / الهاتف
              </label>
              <input
                type="text"
                value={formData.hotline}
                onChange={(e) => handleChange("hotline", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                رقم الواتساب (بالكود الدولي)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none text-left"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                العنوان (عربي)
              </label>
              <input
                type="text"
                value={formData.address_ar}
                onChange={(e) => handleChange("address_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                مواعيد العمل (عربي)
              </label>
              <input
                type="text"
                value={formData.working_hours_ar}
                onChange={(e) => handleChange("working_hours_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer About Text */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-3 dark:border-zinc-800">
            <MapPin className="w-5 h-5 text-purple-500" />
            نص أسفل الصفحة (Footer)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                نبذة عن المطعم (عربي)
              </label>
              <textarea
                rows={3}
                value={formData.footer_about_ar}
                onChange={(e) => handleChange("footer_about_ar", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                نبذة عن المطعم (إنجليزي)
              </label>
              <textarea
                rows={3}
                value={formData.footer_about_en}
                onChange={(e) => handleChange("footer_about_en", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold px-8 py-3 rounded-xl shadow-xl shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-5 h-5 text-emerald-300" />
                <span>تم الحفظ!</span>
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
