import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-[820px] w-full">
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

      <div className="relative h-full max-w-[1440px] mx-auto">
        <div className="h-full flex flex-col items-center justify-start pt-[400px] text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight leading-tight max-w-[768px] h-[152px]">
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
            className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all w-[282px] h-[48px] text-base font-medium tracking-[4px] uppercase"
            style={{ fontFamily: "Raleway", lineHeight: "24px" }}
          >
            SHOP COLLECTION
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all w-[282px] h-[48px] text-base font-medium tracking-[4px] uppercase"
            style={{ fontFamily: "Raleway", lineHeight: "24px" }}
          >
            OUR JOURNAL
          </Button>
        </div>

        {/* Mobile Buttons - Centered */}
        <div className="absolute bottom-12 left-0 right-0 px-4 md:hidden flex flex-col gap-4 items-center">
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all h-[48px] text-base font-medium tracking-[4px] uppercase w-full max-w-xs"
            style={{ fontFamily: "Raleway", lineHeight: "24px" }}
          >
            SHOP COLLECTION
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all h-[48px] text-base font-medium tracking-[4px] uppercase w-full max-w-xs"
            style={{ fontFamily: "Raleway", lineHeight: "24px" }}
          >
            OUR JOURNAL
          </Button>
        </div>
      </div>
    </section>
  );
}
