import { Check } from "lucide-react";
import { TEXT_STYLES } from "@/features/cart/constants/styles";
import { memo } from "react";

interface CompletedCheckoutStepProps {
  stepNumber: number;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

export const CompletedCheckoutStep = memo(function CompletedCheckoutStep({
  stepNumber,
  title,
  onEdit,
  children,
}: CompletedCheckoutStepProps) {
  return (
    <div className="w-full flex flex-col border border-[#E5E0D6]">
      <div className="flex-1 bg-[#E5E0D6] px-3 md:px-4 lg:px-6 flex justify-between items-center min-h-[48px] md:min-h-[56px] lg:min-h-[60px]">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-[#232D35] flex items-center justify-center">
            <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#232D35]" />
          </div>
          <h2
            className="text-base md:text-lg lg:text-[20px] leading-[24px] md:leading-[26px] lg:leading-[28px] font-normal text-[#232D35]"
            style={TEXT_STYLES.bodyGraphite}
          >
            {stepNumber}. {title}
          </h2>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center justify-end text-[9px] md:text-[10px] leading-[16px] font-normal text-[#232D35] uppercase"
          style={TEXT_STYLES.button}
        >
          EDIT
        </button>
      </div>
      <div className="w-full bg-[#EFECE5] pl-[63px] pr-6 py-2 flex flex-col justify-center gap-2">
        {children}
      </div>
    </div>
  );
});
