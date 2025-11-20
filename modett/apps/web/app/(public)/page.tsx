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
        imageSrc="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop"
      />

      <CollectionBanner
        title="THE JOURNAL"
        subtitle=""
        buttonText="DISCOVER NOW"
        buttonHref="/journal"
        imageSrc="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=1080&fit=crop"
      />

      <BrandPhilosophy />
    </main>
  );
}
