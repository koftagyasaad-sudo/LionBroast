export interface CategoryDTO {
  id: string;
  nameAr: string;
  nameEn?: string;
  sortOrder: number;
  image?: string;
  isActive?: boolean;
}

export interface MenuItemDTO {
  id: string;
  categoryId: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
  sortOrder: number;
  spicyOption?: boolean;
  isBestSeller?: boolean;
  sizes?: { name: string; price: number }[];
}

export interface ZoneDTO {
  id: string;
  nameAr: string;
  nameEn?: string;
  price: number;
  fee?: number;
  estimatedMinutes: number;
  isActive?: boolean;
}

export interface Promo {
  enabled: boolean;
  title: string;
  code: string;
  textAr?: string;
  textEn?: string;
}

export interface FrontendSettings {
  brandNameAr: string;
  brandNameEn: string;
  logoUrl: string;
  heroTitleAr: string;
  heroSubtitleAr: string;
  marqueeTextAr: string;
  marqueeAr?: string;
  marqueeEn?: string;
  footerTextAr: string;
  addressAr: string;
  workingHoursAr: string;
  hotline: string;
  whatsapp: string;
  deliveryFee: number;
  taxPercent: number;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  nameAr: string;
  price: number;
  quantity: number;
  size?: string;
  isSpicy?: boolean;
  notes?: string;
}

export interface OrderPayload {
  customerName: string;
  customerPhone: string;
  address: string;
  deliveryZoneId: string;
  notes?: string;
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  promoCode?: string;
  discountAmount?: number;
}

export interface CustomerPassData {
  customer: {
    id: string;
    name: string;
    phone: string;
    passCode: string;
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
    discountPercent: number;
    createdAt: Date | string;
  };
  ordersList: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: Date | string;
  }[];
  ordersCount: number;
  ltv: number;
  zone?: ZoneDTO | null;
}
