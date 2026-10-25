"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Runtime Error:", error);
  }, [error]);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="max-w-lg w-full rounded-3xl bg-neutral-900 border border-neutral-800 p-8 space-y-6 shadow-2xl">
        <div className="text-6xl">🦁</div>
        <h1 className="text-2xl font-extrabold text-amber-400">
          عذراً، حدث خطأ مؤقت في تحميل الصفحة
        </h1>
        <p className="text-neutral-400 text-sm leading-relaxed">
          جاري تحديث البيانات في خوادم بروست الأسد. يرجى الضغط على زر إعادة المحاولة بالأسفل.
        </p>

        {error?.message && (
          <div
            dir="ltr"
            className="rounded-xl bg-black/50 p-4 text-left font-mono text-xs text-red-400 overflow-x-auto border border-red-900/30"
          >
            <p className="font-bold text-red-300 mb-1">Error Details:</p>
            <p>{error.message}</p>
            {error.digest && <p className="text-neutral-500 mt-1">Digest: {error.digest}</p>}
          </div>
        )}

        <button
          onClick={() => reset()}
          className="w-full rounded-2xl bg-amber-500 py-3.5 font-extrabold text-neutral-950 hover:bg-amber-400 transition-all cursor-pointer"
        >
          إعادة تحميل الصفحة 🔄
        </button>
      </div>
    </div>
  );
}
