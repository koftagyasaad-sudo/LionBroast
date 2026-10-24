import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  doublePrecision,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Customers — registered via the first-visit onboarding modal         */
/* ------------------------------------------------------------------ */
export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerCode: text("customer_code").notNull().unique(), // ASD-XXXXX
    name: text("name").notNull(),
    primaryPhone: text("primary_phone").notNull().unique(), // WhatsApp-ready
    secondaryPhone: text("secondary_phone"),
    street: text("street").notNull(),
    building: text("building"),
    flat: text("flat"),
    landmark: text("landmark"),
    zoneId: uuid("zone_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("customers_phone_idx").on(t.primaryPhone)],
);

/* ------------------------------------------------------------------ */
/* Delivery zones — flat-rate pricing, admin editable                  */
/* ------------------------------------------------------------------ */
export const deliveryZones = pgTable("delivery_zones", {
  id: uuid("id").defaultRandom().primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  price: doublePrecision("price").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* Menu categories                                                     */
/* ------------------------------------------------------------------ */
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export type ItemSize = { id: string; ar: string; en: string; price: number };

/* ------------------------------------------------------------------ */
/* Menu items                                                          */
/* ------------------------------------------------------------------ */
export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id").notNull(),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    price: doublePrecision("price").notNull().default(0),
    sizes: jsonb("sizes").$type<ItemSize[]>().notNull().default([]),
    spicyOption: boolean("spicy_option").notNull().default(false), // Original / Spicy variant
    isBestSeller: boolean("is_best_seller").notNull().default(false),
    isAvailable: boolean("is_available").notNull().default(true),
    image: text("image"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("menu_items_category_idx").on(t.categoryId), index("menu_items_best_idx").on(t.isBestSeller)],
);

export type OrderLine = {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  unitPrice: number;
  qty: number;
  flavor?: "original" | "spicy" | null;
  sizeLabel?: string | null;
};

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "ON_THE_WAY",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/* ------------------------------------------------------------------ */
/* Orders — logged atomically at WhatsApp checkout                     */
/* ------------------------------------------------------------------ */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull().unique(),
    customerId: uuid("customer_id"),
    customerCode: text("customer_code"),
    customerName: text("customer_name").notNull(),
    primaryPhone: text("primary_phone").notNull(),
    secondaryPhone: text("secondary_phone"),
    address: text("address").notNull(),
    mapsLink: text("maps_link"),
    deliveryZone: text("delivery_zone").notNull(),
    items: jsonb("items").$type<OrderLine[]>().notNull(),
    subtotal: doublePrecision("subtotal").notNull(),
    deliveryFee: doublePrecision("delivery_fee").notNull(),
    total: doublePrecision("total").notNull(),
    status: text("status").notNull().default("PENDING"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_customer_idx").on(t.customerId), index("orders_created_idx").on(t.createdAt)],
);

/* ------------------------------------------------------------------ */
/* Key/value settings — promo banner, hotline, etc.                    */
/* ------------------------------------------------------------------ */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
