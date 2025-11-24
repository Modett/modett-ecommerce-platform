import Image from "next/image";
import { Button } from "@/components/ui/button";

interface CollectionBannerProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonHref?: string;
  imageSrc: string;
  secondTitle?: string;
  secondSubtitle?: string;
  secondButtonText?: string;
  secondButtonHref?: string;
}

export function CollectionBanner({
  title,
  subtitle,
  buttonText,
  buttonHref = "#",
  imageSrc,
  secondTitle,
  secondSubtitle,
  secondButtonText,
  secondButtonHref = "#",
}: CollectionBannerProps) {
  return (
    <section className="relative h-[400px] md:h-[506px] w-full">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#232D35]/60" />
      </div>

      <div className="relative h-full w-full max-w-[350px] md:max-w-[1440px] mx-auto px-0 md:px-8 lg:px-12 pb-[34px]">
        <div className="h-full flex flex-col items-center justify-end gap-4">
          {/* First Section - Frame 276 */}
          <div className="flex flex-col items-center justify-center text-center h-[132px] gap-4 w-full">
            {subtitle && (
              <div className="flex items-center justify-center h-6">
                <p
                  className="text-base font-medium uppercase tracking-[4px] text-[#C1AB85] whitespace-nowrap"
                  style={{ fontFamily: "Raleway", lineHeight: "24px" }}
                >
                  {subtitle}
                </p>
              </div>
            )}
            <h2 className="font-serif text-[48px] leading-[60px] tracking-[0.03em] font-medium uppercase text-center text-[#E5E0D6]">
              {title}
            </h2>
            {buttonText && (
              <Button
                variant="outline"
                className="bg-transparent text-[#E5E0D6] border-[#E5E0D6] hover:bg-[#E5E0D6] hover:text-black transition-all h-[48px] w-[282px] text-base font-medium tracking-[4px] uppercase"
                style={{ fontFamily: "Raleway", lineHeight: "24px" }}
                asChild
              >
                <a href={buttonHref}>{buttonText}</a>
              </Button>
            )}
          </div>

          {/* Divider */}
          {secondTitle && (
            <div className="w-full max-w-[1280px] h-0 border-t border-[#BBA496]" />
          )}

          {/* Second Section - Frame 276 */}
          {secondTitle && (
            <div className="flex flex-col items-center justify-center text-center h-[132px] gap-4 w-full">
              {secondSubtitle && (
                <div className="flex items-center justify-center h-6">
                  <p
                    className="text-base font-medium uppercase tracking-[4px] text-[#C1AB85] whitespace-nowrap"
                    style={{ fontFamily: "Raleway", lineHeight: "24px" }}
                  >
                    {secondSubtitle}
                  </p>
                </div>
              )}
              <h2 className="font-serif text-[48px] leading-[60px] tracking-[0.03em] font-medium uppercase text-center text-[#E5E0D6]">
                {secondTitle}
              </h2>
              {secondButtonText && (
                <Button
                  variant="outline"
                  className="bg-transparent text-[#E5E0D6] border-[#E5E0D6] hover:bg-[#E5E0D6] hover:text-black transition-all h-[48px] w-[282px] text-base font-medium tracking-[4px] uppercase"
                  style={{ fontFamily: "Raleway", lineHeight: "24px" }}
                  asChild
                >
                  <a href={secondButtonHref}>{secondButtonText}</a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
