"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader, StatCard, ReportStatusBadge, getLowStockForecast } from "@/features/admin";
import { AlertTriangle, Clock, Package, RefreshCw, Download } from "lucide-react";
import { format } from "date-fns";

export default function LowStockForecastPage() {
  const [forecastDays, setForecastDays] = useState(30);
  const [search, setSearch] = useState("");

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["low-stock-forecast", forecastDays],
    queryFn: () => getLowStockForecast(forecastDays),
    placeholderData: (previousData) => previousData,
  });

  const report = reportData?.data;

  const filteredItems = report?.items?.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      item.productTitle.toLowerCase().includes(searchLower) ||
      item.sku.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleExport = () => {
    if (!report) return;
    const headers = ["Product", "SKU", "Location", "Current Stock", "Avg Daily Sales", "Days Until Stockout", "Recommended Order", "Urgency"];
    const rows = filteredItems.map(item => [
      item.productTitle,
      item.sku,
      item.locationName,
      item.currentStock,
      item.averageDailySales.toFixed(2),
      item.daysUntilStockout,
      item.recommendedOrderQuantity,
      item.urgency,
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `low-stock-forecast-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <DashboardHeader
        title="Low Stock Forecast"
        subtitle="Predict future stockouts based on sales trends with urgency levels"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Immediate Action"
          value={report?.summary.immediateActionRequired.toString() || "0"}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title="Urgent"
          value={report?.summary.urgentCount.toString() || "0"}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Soon"
          value={report?.summary.soonCount.toString() || "0"}
          icon={<Clock className="w-5 h-5" />}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Monitor"
          value={report?.summary.monitorCount.toString() || "0"}
          icon={<Package className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      <Card className="border-[#BBA496]/30">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm text-[#8B7355] mb-2 block">Forecast Period (days)</label>
              <Input
                type="number"
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value))}
                min={7}
                max={90}
              />
            </div>
            <div>
              <label className="text-sm text-[#8B7355] mb-2 block">Search</label>
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2 col-span-2">
              <Button variant="outline" onClick={() => refetch()} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleExport} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#BBA496]/30">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-[#9CA3AF]">
              <div className="animate-spin w-8 h-8 border-4 border-[#BBA496] border-t-transparent rounded-full mx-auto mb-4" />
              Loading forecast...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-[#9CA3AF]">
              No items at risk of stockout in the forecast period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F5F2] border-b border-[#BBA496]/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Avg Daily Sales</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Days Left</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Stockout Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Reorder Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Urgency</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#BBA496]/10">
                  {filteredItems.map((item) => (
                    <tr key={`${item.variantId}-${item.locationId}`} className="hover:bg-[#F8F5F2]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#232D35]">
                        {item.productTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9CA3AF]">{item.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232D35]">{item.locationName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#232D35]">
                        {item.currentStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#9CA3AF]">
                        {item.averageDailySales.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[#232D35]">
                        {item.daysUntilStockout}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232D35]">
                        {item.estimatedStockoutDate
                          ? format(new Date(item.estimatedStockoutDate), "MMM dd, yyyy")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#232D35]">
                        {item.recommendedOrderQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ReportStatusBadge status={item.urgency} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {report && (
        <div className="text-center text-xs text-[#9CA3AF]">
          Forecast period: {report.forecastPeriod} days • Generated at {format(new Date(report.generatedAt), "PPpp")}
        </div>
      )}
    </div>
  );
}
