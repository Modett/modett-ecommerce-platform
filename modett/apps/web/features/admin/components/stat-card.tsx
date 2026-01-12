import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
}

export function StatCard({
  title,
  value,
  icon,
  iconBg = "bg-[#F8F5F2]",
  iconColor = "text-[#8B7355]",
  trend,
}: StatCardProps) {
  return (
    <Card className="border-[#BBA496]/30 bg-white hover:border-[#BBA496] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p
              className="text-xs font-medium text-[#8B7355] mb-2 uppercase tracking-wider"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {title}
            </p>
            <h3
              className="text-3xl font-normal text-[#232D35]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {value}
            </h3>
          </div>
          <div className={`p-3 rounded-lg ${iconBg} shrink-0`}>
            <div className={iconColor}>{icon}</div>
          </div>
        </div>

        {trend && (
          <div className="flex items-center gap-2">
            {trend.isPositive ? (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span
                  className="text-sm font-semibold"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {trend.value}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <TrendingDown className="w-4 h-4" />
                <span
                  className="text-sm font-semibold"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {trend.value}
                </span>
              </div>
            )}
            <span
              className="text-xs text-[#9CA3AF]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
