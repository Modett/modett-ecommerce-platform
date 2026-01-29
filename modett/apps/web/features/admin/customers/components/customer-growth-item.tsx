interface CustomerGrowthItemProps {
  date: string;
  newCustomers: number;
  totalCustomers: number;
}

export function CustomerGrowthItem({
  date,
  newCustomers,
  totalCustomers,
}: CustomerGrowthItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#8B7355]">{date}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-blue-600">
          +{newCustomers} new
        </span>
        <span className="text-sm text-[#8B7355]">Total: {totalCustomers}</span>
      </div>
    </div>
  );
}
