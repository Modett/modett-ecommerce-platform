import Image from "next/image";
import { TEXT_STYLES } from "@/features/cart/constants/styles";

interface PaymentMethodOptionProps {
  value: string;
  label: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
  icon?: string;
  icons?: Array<{ src: string; alt: string; width: number; height: number }>;
}

export function PaymentMethodOption({
  value,
  label,
  isSelected,
  onSelect,
  icon,
  icons,
}: PaymentMethodOptionProps) {
  return (
    <label
      className={`flex items-center ${icons ? "justify-between" : ""} px-[9px] h-[58px] border rounded-[8px] cursor-pointer ${
        isSelected
          ? "bg-[#E5E0D6] border-[#3E5460]"
          : "bg-[#EFECE5] border-[#BBA496]"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
            isSelected ? "border-[#232D35]" : "border-[#BBA496]"
          }`}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-[#232D35]" />}
        </div>
        <input
          type="radio"
          name="paymentMethod"
          value={value}
          checked={isSelected}
          onChange={() => onSelect(value)}
          className="hidden"
        />
        <span
          className="text-[14px] leading-[24px] text-[#3E5460]"
          style={TEXT_STYLES.bodyTeal}
        >
          {label}
        </span>
      </div>

      {/* Single icon */}
      {icon && (
        <div className="w-[58px] h-[40px] relative border border-[#E5E0D6] rounded-[4px] bg-white flex items-center justify-center overflow-hidden">
          <Image
            src={icon}
            alt={label}
            width={42}
            height={19}
            className="object-contain"
          />
        </div>
      )}

      {/* Multiple icons */}
      {icons && (
        <div className="flex gap-[8px]">
          {icons.map((iconData, index) => (
            <div
              key={index}
              className="w-[58px] h-[40px] relative border border-[#E5E0D6] rounded-[4px] bg-white flex items-center justify-center overflow-hidden"
            >
              <Image
                src={iconData.src}
                alt={iconData.alt}
                width={iconData.width}
                height={iconData.height}
                className="object-contain p-1"
              />
            </div>
          ))}
        </div>
      )}
    </label>
  );
}
