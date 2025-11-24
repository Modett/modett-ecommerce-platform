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
        subtitle="SIGNATURE"
        imageSrc="/collection-banner.jpg"
        secondTitle="THE JOURNAL"
        secondSubtitle="BEHIND THE CRAFT"
      />

      <BrandPhilosophy />
    </main>
  );
}
