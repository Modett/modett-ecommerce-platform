import { TEXT_STYLES } from "@/features/cart/constants/styles";

interface CheckoutProgressBarProps {
  currentStep: number;
}

export function CheckoutProgressBar({ currentStep }: CheckoutProgressBarProps) {
  const steps = [
    { number: 1, label: "E-mail address", shortLabel: "E-mail" },
    { number: 2, label: "Shipping", shortLabel: "Shipping" },
    { number: 3, label: "Information", shortLabel: "Info" },
    { number: 4, label: "Payment", shortLabel: "Payment" },
  ];

  return (
    <div className="w-full max-w-[358px] md:max-w-[904px] mx-auto md:mx-0 h-[43px] md:h-[50px] lg:h-[60px] flex items-center gap-4 md:gap-0 pt-[8px] pb-[16px] md:py-3 lg:py-4 mb-4 md:mb-5 lg:mb-6 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {steps.map((step) => {
        const isActive = step.number === currentStep;
        const isCompleted = step.number < currentStep;

        const style =
          isActive || isCompleted
            ? TEXT_STYLES.bodyGraphite
            : TEXT_STYLES.bodySlate;

        return (
          <div
            key={step.number}
            className="flex items-center gap-1 md:gap-2 md:pr-4 lg:pr-[30px] flex-shrink-0"
          >
            <span
              className="text-[12px] md:text-xs lg:text-sm font-normal whitespace-nowrap leading-[18px]"
              style={{
                ...style,
                fontFamily: "Raleway, sans-serif",
                letterSpacing: "0px",
              }}
            >
              {step.number}. {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
