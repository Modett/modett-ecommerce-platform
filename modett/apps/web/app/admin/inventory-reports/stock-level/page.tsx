"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DashboardHeader,
  StatCard,
  ReportStatusBadge,
  getStockLevelReport,
  getLocations,
} from "@/features/admin";
import { Package, DollarSign, AlertTriangle, RefreshCw, Download, Search } from "lucide-react";
import { format } from "date-fns";

export default function StockLevelReportPage() {
  const [filters, setFilters] = useState<{
    locationId?: string;
    status?: 'healthy' | 'low' | 'critical' | 'out_of_stock';
    search?: string;
  }>({});

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["stock-level-report", filters],
    queryFn: () => getStockLevelReport(filters),
    placeholderData: (previousData) => previousData,
  });

  const { data: locationsData } = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
  });

  const report = reportData?.data;
  const locations = locationsData?.data?.locations || [];

  // Filter items by search term
  const filteredItems = report?.items?.filter(item => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      item.productTitle.toLowerCase().includes(searchLower) ||
      item.sku.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    if (!report) return;

    // Create CSV content
    const headers = ["Product", "SKU", "Location", "On Hand", "Reserved", "Available", "Status", "Value"];
    const rows = filteredItems.map(item => [
      item.productTitle,
      item.sku,
      item.locationName,
      item.onHand,
      item.reserved,
      item.available,
      item.status,
      `$${item.totalValue.toFixed(2)}`,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-level-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <DashboardHeader
        title="Stock Level Report"
        subtitle="Current inventory status across all products"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={report?.summary.totalProducts.toString() || "0"}
          icon={<Package className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Total Value"
          value={`$${report?.summary.totalValue.toLocaleString() || "0"}`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Low Stock"
          value={report?.summary.lowStockCount.toString() || "0"}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Critical/Out"
          value={(
            (report?.summary.criticalCount || 0) +
            (report?.summary.outOfStockCount || 0)
          ).toString()}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Filters */}
      <Card className="border-[#BBA496]/30">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#8B7355]" />
              <Input
                placeholder="Search products..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex-1"
              />
            </div>

            <Select
              value={filters.locationId || "all"}
              onValueChange={(value) => setFilters({ ...filters, locationId: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.locationId} value={location.locationId}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) => setFilters({ ...filters, status: value === "all" ? undefined : value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} className="flex-1">
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

      {/* Stock Level Table */}
      <Card className="border-[#BBA496]/30">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-[#9CA3AF]">
              <div className="animate-spin w-8 h-8 border-4 border-[#BBA496] border-t-transparent rounded-full mx-auto mb-4" />
              Loading report...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-[#9CA3AF]">
              No items found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F5F2] border-b border-[#BBA496]/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                      On Hand
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                      Reserved
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#BBA496]/10">
                  {filteredItems.map((item, index) => (
                    <tr
                      key={`${item.variantId}-${item.locationId}`}
                      className="hover:bg-[#F8F5F2]/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#232D35]">
                          {item.productTitle}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#9CA3AF]">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#232D35]">{item.locationName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-[#232D35]">{item.onHand}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-[#9CA3AF]">{item.reserved}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-medium text-[#232D35]">
                          {item.available}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ReportStatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-[#232D35]">
                          ${item.totalValue.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated At Footer */}
      {report && (
        <div className="text-center text-xs text-[#9CA3AF]">
          Report generated at {format(new Date(report.generatedAt), "PPpp")}
        </div>
      )}
    </div>
  );
}
