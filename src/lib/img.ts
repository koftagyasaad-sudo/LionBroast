/**
 * Central image registry — locally AI-generated hero/mascot art plus
 * curated stock photography (Pexels CDN) for menu categories & items.
 */
export const IMG = {
  heroClassic: "/img/hero-classic.jpg",
  heroSpicy: "/img/hero-spicy.jpg",
  heroCombo: "/img/hero-combo.jpg",
  mascot: "/img/mascot-lion.png",
  icon: "/img/icon-512.png",

  broast:
    "https://images.pexels.com/photos/28674536/pexels-photo-28674536.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  bucket:
    "https://images.pexels.com/photos/5474676/pexels-photo-5474676.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  wings:
    "https://images.pexels.com/photos/9650084/pexels-photo-9650084.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  strips:
    "https://images.pexels.com/photos/31300944/pexels-photo-31300944.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  drumsticks:
    "https://images.pexels.com/photos/37485644/pexels-photo-37485644.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  burger:
    "https://images.pexels.com/photos/6850423/pexels-photo-6850423.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  burger2:
    "https://images.pexels.com/photos/7963144/pexels-photo-7963144.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  burger3:
    "https://images.pexels.com/photos/34407494/pexels-photo-34407494.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  burger4:
    "https://images.pexels.com/photos/2874990/pexels-photo-2874990.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  fries:
    "https://images.pexels.com/photos/31533633/pexels-photo-31533633.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  rings:
    "https://images.pexels.com/photos/30705576/pexels-photo-30705576.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  dips:
    "https://images.pexels.com/photos/8081266/pexels-photo-8081266.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ketchup:
    "https://images.pexels.com/photos/12548553/pexels-photo-12548553.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

/** Safe fallback pool used when a menu item has no dedicated photo. */
export const FALLBACK_IMGS = [IMG.broast, IMG.bucket, IMG.wings, IMG.strips, IMG.fries, IMG.burger];

export function pickFallback(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return FALLBACK_IMGS[h % FALLBACK_IMGS.length];
}
