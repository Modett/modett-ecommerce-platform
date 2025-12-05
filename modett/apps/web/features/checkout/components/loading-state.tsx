import { COMMON_CLASSES } from "@/features/cart/constants/styles";

import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading...",
  className,
}: LoadingStateProps) {
  return (
    <main
      className={cn(
        `w-full min-h-screen ${COMMON_CLASSES.pageBg} flex items-center justify-center`,
        className
      )}
    >
      <div className="animate-pulse text-lg">{message}</div>
    </main>
  );
}
