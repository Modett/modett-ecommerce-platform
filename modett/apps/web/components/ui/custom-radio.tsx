import { cn } from "@/lib/utils";

interface CustomRadioProps {
  checked: boolean;
  onChange: () => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  name?: string;
  value?: string;
}

export function CustomRadio({
  checked,
  onChange,
  label,
  description,
  rightContent,
  className,
  name,
  value,
}: CustomRadioProps) {
  return (
    <div
      onClick={onChange}
      className={cn(
        "w-full p-4 border cursor-pointer transition-all duration-200",
        checked
          ? "border-[#232D35] bg-[#EFECE5]"
          : "border-[#D4C4A8] hover:border-[#BBA496]",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="pt-1">
          <div
            className={cn(
              "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
              checked ? "border-[#232D35]" : "border-[#BBA496]"
            )}
          >
            {checked && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#232D35]" />
            )}
          </div>
          <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="hidden"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-[14px] font-medium text-[#232D35] leading-[24px]">
                {label}
              </div>
              {description && (
                <div className="text-[14px] text-[#6B7B8A] mt-1 leading-[20px]">
                  {description}
                </div>
              )}
            </div>
            {rightContent && <div>{rightContent}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
