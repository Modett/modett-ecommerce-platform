import { ReactNode } from "react";

interface AnalyticsChartCardProps {
  title: string;
  children: ReactNode;
  emptyMessage?: string;
}

export function AnalyticsChartCard({
  title,
  children,
  emptyMessage = "No data available for this period",
}: AnalyticsChartCardProps) {
  return (
    <div className="bg-white border border-[#BBA496]/30 rounded-xl p-6">
      <h3
        className="text-lg font-semibold text-[#232D35] mb-4"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {title}
      </h3>
      <div className="space-y-3">
        {children || (
          <div className="text-center text-[#8B7355] py-8">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
