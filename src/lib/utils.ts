type Lang = "ar" | "en";

export function cn(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

/** 1650 -> "1,650" with graceful zero trimming. */
export function fmtNumber(n: number): string {
  const v = Math.round(n * 100) / 100;
  return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function money(n: number, lang: Lang): string {
  return lang === "ar" ? `${fmtNumber(n)} ج.م` : `EGP ${fmtNumber(n)}`;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function genCustomerCode(rand: () => number = Math.random): string {
  let s = "";
  for (let i = 0; i < 5; i++) s += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  return `ASD-${s}`;
}

const ORDER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function genOrderNumber(d: Date = new Date(), rand: () => number = Math.random): string {
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  let s = "";
  for (let i = 0; i < 4; i++) s += ORDER_ALPHABET[Math.floor(rand() * ORDER_ALPHABET.length)];
  return `BA-${yy}${mm}${dd}-${s}`;
}

/** Normalize common Egyptian phone input formats into 20XXXXXXXXXX. */
export function normalizeEgyptPhone(raw: string): string {
  let p = raw.replace(/[^\d+]/g, "");
  if (p.startsWith("+")) p = p.slice(1);
  if (p.startsWith("0020")) p = p.slice(2);
  if (p.startsWith("20") && p.length === 12) p = p.slice(2);
  return p; // expect 01XXXXXXXXX
}

export function isEgyptMobile(raw: string): boolean {
  return /^01[0125][0-9]{8}$/.test(normalizeEgyptPhone(raw));
}

export function mapsLink(address: string, zone: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${zone}`)}`;
}

export function waLink(number: string, message: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
}

export function timeAgo(iso: string | Date, lang: Lang): string {
  const t = typeof iso === "string" ? new Date(iso) : iso;
  const diff = Math.max(0, Date.now() - t.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return lang === "ar" ? "الآن" : "just now";
  if (m < 60) return lang === "ar" ? `منذ ${m} دقيقة` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === "ar" ? `منذ ${h} ساعة` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return lang === "ar" ? `منذ ${d} يوم` : `${d}d ago`;
}
