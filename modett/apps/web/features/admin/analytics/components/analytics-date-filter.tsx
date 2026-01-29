import type { AnalyticsFilters } from "../types/analytics.types";

interface AnalyticsDateFilterProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
}

export function AnalyticsDateFilter({
  filters,
  onFiltersChange,
}: AnalyticsDateFilterProps) {
  return (
    <div className="bg-white border border-[#BBA496]/30 rounded-xl p-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label
            className="block text-sm font-medium text-[#8B7355] mb-2"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate?.split("T")[0]}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                startDate: new Date(e.target.value).toISOString(),
              })
            }
            className="w-full px-4 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label
            className="block text-sm font-medium text-[#8B7355] mb-2"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate?.split("T")[0]}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                endDate: new Date(e.target.value).toISOString(),
              })
            }
            className="w-full px-4 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label
            className="block text-sm font-medium text-[#8B7355] mb-2"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Granularity
          </label>
          <select
            value={filters.granularity}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                granularity: e.target.value as "day" | "week" | "month",
              })
            }
            className="w-full px-4 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] bg-white text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  );
}
