"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardHeader, StatCard, getStockMovementReport } from "@/features/admin";
import { TrendingUp, TrendingDown, Activity, RefreshCw, Download, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { format, subDays } from "date-fns";

export default function StockMovementReportPage() {
  const [filters, setFilters] = useState<{
    startDate: string;
    endDate: string;
    search?: string;
  }>({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ["stock-movement-report", filters],
    queryFn: () => getStockMovementReport(
      `${filters.startDate}T00:00:00Z`,
      `${filters.endDate}T23:59:59Z`
    ),
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
    const headers = ["Date", "Product", "SKU", "Location", "Qty Change", "Reason", "Running Balance"];
    const rows = filteredItems.map(item => [
      format(new Date(item.createdAt), "yyyy-MM-dd HH:mm:ss"),
      item.productTitle,
      item.sku,
      item.locationName,
      item.qtyDelta,
      item.reason,
      item.runningBalance,
    ]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-movement-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      <DashboardHeader
        title="Stock Movement Report"
        subtitle="Track inventory changes over time with detailed transaction history"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={report?.summary.totalTransactions.toString() || "0"}
          icon={<Activity className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Inbound"
          value={report?.summary.totalInbound.toString() || "0"}
          icon={<ArrowDownCircle className="w-5 h-5" />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Outbound"
          value={report?.summary.totalOutbound.toString() || "0"}
          icon={<ArrowUpCircle className="w-5 h-5" />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Net Change"
          value={report?.summary.netChange.toString() || "0"}
          icon={report && report.summary.netChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          iconBg={report && report.summary.netChange >= 0 ? "bg-emerald-50" : "bg-red-50"}
          iconColor={report && report.summary.netChange >= 0 ? "text-emerald-600" : "text-red-600"}
        />
      </div>

      <Card className="border-[#BBA496]/30">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label className="text-sm text-[#8B7355] mb-2">Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm text-[#8B7355] mb-2">End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-sm text-[#8B7355] mb-2">Search</Label>
              <Input
                placeholder="Search products..."
                value={filters.search || ""}
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
              No transactions found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F5F2] border-b border-[#BBA496]/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Qty Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[#8B7355] uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#BBA496]/10">
                  {filteredItems.map((item) => (
                    <tr key={item.transactionId} className="hover:bg-[#F8F5F2]/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232D35]">
                        {format(new Date(item.createdAt), "MMM dd, HH:mm")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#232D35]">
                        {item.productTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#9CA3AF]">{item.sku}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232D35]">{item.locationName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-medium ${item.qtyDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.qtyDelta > 0 ? '+' : ''}{item.qtyDelta}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232D35] capitalize">{item.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-[#232D35]">
                        {item.runningBalance}
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
          Report generated at {format(new Date(report.generatedAt), "PPpp")}
        </div>
      )}
    </div>
  );
}
