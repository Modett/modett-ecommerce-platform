import { TEXT_STYLES } from "@/features/cart/constants/styles";

interface CheckoutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  className?: string;
}

export function CheckoutButton({
  label = "CONTINUE",
  className = "",
  ...props
}: CheckoutButtonProps) {
  return (
    <button
      type="submit"
      className={`w-full md:w-[280px] lg:w-[300px] h-[44px] md:h-[48px] lg:h-[50px] bg-[#232D35] border border-[#232D35] px-6 md:px-8 lg:px-[31px] flex items-center justify-center hover:opacity-90 transition-opacity ${className}`}
      {...props}
    >
      <span
        className="text-sm md:text-[15px] lg:text-[16px] font-medium text-[#E5E0D6] uppercase tracking-[2px] md:tracking-[3px] lg:tracking-[4px] leading-[20px] md:leading-[22px] lg:leading-[24px]"
        style={TEXT_STYLES.button}
      >
        {label}
      </span>
    </button>
  );
}
