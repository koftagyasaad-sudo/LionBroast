"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Flame, ImageOff, Loader2, PencilLine, Plus, Search, Star, Trash2, X } from "lucide-react";
import type { TabProps } from "@/components/admin/AdminShell";
import type { AdminItemInput } from "@/app/admin-actions";
import { adminDeleteCategoryAction, adminDeleteItemAction, adminSaveCategoryAction, adminSaveItemAction } from "@/app/admin-actions";
import type { AdminItem } from "@/lib/admin-types";
import type { ItemSize } from "@/db/schema";

const input =
  "w-full rounded-xl border border-white/10 bg-carbon-950 px-3.5 py-2.5 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-500";

function emptyItem(categoryId: string): AdminItemInput {
  return {
    categoryId,
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    price: 0,
    sizes: [],
    spicyOption: false,
    isBestSeller: false,
    isAvailable: true,
    image: "",
  };
}

export default function MenuTab({ token, data, refresh }: TabProps) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<AdminItemInput | null>(null);
  const [busy, setBusy] = useState(false);
  const [newCat, setNewCat] = useState({ nameAr: "", nameEn: "" });

  const catName = (id: string) => data.categories.find((c) => c.id === id)?.nameEn ?? "—";

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.items.filter((i) => !query || [i.nameAr, i.nameEn].some((s) => s.toLowerCase().includes(query)));
  }, [data.items, q]);

  const saveItem = async () => {
    if (!editing || busy) return;
    setBusy(true);
    try {
      await adminSaveItemAction(token, { ...editing, price: Number(editing.price) || 0 });
      setEditing(null);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const toggleFlag = async (item: AdminItem, flag: "isBestSeller" | "isAvailable" | "spicyOption") => {
    await adminSaveItemAction(token, { ...item, [flag]: !item[flag] });
    await refresh();
  };

  const removeItem = async (id: string) => {
    if (!confirm("Delete this item permanently?")) return;
    await adminDeleteItemAction(token, id);
    await refresh();
  };

  const addCategory = async () => {
    if (!newCat.nameAr.trim() || !newCat.nameEn.trim()) return;
    await adminSaveCategoryAction(token, { nameAr: newCat.nameAr.trim(), nameEn: newCat.nameEn.trim() });
    setNewCat({ nameAr: "", nameEn: "" });
    await refresh();
  };

  const removeCategory = async (id: string) => {
    if (!confirm("Deactivate category? Its items stay but the category hides.")) return;
    await adminDeleteCategoryAction(token, id);
    await refresh();
  };

  const setSize = (idx: number, patch: Partial<ItemSize>) => {
    if (!editing) return;
    const sizes = [...(editing.sizes ?? [])];
    sizes[idx] = { ...sizes[idx], ...patch };
    setEditing({ ...editing, sizes });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">المنيو · Menu Management</h1>
        <button
          onClick={() => setEditing(emptyItem(data.categories[0]?.id ?? ""))}
          className="glow-brand flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-extrabold text-white transition hover:scale-105"
        >
          <Plus className="size-4" /> صنف جديد · New Item
        </button>
      </div>

      {/* Category manager */}
      <div className="rounded-3xl border border-white/10 bg-carbon-900 p-4">
        <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-white/40">Categories</p>
        <div className="flex flex-wrap items-center gap-2">
          {data.categories.map((c) => (
            <span key={c.id} className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold">
              {c.nameAr} <span className="text-white/40">/ {c.nameEn}</span>
              <button onClick={() => removeCategory(c.id)} className="text-white/30 transition hover:text-red-400" aria-label="deactivate">
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <div className="flex flex-wrap items-center gap-1.5">
            <input value={newCat.nameAr} onChange={(e) => setNewCat({ ...newCat, nameAr: e.target.value })} placeholder="اسم عربي" className="w-28 rounded-full border border-white/10 bg-carbon-950 px-3 py-1.5 text-xs outline-none focus:border-brand-500" />
            <input value={newCat.nameEn} onChange={(e) => setNewCat({ ...newCat, nameEn: e.target.value })} placeholder="English name" className="w-28 rounded-full border border-white/10 bg-carbon-950 px-3 py-1.5 text-xs outline-none focus:border-brand-500" />
            <button onClick={addCategory} className="grid size-7 place-items-center rounded-full bg-brand-500 text-white transition hover:scale-110" aria-label="add category">
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في الأصناف..." className="w-full rounded-2xl border border-white/10 bg-carbon-900 py-3 ps-11 pe-4 text-sm font-semibold outline-none placeholder:text-white/30 focus:border-brand-500" />
      </div>

      {/* Items table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-carbon-900">
        <div className="divide-y divide-white/5">
          {rows.map((it) => (
            <div key={it.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03]">
              <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white/5">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt="" className="size-full object-cover" />
                ) : (
                  <ImageOff className="size-4 text-white/25" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">{it.nameAr} <span className="font-semibold text-white/40">/ {it.nameEn}</span></p>
                <p className="text-[10px] text-white/40">{catName(it.categoryId)} · {it.sizes.length > 0 ? `${it.sizes.length} sizes` : "single"}</p>
              </div>
              <span className="font-mono text-sm font-extrabold text-brand-400" dir="ltr">{it.price} EGP</span>
              <button
                onClick={() => toggleFlag(it, "isBestSeller")}
                title="Best seller"
                className={`grid size-8 place-items-center rounded-full border transition ${it.isBestSeller ? "flame-badge border-transparent text-white" : "border-white/10 text-white/30 hover:text-cheese-300"}`}
              >
                <Star className="size-4" fill={it.isBestSeller ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => toggleFlag(it, "spicyOption")}
                title="Has spicy variant"
                className={`grid size-8 place-items-center rounded-full border transition ${it.spicyOption ? "border-brand-500 bg-brand-500/15 text-brand-400" : "border-white/10 text-white/30"}`}
              >
                <Flame className="size-4" />
              </button>
              <button
                onClick={() => toggleFlag(it, "isAvailable")}
                title="Available"
                className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold transition ${it.isAvailable ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-red-500/40 bg-red-500/10 text-red-400"}`}
              >
                {it.isAvailable ? "متاح" : "موقوف"}
              </button>
              <button onClick={() => setEditing({ ...it })} className="grid size-8 place-items-center rounded-full border border-white/10 text-white/50 transition hover:border-brand-500 hover:text-brand-400" aria-label="edit">
                <PencilLine className="size-4" />
              </button>
              <button onClick={() => removeItem(it.id)} className="grid size-8 place-items-center rounded-full border border-white/10 text-white/50 transition hover:border-red-500 hover:text-red-400" aria-label="delete">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {rows.length === 0 && <p className="px-4 py-12 text-center text-sm text-white/40">No items match.</p>}
        </div>
      </div>

      {/* Editor modal */}
      <AnimatePresence>
        {editing && (
          <motion.div className="fixed inset-0 z-[60] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="close" onClick={() => setEditing(null)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 50, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 40, scale: 0.97 }}
              className="relative max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-carbon-900 p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold">{editing.id ? "تعديل الصنف · Edit Item" : "صنف جديد · New Item"}</h2>
                <button onClick={() => setEditing(null)} className="grid size-8 place-items-center rounded-full bg-white/5 text-white/60" aria-label="close">
                  <X className="size-4" />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input className={input} placeholder="الاسم بالعربي" value={editing.nameAr} onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })} />
                <input className={input} placeholder="Name (English)" value={editing.nameEn} onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })} />
                <textarea className={input} rows={2} placeholder="الوصف بالعربي" value={editing.descriptionAr ?? ""} onChange={(e) => setEditing({ ...editing, descriptionAr: e.target.value })} />
                <textarea className={input} rows={2} placeholder="Description (English)" value={editing.descriptionEn ?? ""} onChange={(e) => setEditing({ ...editing, descriptionEn: e.target.value })} />
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-white/40">Base price (EGP)</label>
                  <input className={input} type="number" min={0} step={5} value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-white/40">Category</label>
                  <select className={input} value={editing.categoryId} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value })}>
                    {data.categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nameAr} / {c.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[10px] font-bold text-white/40">Image URL (auto-fallback if empty)</label>
                  <input className={input} dir="ltr" placeholder="https://..." value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
                </div>
              </div>

              {/* Size variants editor */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-carbon-950 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-extrabold uppercase tracking-widest text-white/40">Size Variants</p>
                  <button
                    onClick={() => setEditing({ ...editing, sizes: [...(editing.sizes ?? []), { id: `v${Date.now()}`, ar: "", en: "", price: editing.price }] })}
                    className="flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/70 transition hover:bg-brand-500/20 hover:text-brand-300"
                  >
                    <Plus className="size-3.5" /> Add size
                  </button>
                </div>
                <div className="space-y-2">
                  {(editing.sizes ?? []).map((s, i) => (
                    <div key={s.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
                      <input className={input} placeholder="الحجم عربي" value={s.ar} onChange={(e) => setSize(i, { ar: e.target.value })} />
                      <input className={input} placeholder="Size EN" value={s.en} onChange={(e) => setSize(i, { en: e.target.value })} />
                      <input className={`${input} w-24`} type="number" min={0} value={s.price} onChange={(e) => setSize(i, { price: Number(e.target.value) })} />
                      <button
                        onClick={() => setEditing({ ...editing, sizes: (editing.sizes ?? []).filter((_, j) => j !== i) })}
                        className="grid size-9 place-items-center rounded-xl text-white/40 transition hover:text-red-400"
                        aria-label="remove size"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                  {(editing.sizes ?? []).length === 0 && <p className="text-[11px] text-white/30">No variants — sold at base price only.</p>}
                </div>
              </div>

              {/* Flags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(
                  [
                    ["spicyOption", "Original/Spicy variant"],
                    ["isBestSeller", "Best Seller badge"],
                    ["isAvailable", "Available on menu"],
                  ] as const
                ).map(([flag, label]) => (
                  <button
                    key={flag}
                    onClick={() => setEditing({ ...editing, [flag]: !editing[flag] })}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                      editing[flag] ? "flame-badge border-transparent text-white" : "border-white/15 text-white/50"
                    }`}
                  >
                    <Check className={`size-3.5 ${editing[flag] ? "opacity-100" : "opacity-0"}`} />
                    {label}
                  </button>
                ))}
              </div>

              <button
                onClick={saveItem}
                disabled={busy || !editing.nameAr.trim() || !editing.nameEn.trim()}
                className="glow-brand mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-sm font-extrabold text-white transition hover:scale-[1.01] disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-4.5 animate-spin" /> : <Check className="size-4.5" />}
                حفظ · Save Item
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
