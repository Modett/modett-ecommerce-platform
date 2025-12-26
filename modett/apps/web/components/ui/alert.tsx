import { Info, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertProps {
  variant?: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const variantStyles = {
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-800",
    icon: "text-blue-600",
    IconComponent: Info,
  },
  success: {
    container: "bg-green-50 border-green-200 text-green-800",
    icon: "text-green-600",
    IconComponent: CheckCircle2,
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-800",
    icon: "text-yellow-600",
    IconComponent: AlertCircle,
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-800",
    icon: "text-red-600",
    IconComponent: XCircle,
  },
};

export function Alert({
  variant = "info",
  children,
  className,
  onClose,
}: AlertProps) {
  const styles = variantStyles[variant];
  const Icon = styles.IconComponent;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border rounded-lg",
        styles.container,
        className
      )}
      role="alert"
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", styles.icon)} />
      <div className="flex-1 text-sm leading-relaxed">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close alert"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
