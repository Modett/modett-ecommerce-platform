import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils"; // Assuming utils exist
import type { ProductVariant } from "../types/product.types";

interface VariantsTableProps {
  variants: ProductVariant[];
  isLoading: boolean;
  onEdit: (variant: ProductVariant) => void;
  onDelete: (variantId: string) => void;
}

export function VariantsTable({
  variants,
  isLoading,
  onEdit,
  onDelete,
}: VariantsTableProps) {
  return (
    <div className="bg-white border border-[#BBA496]/30 rounded-xl overflow-hidden shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F8F5F2] border-b border-[#BBA496]/20">
            <th className="px-6 py-3 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider">
              Variant
            </th>
            <th className="px-6 py-3 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider">
              Inventory
            </th>
            <th className="px-6 py-3 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#BBA496]/20">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td colSpan={5} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </td>
              </tr>
            ))
          ) : variants.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No variants found. Add your first variant.
              </td>
            </tr>
          ) : (
            variants.map((variant) => (
              <tr
                key={variant.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {variant.sku}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {variant.size && (
                    <span className="mr-3">
                      <span className="text-gray-500 text-xs uppercase mr-1">
                        Size:
                      </span>
                      {variant.size}
                    </span>
                  )}
                  {variant.color && (
                    <span>
                      <span className="text-gray-500 text-xs uppercase mr-1">
                        Color:
                      </span>
                      {variant.color}
                    </span>
                  )}
                  {!variant.size && !variant.color && (
                    <span className="text-gray-400 italic">Default</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-900 font-medium">
                  {formatCurrency(variant.price)}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-700">
                  {variant.inventory}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(variant)}
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Variant"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(variant.id)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
