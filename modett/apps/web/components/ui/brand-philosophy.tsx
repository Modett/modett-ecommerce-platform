import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function BrandPhilosophy() {
  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative aspect-[4/5] md:aspect-square">
              <Image
                src="/images/brand-philosophy.jpg"
                alt="Modett craftsmanship"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>

          <div className="space-y-6">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              OUR PHILOSOPHY
            </p>
            <h2 className="font-serif text-3xl md:text-4xl">
              A philosophy of buying fewer, better pieces. We craft investment-quality garments from the finest natural materials, designed to endure for years, not seasons.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              From sustainable European linen to Italian silk, each piece is thoughtfully sourced and meticulously crafted by skilled artisans who share our vision of timeless, responsible fashion.
            </p>
            <Button variant="link" className="p-0 h-auto" asChild>
              <a href="/about">LEARN MORE </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
