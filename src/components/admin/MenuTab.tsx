"use client";

import { useState, useRef, useEffect } from "react";
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
  Upload,
  Check,
  Layers,
  UtensilsCrossed,
  ScanLine,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2,
  Save,
  Sparkles,
  Edit3,
  Zap,
} from "lucide-react";

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
  const initialCats = bundle?.categories || propCats || [];
  const initialItems = bundle?.menuItems || bundle?.items || propItems || [];

  const [cats, setCats] = useState<any[]>(initialCats);
  const [items, setItems] = useState<any[]>(initialItems);
  const [activeCatId, setActiveCatId] = useState<number | string>(
    initialCats[0]?.id || ""
  );

  // التأكد من ضبط القسم الأول تلقائياً عند تحميل البيانات
  useEffect(() => {
    if (bundle?.categories) setCats(bundle.categories);
    if (bundle?.menuItems) setItems(bundle.menuItems);

    if (cats.length > 0 && (!activeCatId || activeCatId === "")) {
      setActiveCatId(cats[0].id);
    }
  }, [bundle, cats, activeCatId]);

  const [newCatName, setNewCatName] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemDesc, setItemDesc] = useState("");
  const [itemLoading, setItemLoading] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
      const updated = cats.filter((c) => Number(c.id) !== Number(id));
      setCats(updated);
      if (Number(activeCatId) === Number(id)) {
        setActiveCatId(updated[0]?.id || "");
      }
      onReload?.();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. إضافة صنف يدوي
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
        image: "/img/hero-1.png",
        isAvailable: true,
      };

      const res = await upsertMenuItemAction(payload);
      if (res.success) {
        const createdItem = res.item || { ...payload, id: Date.now() };
        setItems((prev) => [...prev, createdItem]);
        setItemName("");
        setItemPrice("");
        setItemDesc("");
        setShowItemModal(false);
        onReload?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemLoading(false);
    }
  };

  // 4. حفظ تعديل صنف قائم
  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.nameAr.trim() || !editingItem.price) return;

    setEditLoading(true);
    try {
      const res = await upsertMenuItemAction({
        id: editingItem.id,
        categoryId: editingItem.categoryId || activeCatId,
        nameAr: editingItem.nameAr.trim(),
        nameEn: editingItem.nameEn || editingItem.nameAr.trim(),
        price: Number(editingItem.price),
        descriptionAr: editingItem.descriptionAr || "",
        image: editingItem.image || "/img/hero-1.png",
        badge: editingItem.badge || null,
        isAvailable: editingItem.isAvailable !== undefined ? editingItem.isAvailable : true,
      });

      if (res.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === editingItem.id ? { ...it, ...editingItem } : it))
        );
        setEditingItem(null);
        onReload?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  // 5. حذف صنف
  const handleDeleteItem = async (id: number | string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوجبة؟")) return;
    try {
      await deleteMenuItemAction(id);
      setItems((prev) => prev.filter((it) => Number(it.id) !== Number(id)));
      onReload?.();
    } catch (err) {
      console.error(err);
    }
  };

  // 6. رفع صورة المنيو
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

  // 7. تشغيل الماسح الذكي
  const handleExecuteScan = async () => {
    setScanLoading(true);
    setScanStatus("جاري فحص وتفريغ أصناف المنيو وتوزيعها على الأقسام 🦁...");
    try {
      const res = await scanMenuAction(scanPreview || "");
      if (res.success) {
        const rows = res.rows || res.items || [];
        setScannedRows(rows);
        setScanStatus(`تم استخراج ${rows.length} وجبة بنجاح! راجع وعدل أي تفاصيل في الجدول أدناه ثم اضغط اعتماد 🦁`);
      } else {
        setScanStatus(res.error || "تعذر إكمال المسح، يرجى المحاولة مرة أخرى.");
      }
    } catch {
      setScanStatus("حدث خطأ أثناء معالجة الصورة بالسيرفر.");
    } finally {
      setScanLoading(false);
    }
  };

  const handleUpdateScannedRow = (index: number, field: string, value: any) => {
    setScannedRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteScannedRow = (index: number) => {
    setScannedRows((prev) => prev.filter((_, i) => i !== index));
  };

  // 8. اعتماد وحفظ الأصناف ونقلها فورياً للأقسام والموقع الخارجي
  const handleConfirmSaveAllRows = async () => {
    if (scannedRows.length === 0) return;

    setSaveRowsLoading(true);
    try {
      const res = await adminSaveScannedRowsAction(scannedRows);
      if (res.success) {
        setItems((prev) => [...prev, ...scannedRows]);
        alert(`تم بنجاح اعتماد ${scannedRows.length} صنف وإضافتها للأقسام والموقع الخارجي 🦁`);
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

  // الفلترة الدقيقة لأصناف القسم النشط
  const currentCategory = cats.find((c) => Number(c.id) === Number(activeCatId)) || cats[0];
  const currentCategoryItems = items.filter(
    (it) => currentCategory && Number(it.categoryId) === Number(currentCategory.id)
  );

  return (
    <div className="space-y-8" dir="rtl">
      
      {/* 1. ماسح المنيو مع زر التفريغ الذكي الفوري */}
      <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="space-y-1 text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-0.5 text-xs font-black text-orange-400">
              <ScanLine className="size-3.5" />
              <span>ماسح المنيو الذكي · Smart DG-Menu</span>
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              استخراج الأصناف وتعديلها فورياً 🍗
            </h2>
            <p className="text-xs text-zinc-400">
              ارفع صورة المنيو لاستخراج الأصناف في جدول تفاعلي، أو اضغط على زر الاعتماد الفوري لتفريغ منيو بروست الأسد مباشرة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

            <button
              type="button"
              disabled={scanLoading}
              onClick={handleExecuteScan}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 px-6 py-3 text-xs font-black text-white shadow-xl transition cursor-pointer disabled:opacity-50"
            >
              {scanLoading ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
              <span>{scanLoading ? "جاري المسح والاستخراج..." : "تفريغ واستخراج أصناف المنيو الآن ⚡"}</span>
            </button>
          </div>
        </div>

        {scanStatus && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-3.5 text-xs font-bold text-orange-300">
            <AlertCircle className="size-4 shrink-0" />
            <span>{scanStatus}</span>
          </div>
        )}

        {/* جدول استعراض وتعديل الأصناف قبل الحفظ */}
        {scannedRows.length > 0 && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">
                  تم استخراج ({scannedRows.length}) وجبة وصنف (يمكنك تعديل أي خانة مباشرة الآن):
                </h3>
              </div>

              <button
                type="button"
                disabled={saveRowsLoading}
                onClick={handleConfirmSaveAllRows}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-xs font-black text-white shadow-lg transition cursor-pointer"
              >
                {saveRowsLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                <span>تأكيد واعتماد الأصناف ونشرها في الموقع فوراً 🦁</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-bold">
                    <th className="py-2.5 px-3">القسم الموجه له</th>
                    <th className="py-2.5 px-3">اسم الوجبة</th>
                    <th className="py-2.5 px-3">السعر ج.م</th>
                    <th className="py-2.5 px-3">الوصف والمكونات</th>
                    <th className="py-2.5 px-2 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-medium text-zinc-300">
                  {scannedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40 transition">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.categoryName || row.categoryAr || "عام"}
                          onChange={(e) => handleUpdateScannedRow(idx, "categoryName", e.target.value)}
                          className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-bold text-amber-400 outline-none focus:border-orange-500 w-32"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.nameAr || row.name || ""}
                          onChange={(e) => handleUpdateScannedRow(idx, "nameAr", e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-bold text-white outline-none focus:border-orange-500 min-w-[140px]"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          value={row.price || 0}
                          onChange={(e) => handleUpdateScannedRow(idx, "price", Number(e.target.value))}
                          className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-black text-emerald-400 text-center font-mono outline-none focus:border-emerald-500 w-20"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.descriptionAr || row.description || ""}
                          onChange={(e) => handleUpdateScannedRow(idx, "descriptionAr", e.target.value)}
                          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-300 outline-none focus:border-orange-500 min-w-[200px]"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteScannedRow(idx)}
                          className="grid size-7 place-items-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition mx-auto"
                          title="حذف هذا الصنف"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 2. إدارة الأقسام */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Layers className="size-5 text-orange-500" />
              <span>أقسام قائمة الطعام ({cats.length})</span>
            </h3>
            <p className="text-xs text-zinc-400">اضغط على أي قسم لعرض وتعديل الأصناف التابعة له.</p>
          </div>

          <form onSubmit={handleAddCategory} className="flex items-center gap-2">
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="اسم القسم الجديد..."
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

        <div className="flex flex-wrap items-center gap-2.5 pt-2">
          {cats.map((cat) => {
            const isActive = Number(cat.id) === Number(activeCatId);
            const count = items.filter((it) => Number(it.categoryId) === Number(cat.id)).length;

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

      {/* 3. أصناف القسم المحدد */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <UtensilsCrossed className="size-5 text-orange-500" />
              <span>
                أصناف قسم:{" "}
                <span className="text-orange-400">
                  {currentCategory?.nameAr || "القسم المحدد"}
                </span>{" "}
                ({currentCategoryItems.length})
              </span>
            </h3>
            <p className="text-xs text-zinc-400">يمكنك تعديل أي صنف في أي وقت بالضغط على أيقونة التعديل ✎.</p>
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
                    {item.isAvailable ? "متوفر للطلب ✅" : "غير متاح ❌"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="flex items-center gap-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-2.5 py-1 text-[11px] font-bold transition cursor-pointer"
                    >
                      <Edit3 className="size-3" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="grid size-7 place-items-center rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                      title="حذف الوجبة"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20">
            <UtensilsCrossed className="size-8 mx-auto text-zinc-600 mb-2" />
            <p className="text-xs font-bold text-zinc-400">
              لا توجد وجبات مسجلة في هذا القسم حالياً.
            </p>
            <button
              type="button"
              onClick={() => setShowItemModal(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-orange-400 hover:text-orange-300"
            >
              <Plus className="size-3.5" />
              <span>اضغط هنا لإضافة صنف يدوي</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. نافذة تعديل وجبة قائمة */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Edit3 className="size-4 text-orange-500" />
                <span>تعديل الوجبة: {editingItem.nameAr}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-3.5 text-right">
              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">اسم الوجبة:</label>
                <input
                  type="text"
                  required
                  value={editingItem.nameAr}
                  onChange={(e) => setEditingItem({ ...editingItem, nameAr: e.target.value })}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">السعر بالجنيه (EGP):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-black text-white outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">الوصف والمكونات:</label>
                <textarea
                  rows={2}
                  value={editingItem.descriptionAr || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, descriptionAr: e.target.value })}
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white outline-none focus:border-orange-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900 py-3 text-xs font-bold text-zinc-400 hover:text-white"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-orange-600 hover:bg-orange-500 py-3 text-xs font-black text-white shadow-xl transition disabled:opacity-50"
                >
                  {editLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  <span>حفظ التعديل الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. نافذة إضافة صنف يدوي */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Plus className="size-4 text-orange-500" />
                <span>إضافة صنف جديد</span>
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
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">اسم الوجبة:</label>
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
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">السعر بالجنيه (EGP):</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  placeholder="مثال: 120"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-xs font-black text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-300 mb-1">الوصف والمكونات:</label>
                <textarea
                  rows={2}
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="مثال: دجاج مقرمش + صوص شيدر + بطاطس..."
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
