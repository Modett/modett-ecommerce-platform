import { Check } from "lucide-react";
import { TEXT_STYLES } from "@/features/cart/constants/styles";

interface CustomCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
  checkboxClassName?: string;
  labelClassName?: string;
  labelStyle?: React.CSSProperties;
  variant?: "filled" | "outlined";
}

export function CustomCheckbox({
  label,
  checked,
  onChange,
  containerClassName = "",
  checkboxClassName = "w-4 h-4 md:w-5 md:h-5",
  labelClassName = "text-[11px] md:text-xs text-[#3E5460] pl-3 md:pl-4 flex-1 leading-[16px] md:leading-[18px]",
  labelStyle = TEXT_STYLES.bodyTeal,
  variant = "filled",
  ...props
}: CustomCheckboxProps) {
  const isFilled = variant === "filled";

  const borderStyle = isFilled
    ? checked
      ? "border-[#232D35] bg-[#232D35]"
      : "border-[#765C4D]"
    : "border-[#BBA496] bg-transparent";

  return (
    <label className={`flex items-center cursor-pointer ${containerClassName}`}>
      <div
        className={`${checkboxClassName} border flex items-center justify-center flex-shrink-0 ${borderStyle}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="hidden"
          {...props}
        />
        {checked &&
          (isFilled ? (
            <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
          ) : (
            <Check className="w-[14px] h-[14px] text-[#3E5460]" />
          ))}
      </div>
      <span className={labelClassName} style={labelStyle}>
        {label}
      </span>
    </label>
  );
}
