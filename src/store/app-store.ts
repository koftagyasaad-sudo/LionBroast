"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Lang } from "@/lib/i18n";
import type { MenuItemDTO } from "@/lib/types";

export type Theme = "dark" | "light";

export interface CustomerProfile {
  name: string;
  primaryPhone: string;
  secondaryPhone?: string;
  street: string;
  building?: string;
  flat?: string;
  landmark?: string;
  zoneId: string;
  zoneName?: string;
}

export interface CartItem {
  /** composite key: itemId + size + flavor */
  key: string;
  id: string;
  nameAr: string;
  nameEn: string;
  image?: string | null;
  unitPrice: number;
  qty: number;
  flavor?: "original" | "spicy" | null;
  sizeId?: string | null;
  sizeLabel?: string | null;
}

export interface RecentOrder {
  orderNumber: string;
  total: number;
  createdAt: string;
  zone: string;
}

export interface Toast {
  id: number;
  title: string;
  desc?: string;
  tone?: "ok" | "fire" | "warn";
}

interface AppState {
  /* persisted */
  lang: Lang;
  theme: Theme;
  onboarded: boolean; // modal was completed or skipped once
  customer: CustomerProfile | null;
  customerCode: string | null;
  cart: CartItem[];
  recentOrders: RecentOrder[];

  /* ephemeral UI */
  cartOpen: boolean;
  onboardingOpen: boolean;
  onboardingReason: "auto" | "cart" | "pass" | "edit";
  passOpen: boolean;
  trackerOpen: boolean;
  promoClosed: boolean;
  toasts: Toast[];
  dialogItem: MenuItemDTO | null;

  /* actions */
  setLang: (l: Lang) => void;
  openItemDialog: (item: MenuItemDTO) => void;
  closeItemDialog: () => void;
  setTheme: (t: Theme) => void;
  setCartOpen: (v: boolean) => void;
  openOnboarding: (reason: AppState["onboardingReason"]) => void;
  closeOnboarding: () => void;
  completeOnboarding: (c: CustomerProfile, code: string) => void;
  skipOnboarding: () => void;
  setCustomerCode: (code: string) => void;
  setPassOpen: (v: boolean) => void;
  setTrackerOpen: (v: boolean) => void;
  setPromoClosed: (v: boolean) => void;

  addItem: (item: Omit<CartItem, "qty">, qty: number) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  pushRecentOrder: (o: RecentOrder) => void;
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 1;

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      lang: "ar",
      theme: "dark",
      onboarded: false,
      customer: null,
      customerCode: null,
      cart: [],
      recentOrders: [],

      cartOpen: false,
      onboardingOpen: false,
      onboardingReason: "auto",
      passOpen: false,
      trackerOpen: false,
      promoClosed: false,
      toasts: [],
      dialogItem: null,

      openItemDialog: (dialogItem) => set({ dialogItem }),
      closeItemDialog: () => set({ dialogItem: null }),

      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
      setCartOpen: (cartOpen) => set({ cartOpen }),
      openOnboarding: (reason) => set({ onboardingOpen: true, onboardingReason: reason }),
      closeOnboarding: () => set({ onboardingOpen: false }),
      completeOnboarding: (customer, customerCode) =>
        set({ customer, customerCode, onboarded: true, onboardingOpen: false }),
      skipOnboarding: () => set({ onboarded: true, onboardingOpen: false }),
      setCustomerCode: (customerCode) => set({ customerCode }),
      setPassOpen: (passOpen) => set({ passOpen }),
      setTrackerOpen: (trackerOpen) => set({ trackerOpen }),
      setPromoClosed: (promoClosed) => set({ promoClosed }),

      addItem: (item, qty) => {
        const cart = [...get().cart];
        const i = cart.findIndex((c) => c.key === item.key);
        if (i >= 0) cart[i] = { ...cart[i], qty: cart[i].qty + qty };
        else cart.push({ ...item, qty });
        set({ cart });
      },
      setQty: (key, qty) => {
        if (qty <= 0) return get().removeItem(key);
        set({ cart: get().cart.map((c) => (c.key === key ? { ...c, qty } : c)) });
      },
      removeItem: (key) => set({ cart: get().cart.filter((c) => c.key !== key) }),
      clearCart: () => set({ cart: [] }),
      pushRecentOrder: (o) =>
        set({ recentOrders: [o, ...get().recentOrders.filter((r) => r.orderNumber !== o.orderNumber)].slice(0, 10) }),
      pushToast: (t) => {
        const id = toastSeq++;
        set({ toasts: [...get().toasts, { ...t, id }] });
        setTimeout(() => get().dismissToast(id), 4200);
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
    }),
    {
      name: "broast-asad-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lang: s.lang,
        theme: s.theme,
        onboarded: s.onboarded,
        customer: s.customer,
        customerCode: s.customerCode,
        cart: s.cart,
        recentOrders: s.recentOrders,
      }),
    },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((a, c) => a + c.qty, 0);
export const cartSubtotal = (items: CartItem[]) =>
  Math.round(items.reduce((a, c) => a + c.unitPrice * c.qty, 0) * 100) / 100;
