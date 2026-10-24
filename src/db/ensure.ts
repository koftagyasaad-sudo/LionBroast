import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Self-healing schema bootstrap: makes the app zero-touch on fresh
 * environments (local sandbox, Neon on Vercel preview, CI). Runs the full
 * DDL only when the `customers` table is missing. `drizzle-kit push` remains
 * the canonical tool for production migrations.
 */

const DDL: string[] = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
  `CREATE TABLE IF NOT EXISTS delivery_zones (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name_ar text NOT NULL,
     name_en text NOT NULL,
     price double precision NOT NULL DEFAULT 0,
     is_active boolean NOT NULL DEFAULT true,
     sort_order integer NOT NULL DEFAULT 0
   )`,
  `CREATE TABLE IF NOT EXISTS customers (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     customer_code text NOT NULL UNIQUE,
     name text NOT NULL,
     primary_phone text NOT NULL UNIQUE,
     secondary_phone text,
     street text NOT NULL,
     building text,
     flat text,
     landmark text,
     zone_id uuid,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS customers_phone_idx ON customers (primary_phone)`,
  `CREATE TABLE IF NOT EXISTS categories (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     name_ar text NOT NULL,
     name_en text NOT NULL,
     image text,
     sort_order integer NOT NULL DEFAULT 0,
     is_active boolean NOT NULL DEFAULT true
   )`,
  `CREATE TABLE IF NOT EXISTS menu_items (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     category_id uuid NOT NULL,
     name_ar text NOT NULL,
     name_en text NOT NULL,
     description_ar text,
     description_en text,
     price double precision NOT NULL DEFAULT 0,
     sizes jsonb NOT NULL DEFAULT '[]'::jsonb,
     spicy_option boolean NOT NULL DEFAULT false,
     is_best_seller boolean NOT NULL DEFAULT false,
     is_available boolean NOT NULL DEFAULT true,
     image text,
     sort_order integer NOT NULL DEFAULT 0,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS menu_items_category_idx ON menu_items (category_id)`,
  `CREATE INDEX IF NOT EXISTS menu_items_best_idx ON menu_items (is_best_seller)`,
  `CREATE TABLE IF NOT EXISTS orders (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     order_number text NOT NULL UNIQUE,
     customer_id uuid,
     customer_code text,
     customer_name text NOT NULL,
     primary_phone text NOT NULL,
     secondary_phone text,
     address text NOT NULL,
     maps_link text,
     delivery_zone text NOT NULL,
     items jsonb NOT NULL,
     subtotal double precision NOT NULL,
     delivery_fee double precision NOT NULL,
     total double precision NOT NULL,
     status text NOT NULL DEFAULT 'PENDING',
     notes text,
     created_at timestamptz NOT NULL DEFAULT now(),
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS orders_customer_idx ON orders (customer_id)`,
  `CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at)`,
  `CREATE TABLE IF NOT EXISTS settings (
     key text PRIMARY KEY,
     value text NOT NULL,
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
];

let ensured: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      const res = await db.execute(sql`SELECT to_regclass('public.customers') AS t`);
      const row = (res.rows?.[0] ?? {}) as { t: string | null };
      if (row.t) return;
      for (const stmt of DDL) {
        await db.execute(sql.raw(stmt));
      }
    })().catch((e) => {
      ensured = null; // retry next request
      throw e;
    });
  }
  return ensured;
}
