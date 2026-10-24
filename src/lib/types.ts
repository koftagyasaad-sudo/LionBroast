import type { ItemSize } from "@/db/schema";

/** Plain DTO of a menu item row, safe to pass to client components. */
export interface MenuItemDTO {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  price: number;
  sizes: ItemSize[];
  spicyOption: boolean;
  isBestSeller: boolean;
  isAvailable: boolean;
  image: string | null;
  sortOrder: number;
}

export interface CategoryDTO {
  id: string;
  nameAr: string;
  nameEn: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ZoneDTO {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
}
