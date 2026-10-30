"use client";

import { useState } from "react";
import { adminScanMenuAction, adminSaveScannedRowsAction, ScannedRow } from "@/app/admin-actions";
import {
  Sparkles,
  UploadCloud,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  FileEdit,
} from "lucide-react";

// محرك ضغط الصور الفوري لضمان سرعة المعالجة وعدم تجاوز حدود الحجم
function compressMenuImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
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
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export default function MenuScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedRows, setScannedRows] = useState<ScannedRow[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSaveSuccess(false);
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // ضغط الصورة فوراً في المتصفح قبل إرسالها
      const compressedBase64 = await compressMenuImage(file);

      const res = await adminScanMenuAction({
        fileName: file.name,
        imageBase64: compressedBase64,
        mimeType: "image/jpeg",
      });

      if (res.success && res.data && res.data.length > 0) {
        setScannedRows(res.data);
      } else {
        setError(res.error || "تعذر استخراج الأصناف من الصورة. يمكنك إضافة الأصناف بالجدول مباشرة.");
      }
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
    } finally {
      setScanning(false);
    }
  };

  const handleRowChange = (index: number, field: keyof ScannedRow, value: any) => {
    setScannedRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteRow = (index: number) => {
    setScannedRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddRow = () => {
    setScannedRows((prev) => [
      ...prev,
      {
        categoryNameAr: "وجبات البروست",
        categoryNameEn: "Broast Meals",
        itemNameAr: "وجبة جديدة",
        itemNameEn: "New Item",
        descriptionAr: "مكونات الوجبة",
        descriptionEn: "",
        price: 90,
      },
    ]);
  };

  const handleSaveToDatabase = async () => {
    if (scannedRows.length === 0) return;
    setSaving(true);
    setError(null);

    try {
      const res = await adminSaveScannedRowsAction(scannedRows);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          setScannedRows([]);
          setFile(null);
          setPreviewUrl(null);
          setSaveSuccess(false);
        }, 3000);
      } else {
        setError(res.error || "فشل حفظ الأصناف في قاعدة البيانات.");
      }
    } catch (err: any) {
      setError("حدث خطأ غير متوقع عند حفظ البيانات.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      {/* Header */}
      <div className="border-b pb-4 border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
            ماسح المنيو الذكي · AI Menu Scanner
          </h2>
          <p className="text-sm text-white/60 mt-1">
            ارفع صورة المنيو وسيقوم الذكاء الاصطناعي بقراءتها، أو اضغط "إضافة أصناف يدوياً" لإدخالها فوراً.
          </p>
        </div>

        {scannedRows.length === 0 && (
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-400 font-bold px-4 py-2.5 text-xs transition border border-white/15"
          >
            <FileEdit className="size-4" />
            <span>إضافة وجبات يدوياً في جدول</span>
          </button>
        )}
      </div>

      {/* Upload & Preview Section */}
      {scannedRows.length === 0 && (
        <div className="bg-carbon-900/60 p-6 rounded-2xl border border-white/10 shadow-sm space-y-6">
          <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-brand-500 transition-colors bg-carbon-950/40">
            <input
              type="file"
              accept="image/*"
              id="menu-upload"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="menu-upload" className="cursor-pointer flex flex-col items-center justify-center gap-3">
              <UploadCloud className="w-12 h-12 text-brand-500" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-white">
                  اضغط هنا لاختيار أو رفع صورة المينيو (JPG, PNG, WEBP)
                </p>
                <p className="text-xs text-white/40">يتم ضغط الصورة تلقائياً لسرعة القراءة الفورية</p>
              </div>
            </label>
          </div>

          {previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-96 flex items-center justify-center bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Menu Preview" className="max-h-96 object-contain" />
              </div>

              <button
                onClick={handleScan}
                disabled={scanning}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-amber-600 to-brand-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جاري تحليل صورة المنيو واستخراج الأصناف بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>بدء المسح واستخراج المينيو الآن</span>
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
              <h3 className="text-lg font-bold text-red-400">تنبيه أثناء المسح</h3>
              <p className="text-sm text-white/80 max-w-xl mx-auto leading-relaxed">
                {error}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setError(null)}
                  className="bg-white/10 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
                >
                  محاولة أخرى
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    handleAddRow();
                  }}
                  className="bg-brand-500 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors"
                >
                  إدخال الأصناف يدوياً بالجدول
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results & Review Table */}
      {scannedRows.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                الأصناف المستخرجة ({scannedRows.length})
              </h3>
              <p className="text-sm text-white/60 mt-1">
                يمكنك التعديل على أسماء الأصناف أو الأسعار مباشرة في الجدول قبل الاعتماد والحفظ.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddRow}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة صنف
              </button>

              <button
                onClick={handleSaveToDatabase}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>تم حفظ الأصناف بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{saving ? "جاري الحفظ..." : "اعتماد وحفظ بالمينيو"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-carbon-900 rounded-2xl border border-white/10 overflow-x-auto shadow-sm">
            <table className="w-full text-right text-sm text-white">
              <thead className="bg-white/5 text-white/70 border-b border-white/10 font-semibold">
                <tr>
                  <th className="p-4">القسم (عربي)</th>
                  <th className="p-4">الاسم (عربي)</th>
                  <th className="p-4">الوصف (مكونات الوجبة)</th>
                  <th className="p-4 w-32">السعر (ج.م)</th>
                  <th className="p-4 text-center w-16">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {scannedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.categoryNameAr}
                        onChange={(e) => handleRowChange(idx, "categoryNameAr", e.target.value)}
                        className="w-full bg-carbon-950 border border-white/10 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none text-white font-semibold"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.itemNameAr}
                        onChange={(e) => handleRowChange(idx, "itemNameAr", e.target.value)}
                        className="w-full bg-carbon-950 border border-white/10 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none text-white font-semibold"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.descriptionAr || ""}
                        onChange={(e) => handleRowChange(idx, "descriptionAr", e.target.value)}
                        className="w-full bg-carbon-950 border border-white/10 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none text-white text-xs"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.5"
                        value={row.price}
                        onChange={(e) => handleRowChange(idx, "price", parseFloat(e.target.value) || 0)}
                        className="w-full bg-carbon-950 border border-white/10 rounded-lg px-3 py-1.5 focus:border-brand-500 outline-none text-left font-black text-amber-400"
                        dir="ltr"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="p-2 text-white/40 hover:text-red-400 transition-colors"
                        title="حذف الصنف"
                      >
                        <Trash2 className="w-5 h-5" />
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
  );
}
