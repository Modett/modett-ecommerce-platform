import { TEXT_STYLES } from "@/features/cart/constants/styles";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelClassName?: string;
  labelStyle?: React.CSSProperties;
  containerClassName?: string;
}

export function FormInput({
  label,
  labelClassName = "text-[12px] text-[#232D35] font-normal leading-[18px] tracking-[0px]",
  labelStyle = TEXT_STYLES.bodyGraphite,
  containerClassName = "",
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      <label className={labelClassName} style={labelStyle}>
        {label}
      </label>
      <input
        className={`w-full h-[40px] bg-[#EFECE5] border border-[#D4C4A8] px-3 outline-none focus:border-[#3E5460] ${className}`}
        {...props}
      />
    </div>
  );
}
