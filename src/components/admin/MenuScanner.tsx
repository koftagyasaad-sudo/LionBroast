"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCheck,
  CloudUpload,
  FileImage,
  FileJson2,
  Loader2,
  Rocket,
  ScanSearch,
  X,
  AlertTriangle,
} from "lucide-react";
import type { TabProps } from "@/components/admin/AdminShell";
import { adminPublishScanAction, adminScanMenuAction, type ScannedRow } from "@/app/admin-actions";

type Stage = "idle" | "upload" | "ocr" | "vision" | "struct" | "review" | "pushed" | "error";

const STAGES: {
  key: Exclude<Stage, "idle" | "review" | "pushed" | "error">;
  labelAr: string;
  labelEn: string;
  icon: typeof BrainCircuit;
  ms: number;
}[] = [
  { key: "upload", labelAr: "رفع الصورة", labelEn: "Uploading scan", icon: CloudUpload, ms: 600 },
  { key: "ocr", labelAr: "استخراج النص OCR", labelEn: "OCR text extraction", icon: ScanSearch, ms: 1200 },
  { key: "vision", labelAr: "تحليل Vision LLM", labelEn: "Vision-LLM understanding", icon: BrainCircuit, ms: 2000 },
  { key: "struct", labelAr: "بناء JSON منظم", labelEn: "Structuring JSON", icon: FileJson2, ms: 800 },
];

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      const base64 = comma >= 0 ? result.slice(comma + 1) : result;
      resolve({ base64, mimeType: file.type || "image/jpeg" });
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export default function MenuScanner({ token, data, refresh }: TabProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ScannedRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [progress, setProgress] = useState(0);
  const [pushedCount, setPushedCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const reset = () => {
    timers.current.forEach(clearTimeout);
    setStage("idle");
    setPreview(null);
    setRows([]);
    setSelected(new Set());
    setProgress(0);
    setFileName("");
    setErrorMsg("");
  };

  const runPipeline = useCallback(
    async (file: File) => {
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
      setProgress(0);
      setErrorMsg("");
      setStage("upload");

      let elapsed = 0;
      const tick = setInterval(() => {
        elapsed += 80;
        setProgress(Math.min(92, Math.round((elapsed / 9000) * 92)));
      }, 80);
      timers.current.push(tick as unknown as ReturnType<typeof setTimeout>);

      STAGES.forEach((s, i) => {
        timers.current.push(
          setTimeout(() => setStage(s.key), STAGES.slice(0, i).reduce((a, x) => a + x.ms, 0)),
        );
      });

      try {
        const { base64, mimeType } = await fileToBase64(file);

        // Real Gemini AI call — sends image payload object
        const parsed = await adminScanMenuAction(token, {
          fileName: file.name,
          imageBase64: base64,
          mimeType,
        });

        timers.current.forEach(clearTimeout);
        setProgress(100);
        setRows(parsed.rows);
        setSelected(new Set(parsed.rows.map((_, i) => i)));
        setStage("review");
      } catch (err) {
        timers.current.forEach(clearTimeout);
        setProgress(0);
        setErrorMsg(err instanceof Error ? err.message : "Scan failed");
        setStage("error");
      }
    },
    [token],
  );

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) runPipeline(f);
  };

  const patch = (i: number, p: Partial<ScannedRow>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...p } : r)));

  const toggle = (i: number) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const publish = async () => {
    const chosen = rows.filter((_, i) => selected.has(i));
    if (!chosen.length) return;
    setStage("pushed");
    try {
      const res = await adminPublishScanAction(token, chosen);
      setPushedCount(res.inserted);
      await refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Publish failed");
      setStage("error");
    }
  };

  const stageIdx = STAGES.findIndex((s) => s.key === stage);
  const field =
    "w-full rounded-lg border border-white/10 bg-carbon-950 px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-brand-500";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">ماسح المنيو الذكي · AI Menu Scanner</h1>
        <p className="mt-1 text-xs text-white/45">
          ارفع صورة المنيو الورقي — Google Gemini Flash هيقراها ويقسمها JSON منظم (أقسام، أسماء بالعربي/إنجليزي، أسعار، أحجام) للنشر بضغطة واحدة.
        </p>
      </div>

      {stage === "idle" && (
        <label className="group grid cursor-pointer place-items-center gap-4 rounded-[32px] border-2 border-dashed border-white/15 bg-carbon-900 p-14 text-center transition hover:border-brand-500/60">
          <span className="grid size-20 place-items-center rounded-3xl bg-brand-500/10 text-brand-400 transition group-hover:scale-110">
            <FileImage className="size-9" />
          </span>
          <div>
            <p className="text-lg font-extrabold">اسحب صورة المنيو هنا</p>
            <p className="mt-1 text-xs text-white/45">JPG / PNG / WEBP — حتى 12MB — وضوح عالي = دقة أعلى</p>
          </div>
          <span className="glow-brand rounded-full bg-brand-500 px-6 py-3 text-sm font-extrabold text-white">
            Choose Image
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      )}

      {stage === "error" && (
        <div className="grid place-items-center gap-4 rounded-[32px] border border-red-500/30 bg-red-500/10 p-12 text-center">
          <AlertTriangle className="size-12 text-red-400" />
          <h2 className="text-xl font-extrabold text-red-300">فشل المسح</h2>
          <p className="max-w-md text-sm text-white/70">{errorMsg}</p>
          <p className="text-xs text-white/40">
            تأكد إن GEMINI_API_KEY متضاف في Vercel Environment Variables وعملت Redeploy.
          </p>
          <button
            onClick={reset}
            className="mt-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-extrabold text-white"
          >
            حاول مرة أخرى
          </button>
        </div>
      )}

      {stage !== "idle" && stage !== "review" && stage !== "pushed" && stage !== "error" && (
        <div className="grid gap-6 rounded-[32px] border border-white/10 bg-carbon-900 p-8 md:grid-cols-[220px_1fr]">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="scan" className="h-52 w-full rounded-2xl object-cover ring-1 ring-white/10" />
          )}
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold">
                Gemini 1.5 Flash analyzing{" "}
                <span className="font-mono text-white/50" dir="ltr">
                  {fileName}
                </span>
              </p>
              <Loader2 className="size-5 animate-spin text-brand-500" />
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="flame-badge h-full rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.12 }}
              />
            </div>
            <div className="mt-6 space-y-3">
              {STAGES.map((s, i) => {
                const done = i < stageIdx;
                const active = i === stageIdx;
                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-3 text-sm font-bold transition ${
                      done ? "text-emerald-400" : active ? "text-white" : "text-white/30"
                    }`}
                  >
                    <span
                      className={`grid size-9 place-items-center rounded-xl border ${
                        done
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : active
                            ? "border-brand-500 bg-brand-500/15 text-brand-400 animate-pulse"
                            : "border-white/10"
                      }`}
                    >
                      {done ? <CheckCheck className="size-4.5" /> : <s.icon className="size-4.5" />}
                    </span>
                    {s.labelEn} <span className="text-white/35">· {s.labelAr}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {stage === "review" && (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">راجع قبل النشر · Verification Table</h2>
              <p className="text-xs text-white/45">
                {rows.length} items parsed from {fileName} — عدّل أي حاجة قبل ما تنشر.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-extrabold text-white/70 transition hover:border-white/40"
              >
                <X className="size-4" /> New Scan
              </button>
              <button
                onClick={publish}
                className="glow-brand flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-extrabold text-white transition hover:scale-105"
              >
                <Rocket className="size-4" /> Approve & Push ({selected.size}) to Live Menu
              </button>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="rounded-3xl border border-cheese-400/30 bg-cheese-400/10 p-8 text-center text-sm font-bold text-cheese-300">
              الـ AI مقدرش يستخرج أصناف من الصورة. جرب صورة أوضح أو إضاءة أفضل.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-carbon-900">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-start text-[10px] font-extrabold uppercase tracking-widest text-white/40">
                    <th className="p-3 text-start"></th>
                    <th className="p-3 text-start">Item AR</th>
                    <th className="p-3 text-start">Item EN</th>
                    <th className="p-3 text-start">Category</th>
                    <th className="p-3 text-start">Price</th>
                    <th className="p-3 text-start">Sizes</th>
                    <th className="p-3 text-start">Conf.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((r, i) => (
                    <tr key={i} className={selected.has(i) ? "" : "opacity-40"}>
                      <td className="p-3">
                        <button
                          onClick={() => toggle(i)}
                          className={`grid size-6 place-items-center rounded-md border transition ${
                            selected.has(i)
                              ? "flame-badge border-transparent text-white"
                              : "border-white/20 text-transparent"
                          }`}
                          aria-label="toggle row"
                        >
                          <CheckCheck className="size-3.5" />
                        </button>
                      </td>
                      <td className="p-3">
                        <input
                          className={field}
                          value={r.nameAr}
                          onChange={(e) => patch(i, { nameAr: e.target.value })}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          className={field}
                          dir="ltr"
                          value={r.nameEn}
                          onChange={(e) => patch(i, { nameEn: e.target.value })}
                        />
                      </td>
                      <td className="p-3">
                        <select
                          className={field}
                          value={r.categoryEn}
                          onChange={(e) => {
                            const cat = data.categories.find((c) => c.nameEn === e.target.value);
                            patch(i, {
                              categoryEn: e.target.value,
                              categoryAr: cat?.nameAr ?? r.categoryAr,
                            });
                          }}
                        >
                          {!data.categories.some((c) => c.nameEn === r.categoryEn) && (
                            <option value={r.categoryEn}>{r.categoryEn}</option>
                          )}
                          {data.categories.map((c) => (
                            <option key={c.id} value={c.nameEn}>
                              {c.nameEn}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          className={`${field} w-20`}
                          dir="ltr"
                          type="number"
                          min={0}
                          value={r.price}
                          onChange={(e) => patch(i, { price: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-3 text-xs text-white/50">
                        {r.sizes.length ? r.sizes.map((s) => `${s.en} (${s.price})`).join(" · ") : "—"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${
                            r.confidence >= 0.9
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-cheese-400/15 text-cheese-300"
                          }`}
                        >
                          {Math.round(r.confidence * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {stage === "pushed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="golden-card grid place-items-center gap-3 rounded-[32px] border border-cheese-400/40 p-12 text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/img/mascot-lion.png"
              alt="mascot"
              className="size-24 rounded-3xl object-cover ring-4 ring-cheese-400/50"
            />
            <h2 className="text-2xl font-extrabold text-white">تم النشر بنجاح!</h2>
            <p className="text-sm text-white/70">{pushedCount} items are now live on the storefront menu.</p>
            <button
              onClick={reset}
              className="mt-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-extrabold text-white transition hover:scale-105"
            >
              Scan Another Menu
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
