"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Loader2, Lock } from "lucide-react";
import { verifyAdminAction } from "@/app/actions";
import AdminShell from "@/components/admin/AdminShell";

const STORAGE_KEY = "ba-admin-token";

export default function AdminGate() {
  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setToken(saved);
    setReady(true);
  }, []);

  const login = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    const res = await verifyAdminAction(code.trim());
    setBusy(false);
    if (res.ok) {
      localStorage.setItem(STORAGE_KEY, code.trim());
      setToken(code.trim());
    } else {
      setDenied(true);
      setTimeout(() => setDenied(false), 900);
    }
  };

  if (!ready) return <div className="grid min-h-svh place-items-center bg-carbon-950" />;

  if (token) {
    return (
      <AdminShell
        token={token}
        onLogout={() => {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
        }}
      />
    );
  }

  return (
    <div className="grid min-h-svh place-items-center bg-carbon-950 p-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm rounded-[32px] border border-white/10 bg-carbon-900 p-8 text-center shadow-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/icon-512.png" alt="logo" className="mx-auto size-16 rounded-2xl object-cover ring-2 ring-brand-500/60" />
        <h1 className="mt-4 text-2xl font-extrabold">غرفة التحكم</h1>
        <p className="mt-1 text-xs text-white/50">Broast El-Assad — Admin Control Room</p>

        <motion.div animate={denied ? { x: [0, -10, 10, -8, 8, 0] } : {}} transition={{ duration: 0.45 }} className="mt-6">
          <div className="relative">
            <KeyRound className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Admin passcode"
              className="w-full rounded-2xl border border-white/10 bg-carbon-950 py-3.5 ps-11 pe-4 text-sm font-bold outline-none placeholder:text-white/30 focus:border-brand-500"
            />
          </div>
        </motion.div>

        <button
          onClick={login}
          disabled={busy}
          className="glow-brand mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-sm font-extrabold transition hover:scale-[1.01] disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-4.5 animate-spin" /> : <Lock className="size-4.5" />}
          Enter the Den
        </button>
        {denied && <p className="mt-3 text-xs font-bold text-red-400">Wrong passcode — wrong den.</p>}
        <p className="mt-4 text-[10px] text-white/30">Default: asad2024 — set ADMIN_PASSCODE env var in production.</p>
      </motion.div>
    </div>
  );
}
