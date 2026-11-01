"use client";

import { useState } from "react";
import {
  saveZonesAndPromoAction,
  savePromoAction,
  saveOpsSettingsAction,
} from "@/app/admin-actions";
import {
  MapPin,
  Clock,
  Bike,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Megaphone,
  Loader2,
  RefreshCw,
  Store,
} from "lucide-react";

export default function OpsTab({ bundle, onReload, settings: propSettings, zones: propZones }: any) {
  const initialSettings = bundle?.settings || propSettings || {};
  const initialZones = bundle?.deliveryZones || bundle?.zones || propZones || [];

  const [zones, setZones] = useState<any[]>(
    initialZones.length > 0
      ? initialZones
      : [
          { nameAr: "وسط البلد - شارع الجيش والميدان", deliveryFee: 10, estimatedMinutes: "20-30 دقيقة" },
          { nameAr: "محيط مستشفى النيل ودرويش", deliveryFee: 10, estimatedMinutes: "20-30 دقيقة" },
          { nameAr: "شارع الشركات والكورنيش", deliveryFee: 15, estimatedMinutes: "25-35 دقيقة" },
          { nameAr: "طريق فوة والقرى المجاورة", deliveryFee: 25, estimatedMinutes: "35-45 دقيقة" },
        ]
  );

  const [promoEnabled, setPromoEnabled] = useState<boolean>(
    initialSettings.promo_enabled === "true" || initialSettings.promo?.enabled !== false
  );
  const [promoText, setPromoText] = useState<string>(
    initialSettings.promo_text_ar || initialSettings.promo?.textAr || "عرض خاص: اطلب وجبة الأسد العائلية واحصل على لتر كولا هدية مجاناً 🍗"
  );

  const [hotline, setHotline] = useState<string>(initialSettings.hotline || "0248813666");
  const [whatsapp, setWhatsapp] = useState<string>(initialSettings.whatsapp || "201034419424");
  const [address, setAddress] = useState<string>(
    initialSettings.addressAr || initialSettings.address_ar || "دسوق - شارع الجيش - بجوار مستشفي النيل - أمام درويش للأجهزة الكهربائية"
  );
  const [workingHours, setWorkingHours] = useState<string>(
    initialSettings.workingHoursAr || initialSettings.working_hours_ar || "يومياً من 10 صباحا حتى 4 فجرا"
  );

  const [zonesSyncLoading, setZonesSyncLoading] = useState(false);
  const [promoSaving, setPromoSaving] = useState(false);
  const [opsSaving, setOpsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddZoneRow = () => {
    setZones((prev) => [
      ...prev,
      { nameAr: "منطقة جديدة في دسوق", deliveryFee: 15, estimatedMinutes: "25-35 دقيقة" },
    ]);
  };

  const handleUpdateZoneField = (idx: number, field: string, val: any) => {
    setZones((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleDeleteZoneRow = (idx: number) => {
    setZones((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSyncAllZones = async () => {
    setZonesSyncLoading(true);
    try {
      const res = await saveZonesAndPromoAction({
        zones,
        promo: { enabled: promoEnabled, textAr: promoText },
      });

      if (res.success) {
        showToast("تمت مزامنة مناطق وأسعار التوصيل مع الواجهة الرئيسية بنجاح 🛵");
        onReload?.();
      } else {
        alert("فشلت المزامنة، يرجى المحاولة مرة أخرى.");
      }
    } catch {
      alert("حدث خطأ في الاتصال بالسيرفر.");
    } finally {
      setZonesSyncLoading(false);
    }
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoSaving(true);
    try {
      const res = await savePromoAction({
        enabled: promoEnabled,
        textAr: promoText.trim(),
        title: promoText.trim(),
      });

      if (res.success) {
        showToast("تم حفظ ونشر شريط العرض المؤقت في الواجهة فوراً 📢");
        onReload?.();
      }
    } catch {
      alert("حدث خطأ أثناء حفظ الإعلان.");
    } finally {
      setPromoSaving(false);
    }
  };

  const handleSaveOps = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsSaving(true);
    try {
      const res = await saveOpsSettingsAction({
        hotline: hotline.trim(),
        whatsapp: whatsapp.trim(),
        addressAr: address.trim(),
        address_ar: address.trim(),
        workingHoursAr: workingHours.trim(),
        working_hours_ar: workingHours.trim(),
      });

      if (res.success) {
        showToast("تم حفظ بيانات الفرع والاتصال ومواعيد العمل بنجاح 📞");
        onReload?.();
      }
    } catch {
      alert("حدث خطأ أثناء حفظ الإعدادات.");
    } finally {
      setOpsSaving(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs font-black text-white shadow-2xl animate-bounce">
          <CheckCircle2 className="size-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. إدارة ومزامنة مناطق التوصيل */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-black text-emerald-400">
              <Bike className="size-3.5" />
              <span>مناطق وأسعار الدليفري الميداني في دسوق</span>
            </span>
            <h3 className="text-xl font-black text-white">
              جدول مناطق التوصيل والأسعار ({zones.length})
            </h3>
            <p className="text-xs text-zinc-400">
              عدّل الأسعار والدقائق مباشرة، ثم اضغط على زر "مزامنة الآن" لتظهر فوراً في الواجهة الرئيسية.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleAddZoneRow}
              className="flex items-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer"
            >
              <Plus className="size-3.5 text-emerald-400" />
              <span>إضافة منطقة</span>
            </button>

            <button
              type="button"
              disabled={zonesSyncLoading}
              onClick={handleSyncAllZones}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-black text-white shadow-xl transition cursor-pointer disabled:opacity-50"
            >
              {zonesSyncLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              <span>{zonesSyncLoading ? "جاري المزامنة..." : "مزامنة وحفظ المناطق في الواجهة ⚡"}</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {zones.map((z, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 hover:border-zinc-700 transition"
            >
              <div className="flex items-center gap-2 flex-1">
                <MapPin className="size-4 text-orange-500 shrink-0" />
                <input
                  type="text"
                  value={z.nameAr || z.name || ""}
                  onChange={(e) => handleUpdateZoneField(idx, "nameAr", e.target.value)}
                  placeholder="اسم الحي أو القرية..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-32">
                  <span className="text-[11px] font-bold text-zinc-400 shrink-0">السعر:</span>
                  <input
                    type="number"
                    min="0"
                    value={z.deliveryFee ?? z.fee ?? 0}
                    onChange={(e) => handleUpdateZoneField(idx, "deliveryFee", Number(e.target.value))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs font-black text-emerald-400 text-center font-mono outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-zinc-500 font-bold">ج.م</span>
                </div>

                <div className="flex items-center gap-1.5 w-36">
                  <Clock className="size-3.5 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={z.estimatedMinutes || z.time || "25-35 دقيقة"}
                    onChange={(e) => handleUpdateZoneField(idx, "estimatedMinutes", e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-2 text-xs font-bold text-white text-center outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteZoneRow(idx)}
                  className="grid size-9 place-items-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                  title="حذف المنطقة"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. إدارة الإعلانات والعروض المؤقتة */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-black text-amber-300">
              <Megaphone className="size-3.5" />
              <span>بانر الإعلانات الترويجية والعروض المؤقتة</span>
            </span>
            <h3 className="text-xl font-black text-white">إعلان الواجهة المؤقت 📢</h3>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
            <span>تفعيل الإعلان:</span>
            <input
              type="checkbox"
              checked={promoEnabled}
              onChange={(e) => setPromoEnabled(e.target.checked)}
              className="size-4 accent-orange-600 rounded cursor-pointer"
            />
          </label>
        </div>

        <form onSubmit={handleSavePromo} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1.5">
              نص العرض أو الإعلان الترويجي:
            </label>
            <textarea
              rows={2}
              required
              value={promoText}
              onChange={(e) => setPromoText(e.target.value)}
              placeholder="اكتب تفاصيل العرض الترويجي ليظهر في أعلى الصفحة الرئيسية..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-3.5 text-xs font-bold text-white outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={promoSaving}
              className="flex items-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-500 px-6 py-2.5 text-xs font-black text-white shadow-xl transition cursor-pointer disabled:opacity-50"
            >
              {promoSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              <span>حفظ ونشر الإعلان فوراً</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3. بيانات الفرع والتواصل */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="border-b border-zinc-800 pb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-0.5 text-xs font-black text-blue-400">
            <Store className="size-3.5" />
            <span>معلومات الفرع وأرقام الدليفري المباشرة</span>
          </span>
          <h3 className="text-xl font-black text-white mt-1">بيانات التواصل والفرع 📞</h3>
        </div>

        <form onSubmit={handleSaveOps} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">الخط الساخن للطلبات:</label>
            <input
              type="text"
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">رقم الواتساب:</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">عنوان الفرع في دسوق:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-bold text-zinc-300 mb-1">مواعيد العمل واستقبال الطلبات:</label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={opsSaving}
              className="flex items-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-500 px-6 py-2.5 text-xs font-black text-white shadow-xl transition cursor-pointer disabled:opacity-50"
            >
              {opsSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              <span>حفظ بيانات الفرع</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
