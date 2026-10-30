import { getCategoriesWithItems, getFrontendSettings, getPromo } from "@/db/queries";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import LocationBlock from "@/components/LocationBlock";
import ChefCta from "@/components/ChefCta";
import Footer from "@/components/Footer";

// إيقاف الكاش الثابت لضمان قراءة التعديلات فور حفظها من لوحة التحكم
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [frontend, promo, catsWithItems] = await Promise.all([
    getFrontendSettings().catch(() => null),
    getPromo().catch(() => null),
    getCategoriesWithItems().catch(() => []),
  ]);

  return (
    <main className="min-h-screen bg-carbon-950 text-white selection:bg-brand-500">
      <Header frontend={frontend} promo={promo} />
      <HeroSlider frontend={frontend} />
      {/* باقي الأقسام */}
      <LocationBlock frontend={frontend} />
      <ChefCta frontend={frontend} />
      <Footer frontend={frontend} />
    </main>
  );
}
