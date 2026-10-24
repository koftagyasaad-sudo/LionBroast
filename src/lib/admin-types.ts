import type { OrderLine } from "@/db/schema";
import type { CategoryDTO, MenuItemDTO, ZoneDTO } from "@/lib/types";

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  address: string;
  mapsLink: string | null;
  deliveryZone: string;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomer {
  id: string;
  customerCode: string;
  name: string;
  primaryPhone: string;
  secondaryPhone: string | null;
  street: string;
  building: string | null;
  flat: string | null;
  landmark: string | null;
  zoneId: string | null;
  createdAt: string;
  updatedAt: string;
  zone: ZoneDTO | null;
  ordersCount: number;
  ltv: number;
}

export interface AdminStats {
  revenue: number;
  ordersCount: number;
  customersCount: number;
  todayRevenue: number;
  todayOrders: number;
  pendingCount: number;
  topItems: { name: string; qty: number; revenue: number }[];
}

export interface AdminItem extends MenuItemDTO {
  createdAt: string;
  updatedAt: string;
}

export interface AdminBundle {
  stats: AdminStats;
  orders: AdminOrder[];
  customers: AdminCustomer[];
  categories: CategoryDTO[];
  items: AdminItem[];
  zones: ZoneDTO[];
  settings: { key: string; value: string }[];
}
