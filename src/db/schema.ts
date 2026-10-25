// src/db/schema.ts

import { pgTable, text, integer, timestamp, serial, real, index } from "drizzle-orm/pg-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuItems = pgTable(
  "menu_items",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id").notNull().references(() => categories.id),
    nameAr: text("name_ar").notNull(),
    nameEn: text("name_en").notNull(),
    descriptionAr: text("description_ar"),
    descriptionEn: text("description_en"),
    price: real("price").notNull(),
    imageUrl: text("image_url"),
    badge: text("badge"),
    sortOrder: integer("sort_order").notNull().default(0),
    isAvailable: integer("is_available").notNull().default(1),
  },
  (table) => ({
    catIdx: index("category_idx").on(table.categoryId),
  })
);

export const items = menuItems;

export const deliveryZones = pgTable("delivery_zones", {
  id: text("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  fee: real("fee").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull().default(30),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  fullName: text("full_name"),
  name: text("name"),
  primaryPhone: text("primary_phone"),
  phone: text("phone"),
  primaryAddress: text("primary_address"),
  address: text("address"),
  notes: text("notes"),
  totalOrders: integer("total_orders").notNull().default(0),
  totalSpent: real("total_spent").notNull().default(0),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  discountPercent: integer("discount_percent").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerPhone: text("customer_phone").notNull(),
  customerName: text("customer_name").notNull(),
  address: text("address").notNull(),
  zoneId: text("zone_id").references(() => deliveryZones.id),
  subtotal: real("subtotal").notNull(),
  deliveryFee: real("delivery_fee").notNull(),
  totalAmount: real("total_amount").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderLines = pgTable("order_lines", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  itemId: text("item_id"),
  nameAr: text("name_ar").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export const orderItems = orderLines;

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const storeSettings = settings;

// Exported Types
export type Category = InferSelectModel<typeof categories>;
export type MenuItem = InferSelectModel<typeof menuItems>;
export type Item = MenuItem;
export type DeliveryZone = InferSelectModel<typeof deliveryZones>;
export type Customer = InferSelectModel<typeof customers>;
export type Order = InferSelectModel<typeof orders>;
export type OrderLine = InferSelectModel<typeof orderLines>;
export type OrderItem = OrderLine;
export type Setting = InferSelectModel<typeof settings>;
