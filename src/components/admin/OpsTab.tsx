"use client";

import { useState } from "react";
import { Bike, Check, Megaphone, Plus, Save, Trash2 } from "lucide-react";
import type { TabProps } from "@/components/admin/AdminShell";
import { adminDeleteZoneAction, adminSaveZoneAction, adminSetSettingAction } from "@/app/admin-actions";

const input =
  "rounded-xl border border-white/10 bg-carbon-950 px-3 py-2 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-500";

export default function OpsTab({ token, data, refresh }: TabProps) {
  const promoMap = Object.fromEntries(data.settings.map((s) => [s.key, s.value]));
  const [promo, setPromo] = useState({
    enabled: promoMap.promo_enabled === "true",
    ar: promoMap.promo_text_ar ?? "",
    en: promoMap.promo_text_en ?? "",
  });
  const [savedPromo, setSavedPromo] = useState(false);
  const [newZone, setNewZone] = useState({ nameAr: "", nameEn: "", price: 20 });
  const [drafts, setDrafts] = useState<Record<string, { nameAr: string; nameEn: string; price: number }>>({});

  const savePromo = async () => {
    await adminSetSettingAction(token, "promo_enabled", String(promo.enabled));
    await adminSetSettingAction(token, "promo_text_ar", promo.ar);
    await adminSetSettingAction(token, "promo_text_en", promo.en);
    setSavedPromo(true);
    setTimeout(() => setSavedPromo(false), 2000);
    await refresh();
  };

  const draftOf = (id: string) => {
    const z = data.zones.find((x) => x.id === id)!;
    return drafts[id] ?? { nameAr: z.nameAr, nameEn: z.nameEn, price: z.price };
  };

  const setDraft = (id: string, patch: Partial<{ nameAr: string; nameEn: string; price: number }>) => {
    const cur = draftOf(id);
    setDrafts((d) => ({ ...d, [id]: { ...cur, ...patch } }));
  };

  const saveZone = async (id: string, isActive: boolean, sortOrder: number) => {
    const d = draftOf(id);
    await adminSaveZoneAction(token, { id, nameAr: d.nameAr, nameEn: d.nameEn, price: Number(d.price) || 0, isActive, sortOrder });
    await refresh();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Zones */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900 p-5">
        <h1 className="flex items-center gap-2 text-lg font-extrabold">
          <Bike className="size-5 text-brand-500" /> مناطق التوصيل · Delivery Zones
        </h1>
        <p className="mt-1 text-xs text-white/45">Flat rates shown at checkout. Inactive zones disappear from the customer app.</p>

        <div className="mt-4 space-y-2.5">
          {data.zones.map((z) => {
            const d = draftOf(z.id);
            const dirty = d.nameAr !== z.nameAr || d.nameEn !== z.nameEn || d.price !== z.price;
            return (
              <div key={z.id} className={`flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 p-3 ${z.isActive ? "" : "opacity-45"}`}>
                <input className={`${input} w-32`} value={d.nameAr} onChange={(e) => setDraft(z.id, { nameAr: e.target.value })} />
                <input className={`${input} w-40`} dir="ltr" value={d.nameEn} onChange={(e) => setDraft(z.id, { nameEn: e.target.value })} />
                <span className="flex items-center gap-1 text-xs font-bold text-white/50" dir="ltr">
                  <input
                    className={`${input} w-20 text-center`}
                    type="number"
                    min={0}
                    value={d.price}
                    onChange={(e) => setDraft(z.id, { price: Number(e.target.value) })}
                  />
                  EGP
                </span>
                <div className="ms-auto flex items-center gap-1.5">
                  <button
                    onClick={() => saveZone(z.id, !z.isActive, z.sortOrder)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold transition ${z.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}
                  >
                    {z.isActive ? "Active" : "Off"}
                  </button>
                  <button
                    onClick={() => saveZone(z.id, z.isActive, z.sortOrder)}
                    disabled={!dirty}
                    className="grid size-8 place-items-center rounded-full bg-brand-500 text-white transition enabled:hover:scale-110 disabled:opacity-30"
                    aria-label="save zone"
                  >
                    <Save className="size-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Remove zone from customer app?")) {
                        await adminDeleteZoneAction(token, z.id);
                        await refresh();
                      }
                    }}
                    className="grid size-8 place-items-center rounded-full border border-white/10 text-white/40 transition hover:text-red-400"
                    aria-label="deactivate zone"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-white/15 p-3">
          <Plus className="size-4 text-brand-400" />
          <input className={`${input} flex-1`} placeholder="المنطقة بالعربي" value={newZone.nameAr} onChange={(e) => setNewZone({ ...newZone, nameAr: e.target.value })} />
          <input className={`${input} flex-1`} dir="ltr" placeholder="Zone EN" value={newZone.nameEn} onChange={(e) => setNewZone({ ...newZone, nameEn: e.target.value })} />
          <input className={`${input} w-24`} dir="ltr" type="number" min={0} value={newZone.price} onChange={(e) => setNewZone({ ...newZone, price: Number(e.target.value) })} />
          <button
            onClick={async () => {
              if (!newZone.nameAr.trim() || !newZone.nameEn.trim()) return;
              await adminSaveZoneAction(token, { ...newZone, isActive: true, sortOrder: data.zones.length });
              setNewZone({ nameAr: "", nameEn: "", price: 20 });
              await refresh();
            }}
            className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-extrabold text-white transition hover:scale-105"
          >
            Add Zone
          </button>
        </div>
      </div>

      {/* Promo bulletin */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900 p-5">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Megaphone className="size-5 text-cheese-400" /> لوحة الإعلانات · Promo Bulletin
        </h2>
        <p className="mt-1 text-xs text-white/45">Controls the announcement shown in the customer floating dock.</p>

        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 p-4">
          <span className={`relative h-6 w-11 rounded-full transition ${promo.enabled ? "flame-badge" : "bg-white/10"}`}>
            <span className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${promo.enabled ? "start-[22px]" : "start-0.5"}`} />
          </span>
          <input type="checkbox" className="hidden" checked={promo.enabled} onChange={(e) => setPromo({ ...promo, enabled: e.target.checked })} />
          <span className="text-sm font-bold">{promo.enabled ? "Visible to customers" : "Hidden"}</span>
        </label>

        <p className="mb-1 mt-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Arabic text</p>
        <textarea className={`${input} w-full`} rows={2} value={promo.ar} onChange={(e) => setPromo({ ...promo, ar: e.target.value })} />
        <p className="mb-1 mt-3 text-[10px] font-bold uppercase tracking-widest text-white/40">English text</p>
        <textarea className={`${input} w-full`} rows={2} dir="ltr" value={promo.en} onChange={(e) => setPromo({ ...promo, en: e.target.value })} />

        {/* live preview */}
        <div className="golden-card mt-4 rounded-2xl border border-cheese-400/40 p-4">
          <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.3em] text-cheese-300">
            <Megaphone className="size-3.5" /> Preview
          </p>
          <p className="mt-2 text-sm font-bold text-white/90">{promo.ar || promo.en || "—"}</p>
        </div>

        <button
          onClick={savePromo}
          className="glow-brand mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 text-sm font-extrabold text-white transition hover:scale-[1.01]"
        >
          {savedPromo ? <Check className="size-4.5" /> : <Save className="size-4.5" />}
          {savedPromo ? "Saved Live" : "Publish Bulletin"}
        </button>
      </div>
    </div>
  );
}
