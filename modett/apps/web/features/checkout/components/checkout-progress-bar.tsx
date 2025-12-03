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
    <div className="w-full max-w-[904px] min-h-[40px] md:h-[50px] lg:h-[60px] flex items-center py-2 md:py-3 lg:py-4 mb-4 md:mb-5 lg:mb-6">
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
            className="flex items-center gap-1 md:gap-2 pr-2 md:pr-4 lg:pr-[30px]"
          >
            <span
              className="text-[10px] md:text-xs lg:text-sm font-medium whitespace-nowrap"
              style={{ ...style, letterSpacing: "0.3px" }}
            >
              {/* Show short label on mobile, full label on tablet+ */}
              <span className="md:hidden">
                {step.number}. {step.shortLabel}
              </span>
              <span className="hidden md:inline">
                {step.number}. {step.label}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
