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
          className={`w-full max-w-[1280px] mx-auto flex flex-col items-center justify-center ${RESPONSIVE.gap.item} pt-8 md:pt-12 lg:pt-16 xl:pt-[64px] pb-4 md:pb-6 lg:pb-8`}
        >
          <Link href={href}>
            <button
              className={`w-full min-w-[180px] md:min-w-[190px] lg:min-w-[200px] h-[44px] md:h-[46px] lg:h-[48px] px-5 md:px-6 py-2.5 md:py-3 ${COMMON_CLASSES.primaryButton}`}
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
