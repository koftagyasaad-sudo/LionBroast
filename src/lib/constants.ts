export const BRAND = {
  name: "Broast El-Assad",
  nameAr: "بروست الأسد",
  tagline: "A Taste Fit for Lions",
  taglineAr: "طعم يليق بالأسود",
  city: "Desouk, Kafr El-Sheikh",
  cityAr: "دسوق، كفر الشيخ",
  addressEn: "El-Gomhoria St., Desouk, Kafr El-Sheikh",
  addressAr: "شارع الجمهورية، دسوق، كفر الشيخ",
  hours: "12:00 PM — 3:00 AM",
  shortCode: "ASD",
} as const;

/** WhatsApp business line. Override with NEXT_PUBLIC_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000001555";

/** Hotline shown across the UI. Override with NEXT_PUBLIC_HOTLINE. */
export const HOTLINE = process.env.NEXT_PUBLIC_HOTLINE || "19955";

export const CURRENCY = { ar: "ج.م", en: "EGP" } as const;

export const MAPS_QUERY_BASE = "https://www.google.com/maps/search/?api=1&query=";

export const OUT_OF_RANGE = "__OUT_OF_RANGE__";
