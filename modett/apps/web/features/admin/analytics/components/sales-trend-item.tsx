import { formatCurrency } from "@/lib/utils";

interface SalesTrendItemProps {
  date: string;
  revenue: number;
  orders: number;
}

export function SalesTrendItem({ date, revenue, orders }: SalesTrendItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#8B7355]">{date}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-green-600">
          {formatCurrency(revenue)}
        </span>
        <span className="text-sm text-[#8B7355]">{orders} orders</span>
      </div>
    </div>
  );
}
