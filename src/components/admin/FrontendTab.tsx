"use client";

import { useState } from "react";
import { Check, Save, Type, MessageSquare, PhoneCall, MapPin, Store } from "lucide-react";
import type { TabProps } from "@/components/admin/AdminShell";
import { adminSetSettingAction } from "@/app/admin-actions";

const input =
  "rounded-xl border border-white/10 bg-carbon-950 px-3 py-2 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-500 w-full";

export default function FrontendTab({ token, data, refresh }: TabProps) {
  const settingsMap = Object.fromEntries(data.settings.map((s) => [s.key, s.value]));
  
  const [content, setContent] = useState({
    // الهوية الأساسية
    brandAr: settingsMap.brand_ar ?? "بروست الأسد",
    brandEn: settingsMap.brand_en ?? "Broast El-Assad",
    addressAr: settingsMap.address_ar ?? "شارع الجمهورية، دسوق، كفر الشيخ",
    addressEn: settingsMap.address_en ?? "El-Gomhoria St., Desouk, Kafr El-Sheikh",
    hours: settingsMap.hours ?? "12:00 PM — 3:00 AM",
    
    // الهيرو
    heroTitleAr: settingsMap.hero_title_ar ?? "الحار اللي يولّع",
    heroTitleEn: settingsMap.hero_title_en ?? "The Fire Edition",
    heroSubAr: settingsMap.hero_sub_ar ?? "ستريبس النار بغمسة الهالبينو المدخنة. خصم ٢٠٪ طوال الأسبوع — جرّبها لو قدها.",
    heroSubEn: settingsMap.hero_sub_en ?? "Fire strips with smoked jalapeño dip. 20% off all week — try it if you dare.",
    
    // إضافات
    marqueeAr: settingsMap.marquee_ar ?? "دجاج طازج يومياً 🔥 تتبيلة سرية من 1998 🔥 كرسبي ١٠٠٪",
    marqueeEn: settingsMap.marquee_en ?? "Fresh Chicken Daily 🔥 Secret Recipe since 1998 🔥 100% Crispy",
    aboutAr: settingsMap.about_ar ?? "من قلب دسوق للبيوت المصرية — بروست بكراسة سرية من 1998، دجاج طازج يومياً، وزيت بيتغير كل شوية.",
    aboutEn: settingsMap.about_en ?? "From the heart of Desouk to Egyptian homes — broast with a secret recipe since 1998.",
    hotline: settingsMap.hotline ?? "19955",
    whatsapp: settingsMap.whatsapp ?? "201000001555",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveContent = async () => {
    setSaving(true);
    await adminSetSettingAction(token, "brand_ar", content.brandAr);
    await adminSetSettingAction(token, "brand_en", content.brandEn);
    await adminSetSettingAction(token, "address_ar", content.addressAr);
    await adminSetSettingAction(token, "address_en", content.addressEn);
    await adminSetSettingAction(token, "hours", content.hours);
    
    await adminSetSettingAction(token, "hero_title_ar", content.heroTitleAr);
    await adminSetSettingAction(token, "hero_title_en", content.heroTitleEn);
    await adminSetSettingAction(token, "hero_sub_ar", content.heroSubAr);
    await adminSetSettingAction(token, "hero_sub_en", content.heroSubEn);
    
    await adminSetSettingAction(token, "marquee_ar", content.marqueeAr);
    await adminSetSettingAction(token, "marquee_en", content.marqueeEn);
    await adminSetSettingAction(token, "about_ar", content.aboutAr);
    await adminSetSettingAction(token, "about_en", content.aboutEn);
    await adminSetSettingAction(token, "hotline", content.hotline);
    await adminSetSettingAction(token, "whatsapp", content.whatsapp);
    
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
    await refresh();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2 pb-10">
      
      {/* القسم الأول: بيانات المطعم (جديد) */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900 p-5 lg:col-span-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-white">
          <Store className="size-5 text-emerald-500" /> الهوية وبيانات المطعم
        </h2>
        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">اسم المطعم (عربي)</p><input className={input} value={content.brandAr} onChange={(e) => setContent({ ...content, brandAr: e.target.value })} /></div>
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Brand Name (English)</p><input className={input} dir="ltr" value={content.brandEn} onChange={(e) => setContent({ ...content, brandEn: e.target.value })} /></div>
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">العنوان (عربي)</p><input className={input} value={content.addressAr} onChange={(e) => setContent({ ...content, addressAr: e.target.value })} /></div>
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Address (English)</p><input className={input} dir="ltr" value={content.addressEn} onChange={(e) => setContent({ ...content, addressEn: e.target.value })} /></div>
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">مواعيد العمل</p><input className={input} dir="ltr" value={content.hours} onChange={(e) => setContent({ ...content, hours: e.target.value })} /></div>
        </div>
      </div>

      {/* القسم الثاني: الهيرو */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900 p-5">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Type className="size-5 text-brand-500" /> الواجهة الرئيسية (Hero)
        </h2>
        <div className="mt-5 space-y-4">
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">العنوان الرئيسي (عربي)</p><input className={input} value={content.heroTitleAr} onChange={(e) => setContent({ ...content, heroTitleAr: e.target.value })} /></div>
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Main Title (English)</p><input className={input} dir="ltr" value={content.heroTitleEn} onChange={(e) => setContent({ ...content, heroTitleEn: e.target.value })} /></div>
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">الوصف (عربي)</p><textarea className={input} rows={2} value={content.heroSubAr} onChange={(e) => setContent({ ...content, heroSubAr: e.target.value })} /></div>
          <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Subtitle (English)</p><textarea className={input} rows={2} dir="ltr" value={content.heroSubEn} onChange={(e) => setContent({ ...content, heroSubEn: e.target.value })} /></div>
        </div>
      </div>

      {/* القسم الثالث: إعدادات إضافية وأرقام التواصل */}
      <div className="flex flex-col gap-5">
        <div className="rounded-3xl border border-white/10 bg-carbon-900 p-5">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <MessageSquare className="size-5 text-cheese-400" /> نصوص وإعدادات إضافية
          </h2>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1"><PhoneCall className="size-3"/> الخط الساخن</p><input className={input} dir="ltr" value={content.hotline} onChange={(e) => setContent({ ...content, hotline: e.target.value })} /></div>
              <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40 flex items-center gap-1"><PhoneCall className="size-3 text-[#25D366]"/> الواتساب (بالكود)</p><input className={input} dir="ltr" placeholder="2010..." value={content.whatsapp} onChange={(e) => setContent({ ...content, whatsapp: e.target.value })} /></div>
            </div>
            <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">الشريط المتحرك (عربي) - افصل بـ 🔥</p><textarea className={input} rows={2} value={content.marqueeAr} onChange={(e) => setContent({ ...content, marqueeAr: e.target.value })} /></div>
            <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Marquee (English) - Sep by 🔥</p><textarea className={input} rows={2} dir="ltr" value={content.marqueeEn} onChange={(e) => setContent({ ...content, marqueeEn: e.target.value })} /></div>
            <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">وصف الفوتر (عربي)</p><textarea className={input} rows={2} value={content.aboutAr} onChange={(e) => setContent({ ...content, aboutAr: e.target.value })} /></div>
            <div><p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Footer About (English)</p><textarea className={input} rows={2} dir="ltr" value={content.aboutEn} onChange={(e) => setContent({ ...content, aboutEn: e.target.value })} /></div>
          </div>
        </div>

        {/* زر الحفظ */}
        <button onClick={saveContent} disabled={saving} className="glow-brand flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4 text-sm font-extrabold text-white transition hover:scale-[1.01] disabled:opacity-50">
          {saved ? <Check className="size-5" /> : <Save className="size-5" />}
          {saved ? "تم الحفظ بنجاح" : "حفظ كل التعديلات"}
        </button>
      </div>
    </div>
  );
}
