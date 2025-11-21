import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative h-[550px] md:h-[600px] lg:h-[650px] w-full">
      <div className="absolute inset-0">
        <Image
          src="/images/hero.jpg"
          alt="Modett hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-12 tracking-tight leading-tight">
          Quiet luxury.
          <br />
          Timeless craft.
        </h1>
      </div>

      {/* Bottom Buttons - Desktop */}
      <div className="absolute bottom-12 left-0 right-0 px-8 md:px-16 lg:px-24 hidden md:flex justify-between items-center">
        <Button
          variant="outline"
          size="lg"
          className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all px-10 py-5 text-xs tracking-[0.25em]"
        >
          SHOP COLLECTION
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all px-10 py-5 text-xs tracking-[0.25em]"
        >
          OUR JOURNAL
        </Button>
      </div>

      {/* Mobile Buttons - Centered */}
      <div className="absolute bottom-12 left-0 right-0 px-4 md:hidden flex flex-col gap-4 items-center">
        <Button
          variant="outline"
          size="lg"
          className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all px-8 py-4 text-xs tracking-[0.25em] w-full max-w-xs"
        >
          SHOP COLLECTION
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all px-8 py-4 text-xs tracking-[0.25em] w-full max-w-xs"
        >
          OUR JOURNAL
        </Button>
      </div>
    </section>
  );
}
