import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

interface LabelTextProps {
  children: React.ReactNode;
  className?: string;
}

export function LabelText({ children, className }: LabelTextProps) {
  return (
    <Text.Accent
      className={cn(
        "text-[12px] font-medium uppercase tracking-[2px]",
        className
      )}
    >
      {children}
    </Text.Accent>
  );
}
