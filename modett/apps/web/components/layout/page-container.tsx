import { RESPONSIVE } from "@/features/cart/constants/styles";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[1440px] mx-auto",
        RESPONSIVE.padding.page,
        className
      )}
    >
      {children}
    </div>
  );
}
