"use client";

import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import axios from "axios";

// Define strict types matching backend
interface DashboardSummary {
  revenue: number;
  orders: number;
  averageOrderValue: number;
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

export default function DashboardPage() {
  // 1. Fetch Summary Stats
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/admin/dashboard/summary");
      return data.data as DashboardSummary;
    },
  });

  // 2. Fetch Alerts
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/admin/dashboard/alerts");
      return data.data as DashboardAlerts;
    },
  });

  // 3. Fetch Activity
  const { data: activity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => {
      const { data } = await axios.get("/api/v1/admin/dashboard/activity");
      return data.data as ActivityItem[];
    },
  });

  if (isLoadingSummary || isLoadingAlerts || isLoadingActivity) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Today's Revenue"
          value={formatCurrency(summary?.revenue || 0)}
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          trend="+12% from yesterday"
        />
        <StatsCard
          title="Orders Today"
          value={summary?.orders.toString() || "0"}
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          trend="+8% from yesterday"
        />
        <StatsCard
          title="Avg. Order Value"
          value={formatCurrency(summary?.averageOrderValue || 0)}
          icon={<Package className="w-6 h-6 text-purple-600" />}
          trend="-2% from yesterday"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Action Needed / Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Attention Needed</h2>
            {alerts && alerts.pendingOrders > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-medium">
                {alerts.pendingOrders} Pending Orders
              </span>
            )}
          </div>
          <div className="p-6 space-y-4">
            {alerts?.pendingOrders ? (
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    {alerts.pendingOrders} orders need processing
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Review and fulfill these orders to avoid delays.
                  </p>
                </div>
                <button className="ml-auto text-sm font-medium text-amber-700 hover:text-amber-800">
                  View
                </button>
              </div>
            ) : null}

            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mt-6 mb-3">
              Low Stock Alerts
            </h3>
            <div className="space-y-3">
              {alerts?.lowStock.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.productTitle}
                      </p>
                      <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-red-600">
                      {item.onHand} left
                    </p>
                    <p className="text-xs text-gray-400">
                      Threshold: {item.threshold}
                    </p>
                  </div>
                </div>
              ))}
              {(!alerts?.lowStock || alerts.lowStock.length === 0) && (
                <p className="text-sm text-gray-500 italic">
                  No low stock items.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {activity?.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    item.type === "order"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {item.type === "order" ? (
                    <ShoppingBag className="w-4 h-4" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{item.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
              </div>
            ))}
            {(!activity || activity.length === 0) && (
              <div className="p-6 text-center text-sm text-gray-500 italic">
                No recent activity.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      {trend && (
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          {trend.includes("+") ? (
            <span className="text-green-600 font-medium">
              {trend.split(" ")[0]}
            </span>
          ) : (
            <span className="text-red-600 font-medium">
              {trend.split(" ")[0]}
            </span>
          )}
          <span className="text-gray-400">
            {trend.split(" ").slice(1).join(" ")}
          </span>
        </p>
      )}
    </div>
  );
}
