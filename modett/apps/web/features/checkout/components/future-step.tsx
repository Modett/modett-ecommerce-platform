import { FONTS } from "@/features/cart/constants/styles";
import { memo } from "react";

interface FutureStepProps {
  stepNumber: number;
  title: string;
}

export const FutureStep = memo(function FutureStep({ stepNumber, title }: FutureStepProps) {
  return (
    <div className="bg-[#E5E0D6] border border-[#E5E0D6] h-[50px] md:h-[56px] lg:h-[60px] flex items-center px-3 md:px-4 lg:px-6 w-full max-w-[358px] md:max-w-none mx-auto md:mx-0">
      <h2
        className="text-base md:text-[17px] lg:text-[17.7px] leading-[24px] md:leading-[26px] lg:leading-[28px] font-normal text-[#BBA496]"
        style={{ fontFamily: FONTS.raleway }}
      >
        {stepNumber}. {title}
      </h2>
    </div>
  );
});
