"use server";

import { db } from "@/db";
import { categories, deliveryZones, menuItems, orders, settings } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { getAdminStats, getAllSettings, getMenuData, listCustomersAdmin, listOrdersAdmin } from "@/db/queries";
import { asc, eq } from "drizzle-orm";
import type { ItemSize } from "@/db/schema";

function assertAdmin(token: string) {
  const expected = process.env.ADMIN_PASSCODE;
  if (!expected || token !== expected) throw new Error("UNAUTHORIZED");
}

/** One-shot bundle for the dashboard boot. */
export async function adminGetAllAction(token: string) {
  assertAdmin(token);
  const [stats, ordersList, customersList, menu, settingsList, zones] = await Promise.all([
    getAdminStats(),
    listOrdersAdmin(),
    listCustomersAdmin(),
    getMenuData(),
    getAllSettings(),
    db.select().from(deliveryZones).orderBy(asc(deliveryZones.sortOrder)),
  ]);
  return {
    stats,
    orders: ordersList.map((o) => ({ ...o, createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString() })),
    customers: customersList.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    categories: menu.categories,
    items: menu.items.map((i) => ({ ...i, createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString() })),
    zones,
    settings: settingsList,
  };
}

/* ---- order status ---- */
const ALLOWED_STATUSES = new Set(["PENDING", "CONFIRMED", "PREPARING", "ON_THE_WAY", "DELIVERED", "CANCELLED"]);

export async function adminSetOrderStatusAction(token: string, id: string, status: string) {
  assertAdmin(token);
  if (!ALLOWED_STATUSES.has(status)) throw new Error("BAD_STATUS");
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  return { ok: true };
}

/* ---- zones ---- */
export async function adminSaveZoneAction(
  token: string,
  zone: { id?: string; nameAr: string; nameEn: string; price: number; isActive: boolean; sortOrder?: number },
) {
  assertAdmin(token);
  await ensureSeed();
  if (zone.id) {
    await db.update(deliveryZones).set(zone).where(eq(deliveryZones.id, zone.id));
  } else {
    await db.insert(deliveryZones).values(zone);
  }
  return { ok: true };
}

export async function adminDeleteZoneAction(token: string, id: string) {
  assertAdmin(token);
  await db.update(deliveryZones).set({ isActive: false }).where(eq(deliveryZones.id, id));
  return { ok: true };
}

/* ---- categories ---- */
export async function adminSaveCategoryAction(
  token: string,
  cat: { id?: string; nameAr: string; nameEn: string; sortOrder?: number; isActive?: boolean; image?: string | null },
) {
  assertAdmin(token);
  await ensureSeed();
  if (cat.id) {
    await db.update(categories).set(cat).where(eq(categories.id, cat.id));
  } else {
    await db.insert(categories).values({ sortOrder: 99, isActive: true, ...cat });
  }
  return { ok: true };
}

export async function adminDeleteCategoryAction(token: string, id: string) {
  assertAdmin(token);
  await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
  return { ok: true };
}

/* ---- menu items ---- */
export type AdminItemInput = {
  id?: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: number;
  sizes?: ItemSize[];
  spicyOption?: boolean;
  isBestSeller?: boolean;
  isAvailable?: boolean;
  image?: string | null;
};

export async function adminSaveItemAction(token: string, item: AdminItemInput) {
  assertAdmin(token);
  await ensureSeed();
  const payload = { ...item, sizes: item.sizes ?? [], updatedAt: new Date() };
  if (item.id) {
    await db.update(menuItems).set(payload).where(eq(menuItems.id, item.id));
  } else {
    await db.insert(menuItems).values(payload);
  }
  return { ok: true };
}

export async function adminDeleteItemAction(token: string, id: string) {
  assertAdmin(token);
  await db.delete(menuItems).where(eq(menuItems.id, id));
  return { ok: true };
}

/* ---- settings / promo ---- */
export async function adminSetSettingAction(token: string, key: string, value: string) {
  assertAdmin(token);
  await ensureSeed();
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* AI OCR Menu Scanner — REAL Vision-LLM (GPT-4o)                      */
/* ------------------------------------------------------------------ */

export interface ScannedRow {
  categoryEn: string;
  categoryAr: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: number;
  sizes: ItemSize[];
  spicyOption: boolean;
  confidence: number;
}

export async function adminScanMenuAction(
  token: string,
  payload: { fileName: string; imageBase64: string; mimeType: string },
) {
  assertAdmin(token);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured in environment variables");
  }

  // Load existing categories so the model must map into them
  await ensureSeed();
  const existingCats = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder));

  const catList = existingCats
    .map((c) => `- "${c.nameEn}" / "${c.nameAr}"`)
    .join("\n");

  const systemPrompt = `You are a precise restaurant menu OCR and data-extraction engine for an Egyptian broast/fried-chicken restaurant.
You MUST return ONLY valid JSON. No markdown, no commentary, no code fences.

TASK:
Read the menu image and extract EVERY distinct sellable item.

OUTPUT SCHEMA (strict):
{
  "rows": [
    {
      "categoryEn": string,
      "categoryAr": string,
      "nameEn": string,
      "nameAr": string,
      "descriptionEn": string,
      "descriptionAr": string,
      "price": number,
      "sizes": [{ "id": string, "ar": string, "en": string, "price": number }],
      "spicyOption": boolean,
      "confidence": number
    }
  ]
}

HARD RULES:
1. categoryEn MUST be one of the existing categories below. If unsure, pick the closest match. NEVER invent a new category name.
2. Prices are Egyptian Pounds (EGP). Use the number only (e.g. 120 not "120 EGP").
3. If an item has size variants (Small/Large, Box/Mega, 4pcs/6pcs), put the cheapest as "price" and list ALL variants in "sizes". If no sizes, use [].
4. size.id must be a short slug like "sm", "lg", "box", "4pc".
5. nameAr and descriptionAr must be proper Arabic. If the menu is English-only, translate accurately to Egyptian Arabic restaurant style.
6. nameEn must be proper English. If the menu is Arabic-only, translate accurately.
7. spicyOption = true only if the item is clearly spicy / hot / fire / buffalo / jalapeño related.
8. confidence is 0.0–1.0 reflecting how sure you are about that row.
9. Extract ALL items visible. Do not skip, do not hallucinate items that are not on the menu.
10. Ignore headers, footers, phone numbers, addresses, social media, and decorative text.

EXISTING CATEGORIES (map into these ONLY):
${catList || '- "Legendary Broast" / "البروست الأسطوري"\n- "Crunchy Sandwiches" / "ساندوتشات كرانشي"\n- "Meals & Combos" / "الوجبات والكومبو"\n- "Sides & Sauces" / "المقبلات والصوصات"\n- "Beverages" / "المشروبات"'}
`;

  const userText = `Extract the full structured menu from this image. File name hint: ${payload.fileName}`;

  const body = {
    model: "gpt-4o",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          {
            type: "image_url",
            image_url: {
              url: `data:${payload.mimeType};base64,${payload.imageBase64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content || "{}";

  let parsed: { rows?: ScannedRow[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const catByEn = new Map(existingCats.map((c) => [c.nameEn.toLowerCase(), c]));
  const catByAr = new Map(existingCats.map((c) => [c.nameAr, c]));

  const rows: ScannedRow[] = (parsed.rows || [])
    .filter((r) => r && (r.nameAr || r.nameEn) && Number(r.price) >= 0)
    .map((r) => {
      // Force category to an existing one
      let matched =
        catByEn.get((r.categoryEn || "").toLowerCase()) ||
        catByAr.get(r.categoryAr || "") ||
        existingCats[0];

      const sizes: ItemSize[] = Array.isArray(r.sizes)
        ? r.sizes
            .filter((s) => s && (s.en || s.ar) && Number(s.price) >= 0)
            .map((s, idx) => ({
              id: String(s.id || `s${idx}`).slice(0, 24),
              ar: String(s.ar || s.en || ""),
              en: String(s.en || s.ar || ""),
              price: Number(s.price) || 0,
            }))
        : [];

      return {
        categoryEn: matched?.nameEn || r.categoryEn || "Other",
        categoryAr: matched?.nameAr || r.categoryAr || "أخرى",
        nameEn: String(r.nameEn || r.nameAr || "").trim(),
        nameAr: String(r.nameAr || r.nameEn || "").trim(),
        descriptionEn: String(r.descriptionEn || "").trim(),
        descriptionAr: String(r.descriptionAr || "").trim(),
        price: Number(r.price) || 0,
        sizes,
        spicyOption: Boolean(r.spicyOption),
        confidence: Math.max(0, Math.min(1, Number(r.confidence) || 0.85)),
      };
    });

  return { rows, engine: "GPT-4o Vision", fileName: payload.fileName };
}

/** Batch-publish approved scan rows to the live menu. */
export async function adminPublishScanAction(token: string, rows: ScannedRow[]) {
  assertAdmin(token);
  await ensureSeed();
  const cats = await db.select().from(categories);
  const byEn = new Map(cats.map((c) => [c.nameEn, c.id]));
  let inserted = 0;
  for (const r of rows) {
    let categoryId = byEn.get(r.categoryEn);
    // Auto-create category if somehow missing
    if (!categoryId) {
      const [created] = await db
        .insert(categories)
        .values({
          nameAr: r.categoryAr || r.categoryEn,
          nameEn: r.categoryEn,
          sortOrder: 99,
          isActive: true,
        })
        .returning();
      categoryId = created.id;
      byEn.set(r.categoryEn, categoryId);
    }
    await db.insert(menuItems).values({
      categoryId,
      nameAr: r.nameAr,
      nameEn: r.nameEn,
      descriptionAr: r.descriptionAr,
      descriptionEn: r.descriptionEn,
      price: r.price,
      sizes: r.sizes,
      spicyOption: r.spicyOption,
      isBestSeller: false,
      isAvailable: true,
      sortOrder: 50,
    });
    inserted++;
  }
  return { ok: true, inserted };
}
