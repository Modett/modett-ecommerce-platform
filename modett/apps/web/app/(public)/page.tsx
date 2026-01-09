// import { HeroNew } from "@/components/sections/hero-new";
import { Hero } from "@/components/sections/hero";
import { InvestmentPieces } from "@/features/product-catalog/components/investment-pieces";
import { CollectionBanner } from "@/components/ui/collection-banner";
import { BrandPhilosophy } from "@/components/sections/brand-philosophy";

export default function HomePage() {
  return (
    <main>
      {/* 
        NEW HERO DESIGN (UNCOMMENT TO ENABLE)
        Note: This new hero includes its own header. 
        If enabling, you may need to hide the global <Header /> in layout.tsx.
      */}
      {/* <HeroNew /> */}
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
