"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardHeader, StatCard } from "@/features/admin/components";
import { getInventoryValuation } from "@/features/admin/api/inventory.api";
import { DollarSign, TrendingUp, Package, RefreshCw, Download } from "lucide-react";
import { format } from "date-fns";

export default function InventoryValuationPage() {
  const [search, setSearch] = useState("");

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["inventory-valuation"],
    queryFn: () => getInventoryValuation(),
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
    const headers = ["Product", "SKU", "Location", "On Hand", "Cost/Unit", "Total Cost", "Selling Price", "Potential Revenue", "Potential Profit", "Margin %"];
    const rows = filteredItems.map(item => [
      item.productTitle,
      item.sku,
      item.locationName,
      item.onHand,
      `$${item.costPerUnit.toFixed(2)}`,
      `$${item.totalCost.toFixed(2)}`,
      `$${item.averageSellingPrice.toFixed(2)}`,
      `$${item.potentialRevenue.toFixed(2)}`,
      `$${item.potentialProfit.toFixed(2)}`,
      `${item.profitMargin.toFixed(1)}%`,
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-valuation-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <DashboardHeader
        title="Inventory Valuation"
        subtitle="Total value of current inventory with profit margin analysis"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory Value"
          value={`$${report?.summary.totalInventoryValue.toLocaleString() || "0"}`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Potential Revenue"
          value={`$${report?.summary.totalPotentialRevenue.toLocaleString() || "0"}`}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Potential Profit"
          value={`$${report?.summary.totalPotentialProfit.toLocaleString() || "0"}`}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Avg Profit Margin"
          value={`${report?.summary.averageProfitMargin.toFixed(1) || "0"}%`}
          icon={<Package className="w-5 h-5" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* By Location Summary */}
      {report && report.byLocation.length > 0 && (
        <Card className="border-[#BBA496]/30">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-[#232D35] mb-4">Valuation by Location</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {report.byLocation.map((location) => (
                <div key={location.locationId} className="p-4 bg-[#F8F5F2] rounded-lg">
                  <p className="text-sm font-medium text-[#232D35]">{location.locationName}</p>
                  <p className="text-2xl font-semibold text-[#8B7355] mt-2">
                    ${location.totalValue.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{location.itemCount} items</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#BBA496]/30">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 col-span-2">
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
              Loading valuation...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-[#9CA3AF]">
              No items found.
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
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Cost/Unit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Potential Revenue</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Profit Margin</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#9CA3AF]">
                        ${item.costPerUnit.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[#232D35]">
                        ${item.totalCost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#232D35]">
                        ${item.potentialRevenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-medium ${item.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.profitMargin.toFixed(1)}%
                        </span>
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
          Total Units: {report.summary.totalUnitsInStock.toLocaleString()} • Generated at {format(new Date(report.generatedAt), "PPpp")}
        </div>
      )}
    </div>
  );
}
