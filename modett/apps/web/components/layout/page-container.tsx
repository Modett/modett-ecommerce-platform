import { COMMON_CLASSES, RESPONSIVE } from "@/features/cart/constants/styles";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "1280px" | "1440px";
  fullHeight?: boolean;
  noPadding?: boolean;
  withBackground?: boolean;
  asMain?: boolean;
}

export function PageContainer({
  children,
  className = "",
  maxWidth = "1440px",
  fullHeight = false,
  noPadding = false,
  withBackground = false,
  asMain = false,
}: PageContainerProps) {
  const containerClasses = cn(
    "w-full mx-auto",
    `max-w-[${maxWidth}]`,
    !noPadding && RESPONSIVE.padding.page,
    className
  );

  const wrapperClasses = cn(
    "w-full",
    fullHeight && "min-h-screen",
    withBackground && COMMON_CLASSES.pageBg
  );

  const content = <div className={containerClasses}>{children}</div>;

  if (asMain) {
    return <main className={wrapperClasses}>{content}</main>;
  }

  return withBackground || fullHeight ? (
    <div className={wrapperClasses}>{content}</div>
  ) : (
    content
  );
}
