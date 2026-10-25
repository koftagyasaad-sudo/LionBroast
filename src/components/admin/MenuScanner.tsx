"use client";

import { useState } from "react";
import { adminScanMenuAction, adminSaveScannedRowsAction, ScannedRow } from "@/app/admin-actions";
import { Sparkles, UploadCloud, CheckCircle, RefreshCw, AlertTriangle, Plus, Trash2, Save } from "lucide-react";

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
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await adminScanMenuAction({
          fileName: file.name,
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
        });

        if (res.success && res.data) {
          setScannedRows(res.data);
        } else {
          setError(res.error || "حدث خطأ غير متوقع أثناء تحليل المينيو.");
        }
        setScanning(false);
      };
      reader.onerror = () => {
        setError("فشل في قراءة ملف الصورة من الجهاز.");
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء التواصل مع سيرفر المسح الذكي.");
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
        categoryNameAr: "قسم جديد",
        categoryNameEn: "New Category",
        itemNameAr: "صنف جديد",
        itemNameEn: "New Item",
        descriptionAr: "",
        descriptionEn: "",
        price: 50,
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
      <div className="border-b pb-4 dark:border-zinc-800">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
          ماسح المنيو الذكي · AI Menu Scanner
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          ارفع صورة المينيو الورقي وسيقوم الذكاء الاصطناعي (Google Gemini Flash) بقراءتها واستخراج الأصناف والأسعار تلقائياً!
        </p>
      </div>

      {/* Upload & Preview Section */}
      {scannedRows.length === 0 && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center hover:border-rose-500 transition-colors bg-zinc-50/50 dark:bg-zinc-800/50">
            <input
              type="file"
              accept="image/*"
              id="menu-upload"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="menu-upload" className="cursor-pointer flex flex-col items-center justify-center gap-3">
              <UploadCloud className="w-12 h-12 text-rose-500" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  اضغط هنا لرفع صورة المينيو (JPG, PNG, WEBP)
                </p>
                <p className="text-xs text-zinc-400">يمكنك رفع صورة عالية الجودة لضمان أقصى دقة</p>
              </div>
            </label>
          </div>

          {previewUrl && (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-96 flex items-center justify-center bg-black/5">
                <img src={previewUrl} alt="Menu Preview" className="max-h-96 object-contain" />
              </div>

              <button
                onClick={handleScan}
                disabled={scanning}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all disabled:opacity-50"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>جاري تحليل صورة المينيو واستخراج الأصناف بالذكاء الاصطناعي...</span>
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
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">حدث تنبيه أثناء المسح</h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 max-w-xl mx-auto leading-relaxed dir-rtl">
                {error}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setError(null)}
                  className="bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors"
                >
                  محاولة مرة أخرى
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results & Review Table */}
      {scannedRows.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                تم استخراج ({scannedRows.length}) صنف بنجاح
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                يمكنك التعديل على أسماء الأصناف أو الأسعار مباشرة في الجدول قبل الاعتماد والحفظ في قاعدة البيانات.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleAddRow}
                className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                إضافة صنف
              </button>

              <button
                onClick={handleSaveToDatabase}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
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
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto shadow-sm">
            <table className="w-full text-right text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-semibold">
                <tr>
                  <th className="p-4">القسم (عربي)</th>
                  <th className="p-4">الاسم (عربي)</th>
                  <th className="p-4">الاسم (إنجليزي)</th>
                  <th className="p-4">الوصف (عربي)</th>
                  <th className="p-4 w-32">السعر (ج.م)</th>
                  <th className="p-4 text-center w-16">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {scannedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.categoryNameAr}
                        onChange={(e) => handleRowChange(idx, "categoryNameAr", e.target.value)}
                        className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.itemNameAr}
                        onChange={(e) => handleRowChange(idx, "itemNameAr", e.target.value)}
                        className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.itemNameEn}
                        onChange={(e) => handleRowChange(idx, "itemNameEn", e.target.value)}
                        className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={row.descriptionAr || ""}
                        onChange={(e) => handleRowChange(idx, "descriptionAr", e.target.value)}
                        className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.5"
                        value={row.price}
                        onChange={(e) => handleRowChange(idx, "price", parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 text-left"
                        dir="ltr"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"
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
