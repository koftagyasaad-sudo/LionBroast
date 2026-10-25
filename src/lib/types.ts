// src/lib/types.ts

export interface MenuItemDTO {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  price: number;
  imageUrl?: string | null;
  image?: string;
  badge?: string | null;
  sortOrder: number;
  isAvailable: number | boolean;
  sizes?: { nameAr: string; nameEn: string; price: number }[];
  spicyOption?: boolean;
  isBestSeller?: boolean;
}

export interface CategoryDTO {
  id: string;
  nameAr: string;
  nameEn: string;
  sortOrder: number;
  image?: string;
  isActive?: boolean;
  items?: MenuItemDTO[];
}

export interface ZoneDTO {
  id: string;
  nameAr: string;
  nameEn: string;
  fee: number;
  price: number;
  estimatedMinutes: number;
  sortOrder: number;
  isActive?: boolean;
}

export interface Promo {
  enabled: boolean;
  title: string;
  code: string;
  textAr?: string;
  textEn?: string;
}

export interface CartItem {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderPayload {
  name: string;
  phone: string;
  zoneId: string;
  addressDetails: string;
  notes?: string;
  items: CartItem[];
}
