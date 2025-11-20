import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&h=1080&fit=crop"
          alt="Modett hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 tracking-tight">
          Quiet luxury.
          <br />
          Timeless craft.
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button variant="outline" size="lg" className="bg-white/90 text-primary border-white hover:bg-white">
            SHOP COLLECTION
          </Button>
          <Button variant="outline" size="lg" className="bg-transparent text-white border-white hover:bg-white/10">
            READ JOURNAL
          </Button>
        </div>
      </div>
    </section>
  );
}
