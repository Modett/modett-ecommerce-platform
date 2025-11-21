import { Hero } from '@/components/ui/hero';
import { InvestmentPieces } from '@/features/product-catalog/components/investment-pieces';
import { CollectionBanner } from '@/components/ui/collection-banner';
import { BrandPhilosophy } from '@/components/ui/brand-philosophy';

export default function HomePage() {
  return (
    <main>
      <Hero />

      <InvestmentPieces />

      <CollectionBanner
        title="COLLECTIONS"
        subtitle="EXPLORE THE CRAFT"
        buttonText="EXPLORE THE CRAFT"
        buttonHref="/collections"
        imageSrc="/images/banner-1.jpg"
      />

      <CollectionBanner
        title="THE JOURNAL"
        subtitle=""
        buttonText="DISCOVER NOW"
        buttonHref="/journal"
        imageSrc="/images/banner-2.jpg"
      />

      <BrandPhilosophy />
    </main>
  );
}
