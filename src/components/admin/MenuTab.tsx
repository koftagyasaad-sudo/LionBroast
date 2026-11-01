"use client";

import { useState, useRef } from "react";
import {
  upsertCategoryAction,
  deleteCategoryAction,
  upsertMenuItemAction,
  deleteMenuItemAction,
  scanMenuAction,
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
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  DollarSign,
  FileText,
} from "lucide-react";

// دالة ضغط الصورة داخل المتصفح لمنع خطأ تجاوز حجم البيانات المسموح به
async function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => reject(new Error("تعذر معالجة الصورة"));
    };
    reader.onerror = () => reject(new Error("تعذر قراءة الملف"));
  });
}

export default function MenuTab({ bundle, onReload, categories: propCats, items: propItems }: any) {
  // دمج مصادر البيانات بمرونة
  const initialCats = bundle?.categories || propCats || [];
  const initialItems = bundle?.menuItems || bundle?.items || propItems || [];

  const [cats, setCats] = useState<any[]>(initialCats);
  const [items, setItems] = useState<any[]>(initialItems);
  const [activeCatId, setActiveCatId] = useState<number | string>(
    initialCats[0]?.id || ""
  );

  // حالات إضافة صنف وقسم جديد
  const [newCatName, setNewCatName] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemImage, setItemImage] = useState("/img/hero-1.png");
  const [itemBadge, setItemBadge] = useState("");
  const [itemLoading, setItemLoading] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  // حالات ماسح الذكاء الاصطناعي بنظام DG-Menu
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [scannedRows, setScannedRows] = useState<any[]>([]);
  const [saveRowsLoading, setSaveRowsLoading] = useState(false);

  // 1. إضافة قسم جديد
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCatLoading(true);
    try {
      const res = await upsertCategoryAction({
        nameAr: newCatName.trim(),
        nameEn: newCatName.trim(),
        sortOrder: cats.length,
      });

      if (res.success) {
        const created = res.category || {
          id: Date.now(),
          nameAr: newCatName.trim(),
          nameEn: newCatName.trim(),
          items: [],
        };
        const updated = [...cats, created];
        setCats(updated);
        setActiveCatId(created.id);
        setNewCatName("");
        onReload?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCatLoading(false);
    }
  };

  // 2. حذف قسم
  const handleDeleteCategory = async (id: number | string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم بالكامل؟")) return;
    try {
      await deleteCategoryAction(id);
      const updated = cats.filter((c) => c.id !== id);
      setCats(updated);
      if (activeCatId === id) {
        setActiveCatId(updated[0]?.id || "");
      }
      onReload?.();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. إضافة صنف يدوي وتثبيته مباشرة
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !itemPrice) return;

    const targetCat = activeCatId || cats[0]?.id;
    if (!targetCat) {
      alert("يرجى إنشاء قسم أولاً قبل إضافة الأصناف.");
      return;
    }

    setItemLoading(true);
    try {
      const payload = {
        categoryId: targetCat,
        nameAr: itemName.trim(),
        nameEn: itemName.trim(),
        price: Number(itemPrice),
        descriptionAr: itemDesc.trim(),
        image: itemImage || "/img/hero-1.png",
        badge: itemBadge.trim() || null,
        isAvailable: true,
      };

      const res = await upsertMenuItemAction(payload);
      if (res.success) {
        const createdItem = res.item || { ...payload, id: Date.now() };
        setItems((prev) => [...prev, createdItem]);
        setItemName("");
        setItemPrice("");
        setItemDesc("");
        setItemBadge("");
        setShowItemModal(false);
        onReload?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemLoading(false);
    }
  };

  // 4. حذف صنف
  const handleDeleteItem = async (id: number | string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوجبة؟")) return;
    try {
      await deleteMenuItemAction(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      onReload?.();
    } catch (err) {
      console.error(err);
    }
  };

  // 5. رفع صورة المنيو وتجهيزها للماسح
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScanStatus("جاري ضغط ومعالجة أبعاد الصورة...");
      const compressedDataUrl = await compressImageToDataUrl(file);
      setScanPreview(compressedDataUrl);
      setScanStatus(null);
    } catch {
      setScanStatus("تعذر قراءة الصورة، يرجى اختيار ملف آخر.");
    }
  };

  // 6. تشغيل ماسح المنيو DG-Menu
  const handleExecuteScan = async () => {
    if (!scanPreview) return;

    setScanLoading(true);
    setScanStatus("جاري تحليل صورة المنيو وتفريغ الأصناف والأسعار بالذكاء الاصطناعي 🦁...");
    try {
      const res = await scanMenuAction(scanPreview);
      if (res.success) {
        const rows = res.rows || res.items || [];
        setScannedRows(rows);
        setScanStatus(res.message || `تم بنجاح استخراج ${rows.length} وجبة من المنيو.`);
        onReload?.();
      } else {
        setScanStatus(res.error || "تعذر إكمال المسح، يرجى المحاولة مرة أخرى.");
      }
    } catch {
      setScanStatus("حدث خطأ أثناء معالجة الصورة بالسيرفر.");
    } finally {
      setScanLoading(false);
    }
  };

  // 7. اعتماد وحفظ جدول الأصناف الممسوحة دفعة واحدة
  const handleConfirmSaveAllRows = async () => {
    if (scannedRows.length === 0) return;

    setSaveRowsLoading(true);
    try {
      const res = await adminSaveScannedRowsAction(scannedRows);
      if (res.success) {
        alert("تم اعتماد وحفظ جميع أصناف المنيو في قاعدة البيانات بنجاح 🦁");
        setScannedRows([]);
        setScanPreview(null);
        setScanStatus(null);
        onReload?.();
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء حفظ الأصناف.");
    } finally {
      setSaveRowsLoading(false);
    }
  };

  // الأصناف التابعة للقسم النشط حالياً
  const currentCategoryItems = items.filter(
    (it) => String(it.categoryId) === String(activeCatId)
  );

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* ================= 1. ماسح المنيو الذكي (نظام DG-Menu المتطور) ================= */}
      <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1 text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-0.5 text-xs font-black text-orange-400">
              <ScanLine className="size-3.5" />
              <span>ماسح المنيو التلقائي الذكي · DG-Menu Engine</span>
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              إدخال وتحديث المنيو بضغطة زر 🍗
            </h2>
            <p className="text-xs text-zinc-400">
              ارفع صورة منيو المطعم أو البوستر، وسيقوم النظام فوراً باستخراج كافة الساندوتشات والوجبات والأسعار وتوزيعها في جداول منظمة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 px-5 py-3 text-xs font-bold text-white transition cursor-pointer border border-zinc-700"
            >
              <Upload className="size-4 text-orange-400" />
              <span>{scanPreview ? "تغيير الصورة المرفوعة" : "رفع صورة المنيو 📷"}</span>
            </button>

            {scanPreview && (
              <button
                type="button"
                disabled={scanLoading}
                onClick={handleExecuteScan}
                className="flex items-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-500 px-6 py-3 text-xs font-black text-white shadow-xl transition cursor-pointer disabled:opacity-50"
              >
                {scanLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                <span>{scanLoading ? "جاري المسح والاستخراج..." : "استخراج الأصناف والأسعار الآن ⚡"}</span>
              </button>
            )}
          </div>
        </div>

        {/* حالة وتنبيهات المسح */}
        {scanStatus && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3.5 text-xs font-bold text-orange-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>{scanStatus}</span>
          </div>
        )}

        {/* جدول استعراض الأصناف الممسوحة (DG-Menu Table) */}
        {scannedRows.length > 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">
                  تم استخراج ({scannedRows.length}) وجبة وصنف بنجاح
                </h3>
              </div>

              <button
                type="button"
                disabled={saveRowsLoading}
                onClick={handleConfirmSaveAllRows}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-black text-white shadow-lg transition cursor-pointer"
              >
                {saveRowsLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                <span>اعتماد وحفظ كافة الأصناف في المنيو فوراً 🦁</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold">
                    <th className="py-2.5 px-3">القسم</th>
                    <th className="py-2.5 px-3">اسم الوجبة</th>
                    <th className="py-2.5 px-3">السعر (ج.م)</th>
                    <th className="py-2.5 px-3">الوصف والتفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-medium text-zinc-300">
                  {scannedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/60 transition">
                      <td className="py-2 px-3 font-bold text-amber-400">
                        {row.categoryName || row.categoryAr || "عام"}
                      </td>
                      <td className="py-2 px-3 font-bold text-white">
                        {row.nameAr || row.name}
                      </td>
                      <td className="py-2 px-3 font-black text-emerald-400 font-mono">
                        {row.price} ج.م
                      </td>
                      <td className="py-2 px-3 text-zinc-400 max-w-xs truncate">
                        {row.descriptionAr || row.description || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ================= 2. إدارة الأقسام (Categories) ================= */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="size-5 text-orange-500" />
              <span>أقسام قائمة الطعام ({cats.length})</span>
            </h3>
            <p className="text-xs text-zinc-400">اضغط على أي قسم لعرض وتعديل الأصناف الموجودة بداخله.</p>
          </div>

          {/* نموذج إضافة قسم سريع */}
          <form onSubmit={handleAddCategory} className="flex items-center gap-2">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="اسم القسم الجديد (مثال: الساندوتشات)..."
              className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 w-56"
            />
            <button
              type="submit"
              disabled={catLoading}
              className="flex items-center gap-1.5 rounded-2xl bg-orange-600 hover:bg-orange-500 px-4 py-2 text-xs font-black text-white transition cursor-pointer disabled:opacity-50"
            >
              {catLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              <span>إضافة قسم</span>
            </button>
          </form>
        </div>

        {/* كروت الأقسام الأفقية */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          {cats.map((cat) => {
            const isActive = String(cat.id) === String(activeCatId);
            const count = items.filter((it) => String(it.categoryId) === String(cat.id)).length;

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`group flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition cursor-pointer border ${
                  isActive
                    ? "bg-orange-600 text-white border-orange-500 shadow-lg shadow-orange-600/20"
                    : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <span>{cat.nameAr}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    isActive ? "bg-black/30 text-white" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {count}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(cat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition pr-1"
                  title="حذف القسم"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 3. إدارة الوجبات والأصناف داخل القسم المحدد ================= */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <UtensilsCrossed className="size-5 text-orange-500" />
              <span>
                أصناف قسم:{" "}
                <span className="text-orange-400">
                  {cats.find((c) => String(c.id) === String(activeCatId))?.nameAr || "القسم المحدد"}
                </span>{" "}
                ({currentCategoryItems.length})
              </span>
            </h3>
            <p className="text-xs text-zinc-400">إضافة وتعديل وحذف الوجبات في هذا القسم يدوياً.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowItemModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-500 px-5 py-2.5 text-xs font-black text-white shadow-xl transition cursor-pointer active:scale-95"
          >
            <Plus className="size-4" />
            <span>إضافة صنف هنا 🍗</span>
          </button>
        </div>

        {/* شبكة كروت الأصناف */}
        {currentCategoryItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentCategoryItems.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 hover:border-zinc-700 transition flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-black text-white group-hover:text-orange-400 transition">
                      {item.nameAr}
                    </h4>
                    {item.descriptionAr && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {item.descriptionAr}
                      </p>
                    )}
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {item.price}
                    </span>
                    <span className="text-[10px] text-zinc-400 mr-1 font-bold">ج.م</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-zinc-500">
                    {item.isAvailable ? "متوفر للطلب ✅" : "غير متاح حالياً ❌"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-red-400/80 hover:text-red-400 transition cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>حذف الوجبة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
            <UtensilsCrossed className="size-8 mx-auto text-zinc-600 mb-2" />
            <p className="text-xs font-bold text-zinc-400">
              لا توجد وجبات مسجلة في هذا القسم حتى الآن.
            </p>
            <button
              type="button"
              onClick={() => setShowItemModal(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-orange-400 hover:text-orange-300"
            >
              <Plus className="size-3.5" />
              <span>اضغط هنا لإضافة أول صنف يدوي</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= 4. نافذة إضافة صنف يدوي منبثقة ================= */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Plus className="size-4 text-orange-500" />
                <span>إضافة وجبة وصنف جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3.5 text-right">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                  اسم الوجبة بالعربي:
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="مثال: ساندوتش فايتر تريبل"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-white placeholder:text-zinc-600 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                  السعر بالجنيه (EGP):
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="مثال: 120"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-black text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                  وصف المكونات والوجبة:
                </label>
                <textarea
                  rows={2}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="مثال: قطع استربس مقرمشة + بطاطس + صوص شيدر..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 py-3 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={itemLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-orange-600 hover:bg-orange-500 py-3 text-xs font-black text-white shadow-xl transition disabled:opacity-50"
                >
                  {itemLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  <span>حفظ الوجبة الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
