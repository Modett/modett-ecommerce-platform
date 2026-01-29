"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/features/admin";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Timer,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const reports = [
  {
    id: "stock-level",
    title: "Stock Level Report",
    description: "Current inventory status across all products with color-coded indicators",
    icon: Package,
    href: "/admin/inventory-reports/stock-level",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    metrics: ["Total Products", "Stock Value", "Low Stock Alerts"],
  },
  {
    id: "stock-movement",
    title: "Stock Movement Report",
    description: "Track inventory changes over time with detailed transaction history",
    icon: TrendingUp,
    href: "/admin/inventory-reports/stock-movement",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    metrics: ["Transactions", "Inbound/Outbound", "Net Change"],
  },
  {
    id: "low-stock-forecast",
    title: "Low Stock Forecast",
    description: "Predict future stockouts based on sales trends with urgency levels",
    icon: AlertTriangle,
    href: "/admin/inventory-reports/low-stock-forecast",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    metrics: ["At Risk Items", "Days Until Stockout", "Reorder Recommendations"],
  },
  {
    id: "inventory-valuation",
    title: "Inventory Valuation",
    description: "Total value of current inventory with profit margin analysis",
    icon: DollarSign,
    href: "/admin/inventory-reports/valuation",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    metrics: ["Total Value", "Potential Revenue", "Profit Margins"],
  },
  {
    id: "slow-moving-stock",
    title: "Slow Moving Stock",
    description: "Identify products with low turnover rates and actionable recommendations",
    icon: Timer,
    href: "/admin/inventory-reports/slow-moving",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    metrics: ["Slow Items", "Days in Stock", "Recommended Actions"],
  },
];

export default function InventoryReportsPage() {
  return (
    <div className="space-y-6 max-w-[1600px]">
      <DashboardHeader
        title="Inventory Reports"
        subtitle="Comprehensive reporting for inventory management and analysis"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Link key={report.id} href={report.href} className="group">
            <Card className="border-[#BBA496]/30 bg-white hover:border-[#BBA496] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-[#232D35] mb-2 group-hover:text-[#8B7355] transition-colors">
                      {report.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-[#9CA3AF]">
                      {report.description}
                    </CardDescription>
                  </div>
                  <div className={cn("p-3 rounded-lg shrink-0", report.iconBg)}>
                    <report.icon className={cn("w-6 h-6", report.iconColor)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="border-t border-[#BBA496]/20 pt-4">
                    <p className="text-xs font-medium text-[#8B7355] mb-2 uppercase tracking-wider">
                      Key Metrics
                    </p>
                    <ul className="space-y-1.5">
                      {report.metrics.map((metric, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-[#232D35]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#BBA496]" />
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-[#8B7355] group-hover:text-[#232D35] transition-colors">
                      View Report
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#8B7355] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Info Section */}
      <Card className="border-[#BBA496]/30 bg-[#F8F5F2]/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#232D35]">
            About Inventory Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-[#8B7355] mb-2">Purpose</h4>
              <p className="text-sm text-[#9CA3AF]">
                These reports provide comprehensive insights into your inventory health, movement patterns,
                and value. Use them to make informed decisions about purchasing, pricing, and stock management.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#8B7355] mb-2">Best Practices</h4>
              <ul className="space-y-1 text-sm text-[#9CA3AF]">
                <li>• Review stock level reports daily for critical alerts</li>
                <li>• Check low stock forecast weekly for proactive ordering</li>
                <li>• Analyze slow-moving stock monthly to optimize inventory</li>
                <li>• Monitor valuation reports for financial planning</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
