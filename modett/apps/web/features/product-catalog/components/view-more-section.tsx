import Link from "next/link";
import { COMMON_CLASSES, RESPONSIVE } from "@/features/cart/constants/styles";
import { Text } from "@/components/ui/text";
import { PageContainer } from "@/components/layout/page-container";

interface ViewMoreSectionProps {
  href?: string;
  label?: string;
  className?: string;
}

export function ViewMoreSection({
  href = "/collections",
  label = "VIEW MORE",
  className,
}: ViewMoreSectionProps) {
  return (
    <section className={`w-full ${COMMON_CLASSES.pageBg} ${className}`}>
      <PageContainer>
        <div
          className={`w-full max-w-[1280px] mx-auto flex flex-col items-center justify-center ${RESPONSIVE.gap.item} pt-[32px] md:pt-12 lg:pt-16 xl:pt-[64px] pb-[48px] md:pb-6 lg:pb-8`}
        >
          <Link href={href} className="w-full flex justify-center md:w-auto">
            <button
              className={`w-[260px] md:w-auto min-w-0 md:min-w-[190px] lg:min-w-[200px] h-[48px] md:h-[46px] lg:h-[48px] px-0 md:px-6 py-0 md:py-3 flex items-center justify-center ${COMMON_CLASSES.primaryButton}`}
            >
              <Text.Button
                as="span"
                className="text-[13px] md:text-[13.5px] lg:text-[14px] font-medium leading-[22px] md:leading-[23px] lg:leading-[24px] uppercase text-white whitespace-nowrap"
              >
                {label}
              </Text.Button>
            </button>
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}
