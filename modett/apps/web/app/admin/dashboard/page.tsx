"use client";

import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, Package, ShoppingBag } from "lucide-react";
import axios from "axios";
import {
  StatCard,
  AlertCard,
  ActivityCard,
  QuickStats,
} from "@/features/admin/components";
import { DashboardHeader } from "@/features/admin/components/dashboard-header";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DashboardSummary {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomersToday: number;
}

interface StockAlertItem {
  variantId: string;
  productTitle: string;
  sku: string;
  onHand: number;
  threshold: number;
}

interface ActivityItem {
  id: string;
  type: "order" | "user";
  description: string;
  timestamp: string;
  referenceId?: string;
}

interface DashboardAlerts {
  lowStock: StockAlertItem[];
  pendingOrders: number;
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function DashboardPage() {
  // Fetch Summary Stats with refetch interval
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/admin/dashboard/summary");
      return data.data as DashboardSummary;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch Alerts with refetch interval
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/admin/dashboard/alerts");
      return data.data as DashboardAlerts;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch Activity with refetch interval
  const { data: activity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/admin/dashboard/activity");
      return data.data as ActivityItem[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const isLoading = isLoadingSummary || isLoadingAlerts || isLoadingActivity;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header Section */}
      <DashboardHeader />

      {/* Today's Sales Summary - 3 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(summary?.revenue || 0)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          trend={{
            value: "+12.5%",
            isPositive: true,
            label: "from yesterday",
          }}
        />
        <StatCard
          title="Number of Orders"
          value={summary?.orders.toString() || "0"}
          icon={<ShoppingBag className="w-5 h-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={{
            value: "+8.2%",
            isPositive: true,
            label: "from yesterday",
          }}
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(summary?.averageOrderValue || 0)}
          icon={<Package className="w-5 h-5" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          trend={{
            value: "-2.1%",
            isPositive: false,
            label: "from yesterday",
          }}
        />
      </div>

      {/* Alerts & Recent Activity - 2 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertCard
          pendingOrders={alerts?.pendingOrders || 0}
          lowStockItems={alerts?.lowStock || []}
        />
        <ActivityCard activities={activity || []} />
      </div>

      {/* Quick Stats Section */}
      <QuickStats
        totalCustomers={summary?.totalCustomers?.toLocaleString() || "0"}
        conversionRate="3.24%" // Hardcoded for now until analytics module is ready
        lowStockCount={alerts?.lowStock?.length || 0}
        pendingActionsCount={alerts?.pendingOrders || 0}
        newCustomersCount={summary?.newCustomersToday || 0}
      />
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-[1400px] animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-[#BBA496]/20 rounded" />
          <div className="h-4 w-96 bg-[#BBA496]/20 rounded mt-2" />
        </div>
        <div className="h-10 w-32 bg-[#BBA496]/20 rounded" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border border-[#BBA496]/30 rounded-xl p-6 bg-white"
          >
            <div className="h-4 w-32 bg-[#BBA496]/20 rounded mb-4" />
            <div className="h-8 w-40 bg-[#BBA496]/20 rounded mb-4" />
            <div className="h-3 w-28 bg-[#BBA496]/20 rounded" />
          </div>
        ))}
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border border-[#BBA496]/30 rounded-xl bg-white"
          >
            <div className="p-6 border-b border-[#BBA496]/20">
              <div className="h-6 w-48 bg-[#BBA496]/20 rounded" />
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-[#BBA496]/20 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats skeleton */}
      <div className="border border-[#BBA496]/30 rounded-xl bg-white">
        <div className="p-6 border-b border-[#BBA496]/20">
          <div className="h-6 w-32 bg-[#BBA496]/20 rounded" />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[#BBA496]/20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
