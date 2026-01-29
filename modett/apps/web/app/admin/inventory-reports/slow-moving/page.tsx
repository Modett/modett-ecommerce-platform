"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardHeader, StatCard, ReportStatusBadge, getSlowMovingStock } from "@/features/admin";
import { Timer, DollarSign, Package, RefreshCw, Download } from "lucide-react";
import { format } from "date-fns";

export default function SlowMovingStockPage() {
  const [filters, setFilters] = useState({
    minimumDaysInStock: 90,
    minimumValue: 0,
    search: "",
  });

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["slow-moving-stock", filters.minimumDaysInStock, filters.minimumValue],
    queryFn: () => getSlowMovingStock(filters.minimumDaysInStock, filters.minimumValue),
    placeholderData: (previousData) => previousData,
  });

  const report = reportData?.data;

  const filteredItems = report?.items?.filter(item => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      item.productTitle.toLowerCase().includes(searchLower) ||
      item.sku.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleExport = () => {
    if (!report) return;
    const headers = ["Product", "SKU", "Location", "On Hand", "Days in Stock", "Last Sold", "Total Sales", "Turnover Rate", "Value", "Recommendation"];
    const rows = filteredItems.map(item => [
      item.productTitle,
      item.sku,
      item.locationName,
      item.onHand,
      item.daysInStock,
      item.lastSoldDate ? format(new Date(item.lastSoldDate), "yyyy-MM-dd") : "Never",
      item.totalSales,
      item.turnoverRate.toFixed(4),
      `$${item.inventoryValue.toFixed(2)}`,
      item.recommendation,
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slow-moving-stock-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <DashboardHeader
        title="Slow Moving Stock"
        subtitle="Identify products with low turnover rates and actionable recommendations"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Slow Moving"
          value={report?.items.length.toString() || "0"}
          icon={<Package className="w-5 h-5" />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Total Value"
          value={`$${report?.summary.totalSlowMovingValue.toLocaleString() || "0"}`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          title="Total Units"
          value={report?.summary.totalSlowMovingUnits.toString() || "0"}
          icon={<Package className="w-5 h-5" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Avg Days in Stock"
          value={report?.summary.averageDaysInStock.toFixed(0) || "0"}
          icon={<Timer className="w-5 h-5" />}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
        />
      </div>

      {/* Recommended Actions Summary */}
      {report && (
        <Card className="border-[#BBA496]/30">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-[#232D35] mb-4">Recommended Actions</h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-900">Discount</p>
                <p className="text-2xl font-semibold text-purple-700 mt-2">
                  {report.summary.recommendedActions.discount}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Promote</p>
                <p className="text-2xl font-semibold text-blue-700 mt-2">
                  {report.summary.recommendedActions.promote}
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm font-medium text-indigo-900">Bundle</p>
                <p className="text-2xl font-semibold text-indigo-700 mt-2">
                  {report.summary.recommendedActions.bundle}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-900">Clearance</p>
                <p className="text-2xl font-semibold text-red-700 mt-2">
                  {report.summary.recommendedActions.clearance}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#BBA496]/30">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label className="text-sm text-[#8B7355] mb-2">Min Days in Stock</Label>
              <Input
                type="number"
                value={filters.minimumDaysInStock}
                onChange={(e) => setFilters({ ...filters, minimumDaysInStock: Number(e.target.value) })}
                min={30}
              />
            </div>
            <div>
              <Label className="text-sm text-[#8B7355] mb-2">Min Value ($)</Label>
              <Input
                type="number"
                value={filters.minimumValue}
                onChange={(e) => setFilters({ ...filters, minimumValue: Number(e.target.value) })}
                min={0}
              />
            </div>
            <div>
              <Label className="text-sm text-[#8B7355] mb-2">Search</Label>
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
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
              Loading report...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-[#9CA3AF]">
              No slow-moving stock found with current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F5F2] border-b border-[#BBA496]/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">On Hand</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Days in Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Last Sold</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Sales</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Turnover</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Action</th>
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
                        {item.onHand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#232D35]">
                        {item.daysInStock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9CA3AF]">
                        {item.lastSoldDate ? format(new Date(item.lastSoldDate), "MMM dd, yyyy") : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#9CA3AF]">
                        {item.totalSales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#9CA3AF]">
                        {item.turnoverRate.toFixed(3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[#232D35]">
                        ${item.inventoryValue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ReportStatusBadge status={item.recommendation} />
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
          Minimum days: {report.filters.minimumDaysInStock} • Generated at {format(new Date(report.generatedAt), "PPpp")}
        </div>
      )}
    </div>
  );
}
