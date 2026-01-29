import { formatCurrency } from "@/lib/utils";

interface BestSellingProductItemProps {
  rank: number;
  productTitle: string;
  sku: string;
  unitsSold: number;
  revenue: number;
}

export function BestSellingProductItem({
  rank,
  productTitle,
  sku,
  unitsSold,
  revenue,
}: BestSellingProductItemProps) {
  return (
    <div className="flex items-start justify-between p-3 bg-[#F8F5F2] rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-white bg-[#BBA496] rounded-full w-6 h-6 flex items-center justify-center">
            {rank}
          </span>
          <span
            className="font-medium text-[#232D35] text-sm"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            {productTitle}
          </span>
        </div>
        <div className="text-xs text-[#8B7355] ml-8">SKU: {sku}</div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-[#232D35] text-sm">
          {formatCurrency(revenue)}
        </div>
        <div className="text-xs text-[#8B7355]">{unitsSold} units</div>
      </div>
    </div>
  );
}
