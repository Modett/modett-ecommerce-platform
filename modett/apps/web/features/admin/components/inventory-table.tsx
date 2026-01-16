"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";
import type {
  StockItem,
  InventoryFilters,
  StockLocation,
} from "../types/inventory.types";

interface InventoryTableProps {
  stocks: StockItem[];
  isLoading: boolean;
  pagination: {
    total: number;
    offset: number;
    limit: number;
  };
  filters: InventoryFilters;
  onFilterChange: (filters: InventoryFilters) => void;
  onAdjust: (item: StockItem) => void;
}

export function InventoryTable({
  stocks,
  isLoading,
  pagination,
  filters,
  onFilterChange,
  onAdjust,
}: InventoryTableProps) {
  const [showFilters, setShowFilters] = useState(false);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handlePageChange = (newPage: number) => {
    const newOffset = (newPage - 1) * pagination.limit;
    onFilterChange({ ...filters, offset: newOffset });
  };

  const getStockStatus = (item: StockItem) => {
    // Logic for stock status color
    if (item.available <= 0) {
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    }
    if (item.lowStockThreshold && item.available <= item.lowStockThreshold) {
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    }
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#BBA496]/30 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header with Search and Filters (Simplified for now) */}
      <div className="p-6 border-b border-[#BBA496]/20 bg-gradient-to-r from-white/50 to-transparent flex justify-between">
        <h3
          className="text-lg font-medium text-[#232D35]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Stock Overview
        </h3>
      </div>

      <div className="">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#BBA496]/20 bg-[#F8F5F2]/50">
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                Product
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                Location
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                In Stock
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                Reserved
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                Available
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-4 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#BBA496]/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/40">
                  <td colSpan={6} className="px-3 py-4">
                    <div className="h-8 bg-[#BBA496]/20 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : stocks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-16 text-center text-[#A09B93]"
                >
                  No inventory data found.
                </td>
              </tr>
            ) : (
              stocks.map((item) => {
                const status = getStockStatus(item);

                // Handle new backend structure (media instead of images)
                const product = item.variant?.product;
                const mediaAsset = product?.media?.[0]?.asset;

                // Construct URL
                // Backend ProductController maps storageKey directly to url, so it seems storageKey is the full URL or valid path.
                const image =
                  mediaAsset?.url ||
                  mediaAsset?.publicUrl ||
                  mediaAsset?.storageKey;

                const displayImage = image;

                return (
                  <tr
                    key={item.stockId}
                    className="group hover:bg-[#F8F5F2]/40 transition-colors"
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {image ? (
                            <img
                              src={image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#232D35] truncate max-w-[200px]">
                            {item.variant?.product?.title || "Unknown Product"}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {item.variant?.size && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F8F5F2] text-[#232D35] border border-[#BBA496]/30 shadow-sm">
                                <span className="text-[#8B7355] mr-1">
                                  Size:
                                </span>
                                {item.variant.size}
                              </span>
                            )}
                            {item.variant?.color && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F8F5F2] text-[#232D35] border border-[#BBA496]/30 shadow-sm">
                                <span className="text-[#8B7355] mr-1">
                                  Color:
                                </span>
                                {item.variant.color}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-[#232D35]">
                      {item.location?.name || "-"}
                      <span className="block text-xs text-[#8B7355] capitalize">
                        {item.location?.type}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-center text-sm font-medium text-[#232D35]">
                      {item.onHand}
                    </td>
                    <td className="px-3 py-4 text-center text-sm font-medium text-[#232D35]">
                      {item.reserved}
                    </td>
                    <td className="px-3 py-4 text-center text-sm font-bold text-[#232D35]">
                      {item.available}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <button
                        onClick={() => onAdjust(item)}
                        className="text-sm font-medium text-[#8B7355] hover:text-[#232D35] underline"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && stocks.length > 0 && (
        <div className="px-6 py-4 border-t border-[#BBA496]/20 flex items-center justify-between bg-[#F8F5F2]/30">
          <p className="text-xs text-[#8B7355]">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-[#232D35] hover:bg-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 text-[#232D35] hover:bg-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
