import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickStatItemProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function QuickStatItem({
  label,
  value,
  change,
  isPositive,
}: QuickStatItemProps) {
  return (
    <div className="text-center p-4 bg-[#F8F5F2] rounded-lg border border-[#BBA496]/30 hover:border-[#BBA496] transition-colors">
      <p
        className="text-xs font-medium text-[#8B7355] uppercase tracking-wider mb-2"
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-normal text-[#232D35] mb-1"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {value}
      </p>
      <p
        className={`text-xs font-medium ${
          isPositive ? "text-green-600" : "text-amber-600"
        }`}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {change}
      </p>
    </div>
  );
}

interface QuickStatsProps {
  totalCustomers?: string;
  conversionRate?: string;
  lowStockCount?: number;
  pendingActionsCount?: number;
}

export function QuickStats({
  totalCustomers = "2,847",
  conversionRate = "3.24%",
  lowStockCount = 0,
  pendingActionsCount = 0,
}: QuickStatsProps) {
  return (
    <Card className="border-[#BBA496]/30">
      <CardHeader className="border-b border-[#BBA496]/20 bg-white">
        <CardTitle
          className="text-lg font-medium text-[#232D35]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Quick Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <QuickStatItem
            label="Total Customers"
            value={totalCustomers}
            change="+156 this week"
            isPositive={true}
          />
          <QuickStatItem
            label="Conversion Rate"
            value={conversionRate}
            change="+0.5% from last week"
            isPositive={true}
          />
          <QuickStatItem
            label="Low Stock Items"
            value={lowStockCount.toString()}
            change={lowStockCount > 0 ? "Needs attention" : "All stocked"}
            isPositive={lowStockCount === 0}
          />
          <QuickStatItem
            label="Pending Actions"
            value={pendingActionsCount.toString()}
            change={
              pendingActionsCount > 0 ? "Orders to process" : "All caught up"
            }
            isPositive={pendingActionsCount === 0}
          />
        </div>
      </CardContent>
    </Card>
  );
}
