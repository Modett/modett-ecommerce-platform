import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-[563px] md:h-[837.07px] w-full">
      <div className="absolute inset-0">
        <Image
          src="/hero-beach.png"
          alt="Modett hero"
          fill
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
          priority
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative h-full max-w-[1440px] mx-auto">
        <div className="h-full flex flex-col items-center justify-start pt-[243px] md:pt-[400px] text-center text-white px-4">
          <h1
            className="text-[32px] md:text-[48px] leading-[120%] w-[280px] max-w-[280px] text-center text-[#E5E0D6] md:text-white"
            style={{
              fontFamily: "Playfair Display, serif",
              fontWeight: 600,
              letterSpacing: "0",
              lineHeight: "120%"
            }}
          >
            Quiet luxury.
            <br />
            <span style={{ whiteSpace: "nowrap" }}>Timeless craft.</span>
          </h1>
        </div>

        {/* Bottom Buttons - Desktop */}
        <div className="absolute bottom-12 left-0 right-0 px-8 md:px-16 lg:px-24 hidden md:flex justify-between items-center">
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all w-[282px] h-[48px] text-base font-medium tracking-[4px] uppercase rounded-none"
            style={{ fontFamily: "Raleway", lineHeight: "24px" }}
          >
            SHOP COLLECTION
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all w-[282px] h-[48px] text-base font-medium tracking-[4px] uppercase rounded-none"
            style={{ fontFamily: "Raleway", lineHeight: "24px" }}
          >
            OUR JOURNAL
          </Button>
        </div>

        {/* Mobile Buttons - Centered */}
        <div className="absolute bottom-12 left-0 right-0 px-4 md:hidden flex flex-col gap-6 items-center">
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all h-[48px] text-base font-medium tracking-[4px] uppercase w-full max-w-xs rounded-none"
            style={{ fontFamily: "Raleway", lineHeight: "24px" }}
          >
            SHOP COLLECTION
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent text-white border-white border hover:bg-white hover:text-black transition-all h-[48px] text-base font-medium tracking-[4px] uppercase w-full max-w-xs rounded-none"
            style={{ fontFamily: "Raleway", lineHeight: "24px" }}
          >
            OUR JOURNAL
          </Button>
        </div>
      </div>
    </section>
  );
}
