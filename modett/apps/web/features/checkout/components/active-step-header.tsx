import { FONTS } from "@/features/cart/constants/styles";
import { memo } from "react";

interface ActiveStepHeaderProps {
  stepNumber: number;
  title: string;
}

export const ActiveStepHeader = memo(function ActiveStepHeader({
  stepNumber,
  title,
}: ActiveStepHeaderProps) {
  return (
    <div className="bg-[#232D35] p-[16px] flex items-center h-[60px] w-full max-w-[358px] md:max-w-none mx-auto md:mx-0">
      <h1
        className="text-[18px] md:text-[20px] leading-[140%] font-normal tracking-[0%] text-[#EFECE5]"
        style={{ fontFamily: FONTS.raleway }}
      >
        {stepNumber}. {title}
      </h1>
    </div>
  );
});
