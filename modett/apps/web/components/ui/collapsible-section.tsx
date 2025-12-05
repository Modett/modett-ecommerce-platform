import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LabelText } from "@/components/ui/label-text";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  className,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border-b border-[#D4C4A8] py-6", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full mb-4 group"
      >
        <LabelText className="group-hover:opacity-80 transition-opacity">
          {title}
        </LabelText>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#765C4D]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#765C4D]" />
        )}
      </button>
      {isOpen && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
