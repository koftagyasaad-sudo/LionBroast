"use client";

import { useState, useMemo } from "react";
import { Search, Flame, UtensilsCrossed } from "lucide-react";
import MenuItemCard from "@/components/MenuItemCard";
import ItemDialog from "@/components/ItemDialog";

interface MenuExplorerProps {
  categories?: any[];
  items?: any[];
  menuItems?: any[];
}

export default function MenuExplorer({
  categories = [],
  items = [],
  menuItems = [],
}: MenuExplorerProps) {
  const allItems: any[] = items.length > 0 ? items : menuItems;
  const [activeCat, setActiveCat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // تصفية وبحث محصن 100% ضد أي قيمة undefined
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems.filter((it: any) => {
      if (!it) return false;

      if (activeCat !== "all" && String(it.categoryId) !== String(activeCat)) {
        return false;
      }

      if (!q) return true;

      const searchableFields = [
        String(it.nameAr || ""),
        String(it.nameEn || ""),
        String(it.name || ""),
        String(it.descriptionAr || ""),
        String(it.descriptionEn || ""),
        String(it.description || ""),
      ];

      return searchableFields.some(
        (s) => typeof s === "string" && s.toLowerCase().includes(q)
      );
    });
  }, [allItems, activeCat, searchQuery]);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Search & Categories Bar */}
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن وجبة أو صنف بالاسم أو المكونات..."
            className="w-full rounded-2xl border border-white/15 bg-carbon-900/80 px-11 py-3 text-xs md:text-sm font-bold text-white placeholder:text-white/40 outline-none focus:border-brand-500 transition shadow-lg backdrop-blur-md"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-brand-400" />
        </div>

        {/* Categories Tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveCat("all")}
              className={`rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer border ${
                activeCat === "all"
                  ? "bg-brand-500 text-white border-brand-500 shadow-md"
                  : "bg-carbon-900/60 text-white/70 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              الكل ({allItems.length})
            </button>

            {categories.map((cat: any) => {
              const isSelected = String(cat.id) === String(activeCat);
              const count = allItems.filter(
                (it: any) => String(it.categoryId) === String(cat.id)
              ).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition cursor-pointer border ${
                    isSelected
                      ? "bg-brand-500 text-white border-brand-500 shadow-md"
                      : "bg-carbon-900/60 text-white/70 border-white/10 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span>{cat.nameAr || cat.name}</span>
                  <span className="text-[10px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item: any, idx: number) => (
            <MenuItemCard
              key={item.id || idx}
              item={item}
              onSelect={() => setSelectedItem(item)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 bg-carbon-900/40 p-12 text-center space-y-3">
          <UtensilsCrossed className="size-10 text-brand-500 mx-auto opacity-40" />
          <p className="text-sm font-bold text-white">لم يتم العثور على وجبات مطابقة</p>
          <p className="text-xs text-white/40">جرّب البحث باسم آخر أو اختر قسماً مختلفاً.</p>
        </div>
      )}

      {/* Modal Dialog */}
      {selectedItem && (
        <ItemDialog
          item={selectedItem}
          open={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
