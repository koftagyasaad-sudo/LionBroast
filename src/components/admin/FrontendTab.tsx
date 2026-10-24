"use client";

import { useState } from "react";
import { Check, MonitorSmartphone, Save, Type, MessageSquare } from "lucide-react";
import type { TabProps } from "@/components/admin/AdminShell";
import { adminSetSettingAction } from "@/app/admin-actions";

const input =
  "rounded-xl border border-white/10 bg-carbon-950 px-3 py-2 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-500 w-full";

export default function FrontendTab({ token, data, refresh }: TabProps) {
  // بنجيب البيانات الحالية من قاعدة البيانات
  const settingsMap = Object.fromEntries(data.settings.map((s) => [s.key, s.value]));
  
  const [content, setContent] = useState({
    heroTitleAr: settingsMap.hero_title_ar ?? "الحار اللي يولّع",
    heroTitleEn: settingsMap.hero_title_en ?? "The Fire Edition",
    heroSubAr: settingsMap.hero_sub_ar ?? "ستريبس النار بغمسة الهالبينو المدخنة. خصم ٢٠٪ طوال الأسبوع — جرّبها لو قدها.",
    heroSubEn: settingsMap.hero_sub_en ?? "Fire strips with smoked jalapeño dip. 20% off all week — try it if you dare.",
    marqueeAr: settingsMap.marquee_ar ?? "دجاج طازج يومياً 🔥 تتبيلة سرية من 1998 🔥 كرسبي ١٠٠٪",
    marqueeEn: settingsMap.marquee_en ?? "Fresh Chicken Daily 🔥 Secret Recipe since 1998 🔥 100% Crispy",
    aboutAr: settingsMap.about_ar ?? "من قلب دسوق للبيوت المصرية — بروست بكراسة سرية من 1998، دجاج طازج يومياً، وزيت بيتغير كل شوية.",
    aboutEn: settingsMap.about_en ?? "From the heart of Desouk to Egyptian homes — broast with a secret recipe since 1998.",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveContent = async () => {
    setSaving(true);
    // حفظ كل النصوص في الداتا بيز
    await adminSetSettingAction(token, "hero_title_ar", content.heroTitleAr);
    await adminSetSettingAction(token, "hero_title_en", content.heroTitleEn);
    await adminSetSettingAction(token, "hero_sub_ar", content.heroSubAr);
    await adminSetSettingAction(token, "hero_sub_en", content.heroSubEn);
    await adminSetSettingAction(token, "marquee_ar", content.marqueeAr);
    await adminSetSettingAction(token, "marquee_en", content.marqueeEn);
    await adminSetSettingAction(token, "about_ar", content.aboutAr);
    await adminSetSettingAction(token, "about_en", content.aboutEn);
    
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
    await refresh();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      
      {/* القسم الأول: الهيرو (الواجهة الرئيسية) */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900 p-5">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Type className="size-5 text-brand-500" /> الواجهة الرئيسية · Hero Section
        </h2>
        <p className="mt-1 text-xs text-white/45">النصوص الأساسية اللي بتظهر للعميل أول ما يفتح الموقع.</p>

        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">العنوان الرئيسي (عربي)</p>
            <input className={input} value={content.heroTitleAr} onChange={(e) => setContent({ ...content, heroTitleAr: e.target.value })} />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Main Title (English)</p>
            <input className={input} dir="ltr" value={content.heroTitleEn} onChange={(e) => setContent({ ...content, heroTitleEn: e.target.value })} />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">الوصف تحت العنوان (عربي)</p>
            <textarea className={input} rows={2} value={content.heroSubAr} onChange={(e) => setContent({ ...content, heroSubAr: e.target.value })} />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Subtitle (English)</p>
            <textarea className={input} rows={2} dir="ltr" value={content.heroSubEn} onChange={(e) => setContent({ ...content, heroSubEn: e.target.value })} />
          </div>
        </div>
      </div>

      {/* القسم الثاني: الشريط المتحرك ووصف الفوتر */}
      <div className="flex flex-col gap-5">
        <div className="rounded-3xl border border-white/10 bg-carbon-900 p-5">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <MessageSquare className="size-5 text-cheese-400" /> نصوص إضافية · Extra Text
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">الشريط المتحرك (عربي) - افصل بـ 🔥</p>
              <textarea className={input} rows={2} value={content.marqueeAr} onChange={(e) => setContent({ ...content, marqueeAr: e.target.value })} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">Marquee (English) - Sep by 🔥</p>
              <textarea className={input} rows={2} dir="ltr" value={content.marqueeEn} onChange={(e) => setContent({ ...content, marqueeEn: e.target.value })} />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">وصف المطعم في الفوتر (عربي)</p>
              <textarea className={input} rows={2} value={content.aboutAr} onChange={(e) => setContent({ ...content, aboutAr: e.target.value })} />
            </div>
          </div>
        </div>

        {/* زر الحفظ الرئيسي */}
        <button
          onClick={saveContent}
          disabled={saving}
          className="glow-brand flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-4 text-sm font-extrabold text-white transition hover:scale-[1.01] disabled:opacity-50"
        >
          {saved ? <Check className="size-5" /> : <Save className="size-5" />}
          {saved ? "تم الحفظ بنجاح" : "حفظ كل التعديلات المباشرة"}
        </button>
      </div>

    </div>
  );
}
