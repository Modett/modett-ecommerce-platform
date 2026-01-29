"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Dataset {
  label: string;
  data: number[];
  color: string;
}

interface DashboardChartProps {
  title: string;
  subtitle?: string;
  data?: Dataset[];
}

export function DashboardChart({ title, subtitle }: DashboardChartProps) {
  // Mock data for the visualization since we don't have a charting library connected yet
  const points = [
    50, 80, 45, 90, 110, 85, 130, 105, 150, 120, 160, 180, 140, 200,
  ];
  const max = Math.max(...points);
  const min = Math.min(...points);

  // Normalize points to SVG coordinates
  const width = 1000;
  const height = 300;
  const padding = 20;

  const getX = (index: number) =>
    (index / (points.length - 1)) * (width - 2 * padding) + padding;
  const getY = (value: number) =>
    height - ((value - min) / (max - min)) * (height - 2 * padding) - padding;

  const pathD =
    `M ${getX(0)} ${getY(points[0])} ` +
    points
      .slice(1)
      .map(
        (p, i) =>
          `C ${getX(i) + 50} ${getY(points[i])}, ${getX(i + 1) - 50} ${getY(
            p
          )}, ${getX(i + 1)} ${getY(p)}`
      )
      .join(" ");

  const fillPath = `${pathD} V ${height} H ${getX(0)} Z`;

  return (
    <Card className="border-[#BBA496]/30 bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle
              className="text-lg font-normal text-[#232D35]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {title}
            </CardTitle>
            {subtitle && (
              <p
                className="text-sm text-[#8B7355] mt-1"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {["1D", "1W", "1M", "3M", "1Y"].map((range) => (
              <button
                key={range}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  range === "1M"
                    ? "bg-[#232D35] text-white"
                    : "text-[#6B7280] hover:bg-[#F8F5F2]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative group">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#232D35" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#232D35" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area Fill */}
            <path d={fillPath} fill="url(#chartGradient)" />
            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#232D35"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Points (visible on hover) */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(p)}
                r="4"
                className="fill-[#232D35] stroke-white stroke-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />
            ))}
          </svg>

          {/* Tooltip hint */}
          <div className="absolute top-0 right-0 bg-[#232D35] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Revenue Trend
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
