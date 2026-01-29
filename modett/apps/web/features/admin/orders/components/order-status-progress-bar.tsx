interface OrderStatusProgressBarProps {
  status: string;
  count: number;
  percentage: number;
}

export function OrderStatusProgressBar({
  status,
  count,
  percentage,
}: OrderStatusProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span
          className="text-sm font-medium text-[#232D35] capitalize"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          {status.replace(/_/g, " ")}
        </span>
        <span className="text-sm text-[#8B7355]">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-[#F8F5F2] rounded-full h-2">
        <div
          className="bg-[#BBA496] h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
