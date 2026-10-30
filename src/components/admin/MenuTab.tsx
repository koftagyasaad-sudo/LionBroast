"use client";

import { useState } from "react";
import {
  upsertCategoryAction,
  deleteCategoryAction,
  upsertMenuItemAction,
  deleteMenuItemAction,
  adminSaveScannedRowsAction,
} from "@/app/admin-actions";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  Sparkles,
  Upload,
  Check,
  Flame,
  Layers,
  UtensilsCrossed,
  ScanLine,
  Loader2,
  X,
} from "lucide-react";

// ضاغط الصور السريع في المتصفح لتفادي حد 4.5MB في Vercel نهائياً
function compressImageForScan(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 1400;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          "image/jpeg",
          0.78
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export default function MenuTab({ data, refresh }: { token?: string; data?: any; refresh?: () => void }) {
  const categoriesList: any[] = Array.isArray(data?.categories) ? data.categories : [];
  const itemsList: any[] = Array.isArray(data?.menuItems || data?.items) ? (data?.menuItems || data?.items) : [];

  const [selectedCatId, setSelectedCatId] = useState<string>(categoriesList[0]?.id || "");
  const [showScanner, setShowScanner] = useState(false);

  // حالة إضافة قسم جديد
  const [newCatNameAr, setNewCatNameAr] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  // حالة إضافة / تعديل صنف
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    categoryId: "",
    nameAr: "",
    price: 90,
    descriptionAr: "",
    badge: "",
    imageUrl: "",
    hasSpicyOption: true,
    hasDoubleOption: true,
    doubleExtraPrice: 35,
  });
  const [savingItem, setSavingItem] = useState(false);

  // حالة الماسح الذكي
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scannedRows, setScannedRows] = useState<any[]>([]);
  const [scanMsg, setScanMsg] = useState<string | null>(null);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr.trim()) return;
    setAddingCat(true);
    try {
      const res = await upsertCategoryAction({ nameAr: newCatNameAr.trim() });
      if (res && res.success) {
        setNewCatNameAr("");
        if (refresh) await refresh();
        if (res.id) setSelectedCatId(res.id);
      }
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم وجميع أصنافه؟")) return;
    await deleteCategoryAction(catId);
    if (refresh) await refresh();
  };

  const handleOpenNewItem = (catId?: string) => {
    setEditingItemId(null);
    setItemForm({
      categoryId: catId || selectedCatId || categoriesList[0]?.id || "",
      nameAr: "",
      price: 90,
      descriptionAr: "",
      badge: "الأكثر طلباً",
      imageUrl: "",
      hasSpicyOption: true,
      hasDoubleOption: true,
      doubleExtraPrice: 35,
    });
    setItemFormOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItemId(item.id);
    let options = { hasSpicyOption: true, hasDoubleOption: true, doubleExtraPrice: 35 };
    try {
      if (item.descriptionEn && item.descriptionEn.startsWith("{")) {
        options = { ...options, ...JSON.parse(item.descriptionEn) };
      }
    } catch {}

    setItemForm({
      categoryId: item.categoryId || selectedCatId,
      nameAr: item.nameAr || item.name || "",
      price: Number(item.price || 0),
      descriptionAr: item.descriptionAr || item.description || "",
      badge: item.badge || "",
      imageUrl: item.imageUrl || item.image || "",
      ...options,
    });
    setItemFormOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.nameAr.trim()) return;
    setSavingItem(true);
    try {
      const optionsPayload = {
        hasSpicyOption: itemForm.hasSpicyOption,
        hasDoubleOption: itemForm.hasDoubleOption,
        doubleExtraPrice: itemForm.doubleExtraPrice,
      };

      await upsertMenuItemAction({
        id: editingItemId || `item-${Date.now()}`,
        categoryId: itemForm.categoryId || selectedCatId,
        nameAr: itemForm.nameAr,
        nameEn: itemForm.nameAr,
        price: itemForm.price,
        descriptionAr: itemForm.descriptionAr,
        options: optionsPayload,
        badge: itemForm.badge,
        imageUrl: itemForm.imageUrl,
      });

      setItemFormOpen(false);
      if (refresh) await refresh();
    } finally {
      setSavingItem(false);
    }
  };

  // استدعاء محصن مع ضغط تلقائي وفحص آمن للرد
  const handleScanMenu = async () => {
    if (!scanFile) return;
    setScanning(true);
    setScanMsg(null);
    try {
      const compressedBlob = await compressImageForScan(scanFile);
      const formData = new FormData();
      formData.append("file", compressedBlob, "menu.jpg");

      const res = await fetch("/api/scan-menu", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text.slice(0, 150) || "تعذر معالجة الرد من السيرفر.");
      }

      if (data.ok && Array.isArray(data.data) && data.data.length > 0) {
        setScannedRows(data.data);
      } else {
        setScanMsg(data.error || "تعذر قراءة محتوى المنيو، تأكد من وضوح الصورة وزاوية التصوير.");
      }
    } catch (err: any) {
      setScanMsg(err?.message || "حدث خطأ في الاتصال بالـ API.");
    } finally {
      setScanning(false);
    }
  };

  const handleSaveScanned = async () => {
    if (scannedRows.length === 0) return;
    setScanning(true);
    try {
      await adminSaveScannedRowsAction(scannedRows);
      setScannedRows([]);
      setScanFile(null);
      setScanPreview(null);
      setShowScanner(false);
      if (refresh) await refresh();
    } finally {
      setScanning(false);
    }
  };

  const currentCategoryItems = itemsList.filter(
    (i) => String(i.categoryId) === String(selectedCatId)
  );

  return (
    <div className="space-y-8" dir="rtl">
      {/* الشريط العلوي المشترك */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
            <UtensilsCrossed className="size-6 text-brand-500" />
            إدارة المنيو وماسح الذكاء الاصطناعي
          </h2>
          <p className="text-xs text-white/60 mt-1">
            أضف وعدل الأقسام والأصناف يدوياً مع خيارات (سنجل/دابل وحار/بارد)، أو ارفع صورة المنيو ليقرأها الذكاء الاصطناعي فوراً.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScanner(!showScanner)}
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-black transition cursor-pointer border ${
              showScanner ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-white/10 hover:bg-white/15 text-white border-white/15"
            }`}
          >
            <ScanLine className="size-4 text-amber-400" />
            <span>{showScanner ? "إغلاق ماسح المنيو" : "استيراد المنيو بالذكاء الاصطناعي"}</span>
          </button>

          <button
            onClick={() => handleOpenNewItem()}
            className="flex items-center gap-2 rounded-2xl bg-brand-500 hover:bg-brand-600 px-6 py-3 text-xs font-black text-white shadow-xl glow-brand transition cursor-pointer"
          >
            <Plus className="size-4" />
            <span>إضافة وجبة جديدة</span>
          </button>
        </div>
      </div>

      {/* نافذة ماسح المنيو الذكي المستقلة */}
      {showScanner && (
        <div className="rounded-3xl border border-amber-500/40 bg-carbon-950 p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-5 text-amber-400 animate-pulse" />
              <h3 className="text-base font-black text-white">استيراد المنيو بصورة (نظام الذكاء الاصطناعي المباشر)</h3>
            </div>
            <button onClick={() => setShowScanner(false)} className="text-white/40 hover:text-white cursor-pointer">
              <X className="size-5" />
            </button>
          </div>

          {scannedRows.length === 0 ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-brand-500 transition bg-carbon-900/50">
                <input
                  type="file"
                  accept="image/*"
                  id="scanner-upload"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setScanFile(f);
                      setScanPreview(URL.createObjectURL(f));
                    }
                  }}
                />
                <label htmlFor="scanner-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  <Upload className="size-10 text-brand-500" />
                  <span className="text-sm font-bold text-white">اختر صورة المنيو لتحليلها بالذكاء الاصطناعي</span>
                  <span className="text-[11px] text-white/40">تتم المعالجة عبر سيرفر الذكاء الاصطناعي مباشرة مع ضغط آمن تلقائياً</span>
                </label>
              </div>

              {scanPreview && (
                <div className="space-y-3">
                  <div className="max-h-72 overflow-hidden rounded-xl border border-white/10 flex items-center justify-center bg-black/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={scanPreview} alt="Menu Preview" className="max-h-72 object-contain" />
                  </div>
                  <button
                    onClick={handleScanMenu}
                    disabled={scanning}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 py-3.5 text-sm font-black text-white shadow-xl disabled:opacity-50 cursor-pointer"
                  >
                    {scanning ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    <span>{scanning ? "جاري قراءة واستخراج الأصناف والأسعار..." : "استخراج الأصناف والأسعار الآن"}</span>
                  </button>
                </div>
              )}

              {scanMsg && (
                <p className="text-xs font-bold text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{scanMsg}</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400">تم استخراج ({scannedRows.length}) صنف بنجاح! راجعهم واضغط اعتماد:</span>
                <button
                  onClick={handleSaveScanned}
                  disabled={scanning}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-black text-white cursor-pointer shadow-lg"
                >
                  <Check className="size-4" />
                  <span>اعتماد وإضافة لكل أقسام المنيو</span>
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-carbon-900">
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-white/10 text-white/50 p-2 font-bold">
                    <tr>
                      <th className="p-3">القسم</th>
                      <th className="p-3">اسم الوجبة</th>
                      <th className="p-3">الوصف</th>
                      <th className="p-3">السعر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {scannedRows.map((r, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-amber-400">{r.categoryNameAr}</td>
                        <td className="p-2 font-bold text-white">{r.itemNameAr}</td>
                        <td className="p-2 text-white/60 text-[11px]">{r.descriptionAr}</td>
                        <td className="p-2 font-black text-white">{r.price} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* شريط الأقسام الرئيسية */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-6 space-y-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-brand-500" />
            <h3 className="text-base font-black text-white">الأقسام الرئيسية للمنيو</h3>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              required
              value={newCatNameAr}
              onChange={(e) => setNewCatNameAr(e.target.value)}
              placeholder="اسم قسم جديد (مثال: وجبات التوفير)"
              className="rounded-xl border border-white/15 bg-carbon-950 px-3.5 py-2 text-xs font-bold text-white outline-none focus:border-brand-500 w-56"
            />
            <button
              type="submit"
              disabled={addingCat}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2 text-xs font-black text-white cursor-pointer transition disabled:opacity-50"
            >
              <Plus className="size-3.5" />
              <span>إضافة قسم</span>
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {categoriesList.map((cat) => {
            const isSelected = String(cat.id) === String(selectedCatId);
            const count = itemsList.filter((i) => String(i.categoryId) === String(cat.id)).length;

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`group flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition cursor-pointer border ${
                  isSelected
                    ? "bg-brand-500 text-white border-brand-500 shadow-lg glow-brand"
                    : "bg-carbon-950 text-white/70 border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                <span>{cat.nameAr}</span>
                <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px]">{count}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.id);
                  }}
                  className="size-4 grid place-items-center rounded-full hover:bg-red-500/30 text-white/40 hover:text-red-400 transition ml-1"
                  title="حذف هذا القسم"
                >
                  <X className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* قائمة الأصناف تحت القسم المحدد */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900/60 p-6 md:p-8 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-lg font-black text-white">
              أصناف قسم:{" "}
              <span className="text-amber-400">
                {categoriesList.find((c) => String(c.id) === String(selectedCatId))?.nameAr || "اختر قسماً"}
              </span>
            </h3>
            <p className="text-xs text-white/50 mt-0.5">({currentCategoryItems.length}) وجبات مسجلة في هذا القسم</p>
          </div>

          <button
            onClick={() => handleOpenNewItem(selectedCatId)}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-4 py-2 text-xs font-black cursor-pointer transition border border-white/15"
          >
            <Plus className="size-3.5 text-brand-500" />
            <span>إضافة صنف هنا</span>
          </button>
        </div>

        {currentCategoryItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentCategoryItems.map((item) => {
              let options = { hasSpicyOption: false, hasDoubleOption: false, doubleExtraPrice: 0 };
              try {
                if (item.descriptionEn && item.descriptionEn.startsWith("{")) {
                  options = JSON.parse(item.descriptionEn);
                }
              } catch {}

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-carbon-950 p-5 space-y-4 flex flex-col justify-between shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="size-16 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt={item.nameAr} className="size-full object-cover" />
                        ) : (
                          <span className="text-2xl select-none">🍗</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-white truncate">{item.nameAr}</h4>
                          {item.badge && (
                            <span className="rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2 py-0.5 text-[9px] font-black">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-1 line-clamp-2 leading-relaxed">
                          {item.descriptionAr || "لا توجد مكونات مكتوبة"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                      {options.hasSpicyOption && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold">
                          <Flame className="size-2.5" /> متاح (حار / بارد)
                        </span>
                      )}
                      {options.hasDoubleOption && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold">
                          سنجل / دابل (+{options.doubleExtraPrice || 35} ج.م)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                      <span className="text-base font-black text-amber-400">{item.price}</span>
                      <span className="text-[11px] text-white/60 mr-1">ج.م</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="grid size-8 place-items-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                        title="تعديل"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`حذف ${item.nameAr}؟`)) {
                            await deleteMenuItemAction(item.id);
                            if (refresh) await refresh();
                          }
                        }}
                        className="grid size-8 place-items-center rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition cursor-pointer"
                        title="حذف"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-carbon-950 p-10 text-center space-y-3">
            <span className="text-4xl select-none">🍗</span>
            <p className="text-sm font-bold text-white">لا توجد أصناف في هذا القسم حالياً</p>
            <button
              onClick={() => handleOpenNewItem(selectedCatId)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-black text-white"
            >
              <Plus className="size-3.5" />
              <span>إضافة صنف يدوي الآن</span>
            </button>
          </div>
        )}
      </div>

      {/* النافذة المنبثقة لإضافة وتعديل صنف */}
      {itemFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
          <div className="w-full max-w-xl rounded-3xl border border-white/15 bg-carbon-900 p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black text-white">
                {editingItemId ? "تعديل الصنف والخيارات" : "إضافة صنف جديد للمنيو"}
              </h3>
              <button onClick={() => setItemFormOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">القسم التابع له:</label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-carbon-950 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-brand-500"
                >
                  {categoriesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">اسم الصنف أو الوجبة (عربي):</label>
                  <input
                    type="text"
                    required
                    value={itemForm.nameAr}
                    onChange={(e) => setItemForm({ ...itemForm, nameAr: e.target.value })}
                    placeholder="مثال: وجبة بروست الأسد سوبر"
                    className="w-full rounded-xl border border-white/15 bg-carbon-950 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">السعر الأساسي (ج.م):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.5"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-white/15 bg-carbon-950 px-3.5 py-2.5 text-xs font-black text-amber-400 outline-none focus:border-brand-500 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1">المكونات وتفاصيل الوجبة (الوصف):</label>
                <textarea
                  rows={2}
                  value={itemForm.descriptionAr}
                  onChange={(e) => setItemForm({ ...itemForm, descriptionAr: e.target.value })}
                  placeholder="مثال: 4 قطع بروست كرسبي + بطاطس + كول سلو + ثومية + عيش"
                  className="w-full rounded-xl border border-white/15 bg-carbon-950 p-3 text-xs font-semibold text-white outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">شارة مميزة (Badge):</label>
                  <input
                    type="text"
                    value={itemForm.badge}
                    onChange={(e) => setItemForm({ ...itemForm, badge: e.target.value })}
                    placeholder="مثال: الأكثر طلباً أو NEW!"
                    className="w-full rounded-xl border border-white/15 bg-carbon-950 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1">رابط أو صورة الوجبة:</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={itemForm.imageUrl}
                    onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                    placeholder="ضع رابط صورة مباشر أو اتركها فارغة"
                    className="w-full rounded-xl border border-white/15 bg-carbon-950 px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-brand-500/30 bg-carbon-950 p-4 space-y-4">
                <span className="text-xs font-black text-amber-400 block border-b border-white/10 pb-2">
                  خيارات طلب الصنف للعميل (Options):
                </span>

                <div className="space-y-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemForm.hasSpicyOption}
                      onChange={(e) => setItemForm({ ...itemForm, hasSpicyOption: e.target.checked })}
                      className="size-4 accent-brand-500 rounded"
                    />
                    <span className="text-xs font-bold text-white">إتاحة خيار (حار 🌶️ / بارد عادي) للعميل</span>
                  </label>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={itemForm.hasDoubleOption}
                        onChange={(e) => setItemForm({ ...itemForm, hasDoubleOption: e.target.checked })}
                        className="size-4 accent-brand-500 rounded"
                      />
                      <span className="text-xs font-bold text-white">إتاحة خيار الأحجام (سنجل فردي / دابل مضاعف)</span>
                    </label>

                    {itemForm.hasDoubleOption && (
                      <div className="mr-6 flex items-center gap-2">
                        <span className="text-[11px] text-white/60">سعر إضافة الدابل على السعر الأساسي:</span>
                        <input
                          type="number"
                          min="0"
                          value={itemForm.doubleExtraPrice}
                          onChange={(e) => setItemForm({ ...itemForm, doubleExtraPrice: parseFloat(e.target.value) || 0 })}
                          className="w-24 rounded-lg border border-white/15 bg-carbon-900 px-2.5 py-1 text-xs font-black text-amber-400 outline-none text-left"
                          dir="ltr"
                        />
                        <span className="text-[11px] text-white/60">ج.م</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setItemFormOpen(false)}
                  className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-bold text-white/60 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-7 py-2.5 text-xs font-black text-white shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {savingItem ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  <span>{savingItem ? "جاري الحفظ..." : "حفظ الصنف"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
