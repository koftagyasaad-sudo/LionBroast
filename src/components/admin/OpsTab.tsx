"use client";

import { useState } from "react";
import {
  savePromoAction,
  upsertZoneAction,
  deleteZoneAction,
} from "@/app/admin-actions";
import {
  Megaphone,
  MapPin,
  Clock,
  Coins,
  Plus,
  Trash2,
  Save,
  Check,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";

interface OpsTabProps {
  token?: string;
  data?: any;
  refresh?: () => void;
}

export default function OpsTab({ token, data, refresh }: OpsTabProps) {
  // 1. حالة لوحة الإعلانات (Promo Bulletin)
  const promoInit = data?.promo || data?.bulletin || {};
  const [promoEnabled, setPromoEnabled] = useState<boolean>(
    promoInit.enabled !== false && promoInit.visible !== false
  );
  const [promoTextAr, setPromoTextAr] = useState<string>(
    promoInit.textAr ||
      promoInit.text ||
      "العرض الأكثر مبيعاً كل اسبوع‼️ اسأل على سعر الاكستريم بوكس يوم التلات"
  );
  const [promoCode, setPromoCode] = useState<string>(promoInit.code || "LION15");
  const [savingPromo, setSavingPromo] = useState(false);
  const [promoSuccess, setPromoSuccess] = useState(false);

  // 2. حالة مناطق التوصيل (Delivery Zones)
  const initialZones: any[] = Array.isArray(data?.zones)
    ? data.zones
    : Array.isArray(data?.deliveryZones)
    ? data.deliveryZones
    : [];

  const [zonesList, setZonesList] = useState<any[]>(initialZones);

  // حقول إضافة منطقة جديدة
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneFee, setNewZoneFee] = useState<number>(15);
  const [newZoneTime, setNewZoneTime] = useState<number>(25);
  const [addingZone, setAddingZone] = useState(false);

  // حالة تعديل وحفظ منطقة موجودة
  const [updatingZoneId, setUpdatingZoneId] = useState<string | number | null>(null);

  // حفظ ونشر لوحة الإعلانات
  const handlePublishPromo = async () => {
    setSavingPromo(true);
    setPromoSuccess(false);
    try {
      const res = await savePromoAction({
        enabled: promoEnabled,
        visible: promoEnabled,
        textAr: promoTextAr,
        code: promoCode,
      });

      if (res && res.success) {
        setPromoSuccess(true);
        if (refresh) await refresh();
        setTimeout(() => setPromoSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingPromo(false);
    }
  };

  // إضافة منطقة جديدة
  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    setAddingZone(true);
    try {
      const res = await upsertZoneAction({
        nameAr: newZoneName.trim(),
        nameEn: newZoneName.trim(),
        fee: Number(newZoneFee || 0),
        estimatedMinutes: Number(newZoneTime || 25),
      });

      if (res && res.success) {
        const newObj = {
          id: res.id || `zone-${Date.now()}`,
          nameAr: newZoneName.trim(),
          fee: Number(newZoneFee || 0),
          estimatedMinutes: Number(newZoneTime || 25),
        };
        setZonesList((prev) => [...prev, newObj]);
        setNewZoneName("");
        setNewZoneFee(15);
        setNewZoneTime(25);
        if (refresh) await refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingZone(false);
    }
  };

  // تعديل محتوى حقل في منطقة موجودة داخل القائمة
  const handleZoneChange = (id: string | number, field: string, val: any) => {
    setZonesList((prev) =>
      prev.map((z) => (z.id === id ? { ...z, [field]: val } : z))
    );
  };

  // حفظ التعديل في الداتابيز
  const handleSaveZone = async (zone: any) => {
    setUpdatingZoneId(zone.id);
    try {
      await upsertZoneAction({
        id: zone.id,
        nameAr: zone.nameAr || zone.name,
        nameEn: zone.nameEn || zone.nameAr || zone.name,
        fee: Number(zone.fee ?? zone.price ?? 0),
        estimatedMinutes: Number(zone.estimatedMinutes ?? 30),
      });
      if (refresh) await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setUpdatingZoneId(null), 800);
    }
  };

  // حذف منطقة نهائياً
  const handleDeleteZone = async (id: string | number) => {
    if (!confirm("هل أنت متأكد من حذف هذه المنطقة؟")) return;
    setZonesList((prev) => prev.filter((z) => z.id !== id));
    try {
      await deleteZoneAction(id);
      if (refresh) await refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-10" dir="rtl">
      {/* 1. قسم لوحة الإعلانات والعروض المؤقتة */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 backdrop-blur-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/40">
              <Megaphone className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                لوحة الإعلانات الترويجية · Promo Bulletin
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                تتحكم في الإعلان والعرض المؤقت الظاهر في واجهة الموقع الرئيسية لجميع الزوار.
              </p>
            </div>
          </div>

          {/* زر التبديل بين إظهار أو إخفاء الإعلان */}
          <button
            type="button"
            onClick={() => setPromoEnabled((prev) => !prev)}
            className={`flex items-center gap-2.5 rounded-2xl px-5 py-2.5 text-xs font-black transition cursor-pointer border ${
              promoEnabled
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-white/5 text-white/50 border-white/10"
            }`}
          >
            {promoEnabled ? (
              <>
                <Eye className="size-4 text-amber-400" />
                <span>الإعلان ظاهر في الموقع الآن</span>
              </>
            ) : (
              <>
                <EyeOff className="size-4 text-white/40" />
                <span>الإعلان مخفي من الموقع</span>
              </>
            )}
          </button>
        </div>

        {/* حقول الإعلان */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-2">
                نص الإعلان أو العرض المؤقت (عربي):
              </label>
              <textarea
                rows={3}
                value={promoTextAr}
                onChange={(e) => setPromoTextAr(e.target.value)}
                placeholder="اكتب تفاصيل العرض المؤقت هنا..."
                className="w-full rounded-2xl border border-white/15 bg-carbon-950 p-4 text-sm font-bold text-white outline-none focus:border-brand-500 transition leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 font-bold">كود الخصم (اختياري):</span>
                <input
                  type="text"
                  dir="ltr"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="rounded-xl border border-white/15 bg-carbon-950 px-3 py-1.5 text-xs font-black text-amber-400 uppercase outline-none focus:border-brand-500 w-28 text-center"
                />
              </div>

              <button
                type="button"
                onClick={handlePublishPromo}
                disabled={savingPromo}
                className="flex items-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 px-7 py-3 text-sm font-black text-white shadow-xl glow-brand transition cursor-pointer disabled:opacity-50"
              >
                {savingPromo ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : promoSuccess ? (
                  <Check className="size-4 text-emerald-400" />
                ) : (
                  <Save className="size-4" />
                )}
                <span>
                  {savingPromo
                    ? "جاري الحفظ والنشر..."
                    : promoSuccess
                    ? "تم النشر في الموقع ✓"
                    : "نشر الإعلان في الموقع (Publish)"}
                </span>
              </button>
            </div>
          </div>

          {/* معاينة حية لشكل الإعلان في الموقع */}
          <div className="rounded-2xl border border-amber-500/30 bg-carbon-950/80 p-5 space-y-3">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
              معاينة حية في واجهة الموقع
            </span>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black text-amber-300">
                <Sparkles className="size-2.5" /> عرض مؤقت وحصري
              </span>
              <p className="text-xs font-black text-white leading-relaxed">
                {promoTextAr || "اكتب نص الإعلان لمعاينته هنا"}
              </p>
              {promoCode && (
                <div className="pt-1 text-[11px] font-black text-amber-400">
                  كود الخصم: <span className="underline">{promoCode}</span>
                </div>
              )}
            </div>
            {!promoEnabled && (
              <p className="text-[10px] text-red-400 font-bold text-center">
                * تنبيه: هذا الإعلان مخفي حالياً ولن يظهر للعملاء حتى تفعل زر الظهور.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. قسم مناطق التوصيل الميدانية */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 backdrop-blur-xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-500/20 text-brand-500 ring-2 ring-brand-500/40">
              <MapPin className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                مناطق وأسعار التوصيل · Delivery Zones
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                المناطق المسجلة هنا تظهر في صفحة الموقع الرئيسية وسلة الشراء مع سعرها ووقت توصيلها.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-black text-amber-400 border border-white/10">
            {zonesList.length} مناطق مسجلة
          </span>
        </div>

        {/* نموذج إضافة منطقة جديدة يدوياً */}
        <form
          onSubmit={handleAddZone}
          className="rounded-2xl border border-brand-500/30 bg-carbon-950 p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end shadow-inner"
        >
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-white/70 mb-1.5">
              اسم المنطقة أو القرية (عربي):
            </label>
            <input
              type="text"
              required
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="مثال: دسوق - شارع الجيش"
              className="w-full rounded-xl border border-white/15 bg-carbon-900 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5">
              سعر التوصيل (ج.م):
            </label>
            <input
              type="number"
              min="0"
              required
              value={newZoneFee}
              onChange={(e) => setNewZoneFee(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-white/15 bg-carbon-900 px-3.5 py-2.5 text-xs font-black text-amber-400 outline-none focus:border-brand-500 text-left"
              dir="ltr"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={addingZone}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-xs font-black text-white shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {addingZone ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              <span>إضافة المنطقة</span>
            </button>
          </div>
        </form>

        {/* جدول عرض وتعديل وحذف كافة المناطق المسجلة في قاعدة البيانات */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-white/80">المناطق المضافة الحالية (تعديل مباشر):</h3>

          {zonesList.length > 0 ? (
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg bg-carbon-950">
              <table className="w-full text-right text-xs text-white">
                <thead className="bg-white/5 border-b border-white/10 text-white/60 font-black">
                  <tr>
                    <th className="p-3.5">اسم المنطقة (عربي)</th>
                    <th className="p-3.5 w-32">السعر (ج.م)</th>
                    <th className="p-3.5 w-32">الوقت (دقيقة)</th>
                    <th className="p-3.5 text-center w-28">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {zonesList.map((zone) => {
                    const isSavingThis = updatingZoneId === zone.id;
                    return (
                      <tr key={zone.id} className="hover:bg-white/5 transition">
                        <td className="p-3">
                          <input
                            type="text"
                            value={zone.nameAr || zone.name || ""}
                            onChange={(e) =>
                              handleZoneChange(zone.id, "nameAr", e.target.value)
                            }
                            className="w-full rounded-lg border border-white/10 bg-carbon-900 px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-brand-500"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            value={zone.fee ?? zone.price ?? 0}
                            onChange={(e) =>
                              handleZoneChange(
                                zone.id,
                                "fee",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full rounded-lg border border-white/10 bg-carbon-900 px-3 py-1.5 text-xs font-black text-amber-400 outline-none focus:border-brand-500 text-left"
                            dir="ltr"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="5"
                            value={zone.estimatedMinutes ?? 30}
                            onChange={(e) =>
                              handleZoneChange(
                                zone.id,
                                "estimatedMinutes",
                                parseInt(e.target.value) || 25
                              )
                            }
                            className="w-full rounded-lg border border-white/10 bg-carbon-900 px-3 py-1.5 text-xs font-bold text-emerald-400 outline-none focus:border-brand-500 text-left"
                            dir="ltr"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveZone(zone)}
                              disabled={isSavingThis}
                              className="grid size-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition cursor-pointer"
                              title="حفظ التعديل"
                            >
                              {isSavingThis ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Save className="size-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteZone(zone.id)}
                              className="grid size-8 place-items-center rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition cursor-pointer"
                              title="حذف المنطقة"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/15 bg-carbon-950 p-8 text-center text-xs text-white/40">
              لا توجد مناطق مسجلة حالياً. استخدم النموذج أعلاه لإضافة منطقتك الأولى.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
