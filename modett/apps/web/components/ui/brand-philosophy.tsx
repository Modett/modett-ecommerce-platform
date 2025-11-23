import Image from "next/image";
import { Button } from "@/components/ui/button";

export function BrandPhilosophy() {
  return (
    <section className="w-full bg-[#EFECE5] overflow-x-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-[80px] py-[80px]">
        <div className="flex flex-col items-center gap-[64px]">
          <div className="grid grid-cols-[200px_1fr_200px] w-full h-[480px]">
            <div className="relative h-[480px] overflow-hidden">
              <Image
                src="/stamp.png"
                alt="Modett stamp"
                fill
                className="object-cover"
                style={{ objectPosition: "95% 60%" }}
                sizes="200px"
                priority
              />
            </div>
            {/* Studio - 880px × 480px */}
            <div className="relative h-[480px] overflow-hidden">
              <Image
                src="/studio.png"
                alt="Modett fashion design studio"
                fill
                className="object-cover"
                sizes="880px"
                priority
              />
            </div>
            {/* Tag - 200px × 480px */}
            <div className="relative h-[480px] overflow-hidden">
              <Image
                src="/tag.png"
                alt="Modett tag"
                fill
                className="object-cover"
                style={{ objectPosition: "25% 90%" }}
                sizes="200px"
                priority
              />
            </div>
          </div>

          {/* Text Content - Vertical flow, Fill width (1280px), Hug height (112px), 32px gap */}
          <div className="flex flex-col items-center text-center w-full gap-[32px]">
            <p
              className="text-[18px] font-normal leading-[28px] max-w-[686px]"
              style={{
                fontFamily: "Raleway, sans-serif",
                color: "#2D2D2D",
                letterSpacing: "0%",
              }}
            >
              A philosophy of buying fewer, better pieces. We craft
              investment-quality garments
              <br /> from the finest natural fabrics, designed to endure for
              years, not seasons.
            </p>
            <Button
              variant="link"
              className="p-0 h-auto text-[16px] font-medium uppercase tracking-[4px] leading-[24px]"
              style={{
                fontFamily: "Raleway, sans-serif",
                color: "#765C4D",
              }}
              asChild
            >
              <a href="/about" className="inline-flex items-center gap-[8px]">
                LEARN MORE
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#765C4D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
