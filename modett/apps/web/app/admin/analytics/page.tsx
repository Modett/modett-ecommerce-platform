"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DashboardHeader,
  AnalyticsSummaryCard,
  AnalyticsChartCard,
  AnalyticsDateFilter,
  SalesTrendItem,
  CustomerGrowthItem,
  BestSellingProductItem,
  OrderStatusProgressBar,
} from "@/features/admin";
import { getAnalytics } from "@/features/admin";
import type { AnalyticsFilters } from "@/features/admin";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    granularity: "day",
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics", filters],
    queryFn: () => getAnalytics(filters),
    placeholderData: (previousData) => previousData,
  });

  const analytics = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <DashboardHeader
          title="Analytics"
          subtitle="Comprehensive business insights"
        />
        <div className="animate-pulse">
          <div className="h-64 bg-[#BBA496]/20 rounded-xl mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="h-64 bg-[#BBA496]/20 rounded-xl" />
            <div className="h-64 bg-[#BBA496]/20 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <DashboardHeader
        title="Analytics"
        subtitle="Comprehensive business insights and performance metrics"
      />

      {/* Date Range & Granularity Filter */}
      <AnalyticsDateFilter filters={filters} onFiltersChange={setFilters} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsSummaryCard
          title="Total Revenue"
          value={formatCurrency(analytics?.totalRevenue || 0)}
          color="green"
        />
        <AnalyticsSummaryCard
          title="Total Orders"
          value={(analytics?.totalOrders || 0).toString()}
          color="blue"
        />
        <AnalyticsSummaryCard
          title="Average Order Value"
          value={formatCurrency(analytics?.averageOrderValue || 0)}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trends Chart */}
        <AnalyticsChartCard
          title="Sales Trends"
          emptyMessage="No sales data available for this period"
        >
          {analytics?.salesTrends && analytics.salesTrends.length > 0
            ? analytics.salesTrends.map((item, index) => (
                <SalesTrendItem
                  key={index}
                  date={item.date}
                  revenue={item.revenue}
                  orders={item.orders}
                />
              ))
            : null}
        </AnalyticsChartCard>

        {/* Customer Growth Chart */}
        <AnalyticsChartCard
          title="Customer Growth"
          emptyMessage="No customer growth data available"
        >
          {analytics?.customerGrowth && analytics.customerGrowth.length > 0
            ? analytics.customerGrowth.map((item, index) => (
                <CustomerGrowthItem
                  key={index}
                  date={item.date}
                  newCustomers={item.newCustomers}
                  totalCustomers={item.totalCustomers}
                />
              ))
            : null}
        </AnalyticsChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <AnalyticsChartCard
          title="Top Selling Products"
          emptyMessage="No product sales data available"
        >
          {analytics?.bestSellingProducts &&
          analytics.bestSellingProducts.length > 0
            ? analytics.bestSellingProducts.map((product, index) => (
                <BestSellingProductItem
                  key={product.variantId}
                  rank={index + 1}
                  productTitle={product.productTitle}
                  sku={product.sku}
                  unitsSold={product.unitsSold}
                  revenue={product.revenue}
                />
              ))
            : null}
        </AnalyticsChartCard>

        {/* Order Status Breakdown */}
        <AnalyticsChartCard
          title="Order Status Distribution"
          emptyMessage="No order status data available"
        >
          {analytics?.orderStatusBreakdown &&
          analytics.orderStatusBreakdown.length > 0
            ? analytics.orderStatusBreakdown.map((status) => (
                <OrderStatusProgressBar
                  key={status.status}
                  status={status.status}
                  count={status.count}
                  percentage={status.percentage}
                />
              ))
            : null}
        </AnalyticsChartCard>
      </div>
    </div>
  );
}
