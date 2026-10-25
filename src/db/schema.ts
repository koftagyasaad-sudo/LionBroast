import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { type InferSelectModel } from "drizzle-orm";

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  name: text("name").default(""),
  icon: text("icon").default(""),
  sortOrder: integer("sort_order").default(0).notNull(),
});

// Menu Items Table
export const menuItems = pgTable("items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categories.id),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionAr: text("description_ar").default(""),
  descriptionEn: text("description_en").default(""),
  price: integer("price").notNull(), // stored in piasters (e.g. 15000 = 150 EGP)
  imageUrl: text("image_url").default(""),
  isAvailable: boolean("is_available").default(true).notNull(),
  badge: text("badge").default(""),
  tags: text("tags").default(""),
  sortOrder: integer("sort_order").default(0).notNull(),
});

// Alias for items
export const items = menuItems;

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerCode: text("customer_code").default(""),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").default(""),
  customerAddress: text("customer_address").default(""),
  phone: text("phone").default(""),
  address: text("address").default(""),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").default(0).notNull(),
  total: integer("total").notNull(),
  status: text("status").default("pending").notNull(),
  notes: text("notes").default(""),
  zoneId: integer("zone_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order Items / Lines Table
export const orderLines = pgTable("order_lines", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  itemId: integer("item_id"),
  itemNameAr: text("item_name_ar").default(""),
  itemNameEn: text("item_name_en").default(""),
  itemName: text("item_name").default(""),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  notes: text("notes").default(""),
});

// Alias for orderItems
export const orderItems = orderLines;

// Customers Table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  fullName: text("full_name").default(""),
  name: text("name").default(""),
  primaryPhone: text("primary_phone").default(""),
  phone: text("phone").default(""),
  primaryAddress: text("primary_address").default(""),
  address: text("address").default(""),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Delivery Zones Table
export const deliveryZones = pgTable("delivery_zones", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  name: text("name").default(""),
  fee: integer("fee").notNull(),
  deliveryFee: integer("delivery_fee").default(0),
  estimatedTime: text("estimated_time").default(""),
  isAvailable: boolean("is_available").default(true).notNull(),
});

// Settings Table
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Alias for storeSettings
export const storeSettings = settings;

// Export TypeScript Types needed across actions and pages
export type Category = InferSelectModel<typeof categories>;
export type MenuItem = InferSelectModel<typeof menuItems>;
export type Item = MenuItem;
export type Order = InferSelectModel<typeof orders>;
export type OrderLine = InferSelectModel<typeof orderLines>;
export type OrderItem = OrderLine;
export type Customer = InferSelectModel<typeof customers>;
export type DeliveryZone = InferSelectModel<typeof deliveryZones>;
export type Setting = InferSelectModel<typeof settings>;
