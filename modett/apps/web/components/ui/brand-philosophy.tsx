import Image from "next/image";
import { Button } from "@/components/ui/button";

export function BrandPhilosophy() {
  return (
    <section className="w-full bg-[#EFECE5] overflow-x-hidden">
      <div className="w-full px-[20px] md:px-[80px] pt-[60px] md:pt-[80px] pb-[48px] md:pb-[80px]">
        <div className="w-[350px] md:w-full md:max-w-[1280px] mx-auto flex flex-col items-center gap-[80px] md:gap-[64px]">
          <div className="w-full h-[400px] md:h-[480px] flex md:grid md:grid-cols-[200px_1fr_200px]">
            {/* Left section - Papers/Documents - Mobile: 75px, Desktop: 200px */}
            <div className="relative w-[75px] md:w-full h-[400px] md:h-[480px] overflow-hidden">
              <Image
                src="/stamp.png"
                alt="Modett stamp"
                fill
                className="object-cover"
                style={{ objectPosition: "95% 60%" }}
                sizes="(max-width: 768px) 75px, 200px"
                priority
              />
            </div>
            {/* Studio - Main image for mobile & desktop */}
            <div className="relative w-[200px] md:w-full h-[400px] md:h-[480px] overflow-hidden">
              <Image
                src="/studio.png"
                alt="Modett fashion design studio"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 200px, 880px"
                priority
              />
            </div>
            {/* Tag - Mobile: 75px, Desktop: 200px */}
            <div className="relative w-[75px] md:w-full h-[400px] md:h-[480px] overflow-hidden">
              <Image
                src="/tag.png"
                alt="Modett tag"
                fill
                className="object-cover"
                style={{ objectPosition: "25% 90%" }}
                sizes="(max-width: 768px) 75px, 200px"
                priority
              />
            </div>
          </div>

          {/* Text Content - Mobile: 350px width, Desktop: 1280px width */}
          <div className="flex flex-col items-center text-center w-full gap-[32px]">
            <p
              className="text-[16px] md:text-[18px] font-medium leading-[20px] md:leading-[28px] max-w-[330px] md:max-w-[686px]"
              style={{
                fontFamily: "Raleway, sans-serif",
                color: "#2D2D2D",
                letterSpacing: "2%",
              }}
            >
              A philosophy of buying fewer, better pieces. We craft
              investment-quality garments from the finest natural fabrics, designed to endure for
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
