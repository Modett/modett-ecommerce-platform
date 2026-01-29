"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReportStatusBadgeProps {
  status: 'healthy' | 'low' | 'critical' | 'out_of_stock' | 'immediate' | 'urgent' | 'soon' | 'monitor' | 'discount' | 'promote' | 'bundle' | 'clearance';
  className?: string;
}

const statusConfig = {
  // Stock Level statuses
  healthy: {
    label: 'Healthy',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  low: {
    label: 'Low Stock',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  critical: {
    label: 'Critical',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  out_of_stock: {
    label: 'Out of Stock',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  // Forecast urgency
  immediate: {
    label: 'Immediate',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  urgent: {
    label: 'Urgent',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  soon: {
    label: 'Soon',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  monitor: {
    label: 'Monitor',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  // Slow moving recommendations
  discount: {
    label: 'Discount',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  promote: {
    label: 'Promote',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  bundle: {
    label: 'Bundle',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  clearance: {
    label: 'Clearance',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function ReportStatusBadge({ status, className }: ReportStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium text-xs px-2 py-1",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
