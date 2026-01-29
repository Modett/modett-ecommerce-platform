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
  locations?: StockLocation[];
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
  locations = [],
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

  const hasActiveFilters = !!(
    filters.status ||
    filters.locationId ||
    filters.sortBy !== "product" ||
    filters.sortOrder !== "asc"
  );

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#BBA496]/30 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-[#BBA496]/20 bg-gradient-to-r from-white/50 to-transparent">
        <div className="flex items-center justify-between">
          <h3
            className="text-lg font-medium text-[#232D35]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Stock Overview
          </h3>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${
              showFilters || hasActiveFilters
                ? "bg-[#232D35] text-white border-[#232D35]"
                : "bg-white/50 text-[#232D35] border-[#BBA496]/50 hover:bg-[#F8F5F2]"
            }`}
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 text-white text-[10px] rounded-full">
                !
              </span>
            )}
          </button>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-[#F8F5F2]/50 border border-[#BBA496]/20 rounded-xl animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label
                  className="block text-xs font-semibold text-[#8B7355] mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Stock Status
                </label>
                <select
                  value={filters.status || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      status: e.target.value
                        ? (e.target.value as "low_stock" | "out_of_stock" | "in_stock")
                        : undefined,
                      offset: 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] bg-white text-[#232D35] text-sm"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  <option value="">All Statuses</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label
                  className="block text-xs font-semibold text-[#8B7355] mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Location
                </label>
                <select
                  value={filters.locationId || ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      locationId: e.target.value || undefined,
                      offset: 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] bg-white text-[#232D35] text-sm"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location.locationId} value={location.locationId}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label
                  className="block text-xs font-semibold text-[#8B7355] mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy || "product"}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        sortBy: e.target.value as
                          | "available"
                          | "onHand"
                          | "location"
                          | "product",
                      })
                    }
                    className="flex-1 px-3 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] bg-white text-[#232D35] text-sm"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <option value="product">Product</option>
                    <option value="available">Available</option>
                    <option value="onHand">On Hand</option>
                    <option value="location">Location</option>
                  </select>
                  <select
                    value={filters.sortOrder || "asc"}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        sortOrder: e.target.value as "asc" | "desc",
                      })
                    }
                    className="px-3 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] bg-white text-[#232D35] text-sm"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <option value="asc">↑ Asc</option>
                    <option value="desc">↓ Desc</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#BBA496]/20">
              <span
                className="text-xs font-medium text-[#8B7355]"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Quick Filters:
              </span>
              <button
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    status:
                      filters.status === "out_of_stock" ? undefined : "out_of_stock",
                    offset: 0,
                  })
                }
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filters.status === "out_of_stock"
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-white text-[#8B7355] border border-[#BBA496]/30 hover:bg-[#F8F5F2]"
                }`}
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                🔴 Out of Stock
              </button>
              <button
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    status: filters.status === "low_stock" ? undefined : "low_stock",
                    offset: 0,
                  })
                }
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filters.status === "low_stock"
                    ? "bg-amber-100 text-amber-700 border border-amber-300"
                    : "bg-white text-[#8B7355] border border-[#BBA496]/30 hover:bg-[#F8F5F2]"
                }`}
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                🟡 Low Stock
              </button>
              <button
                onClick={() =>
                  onFilterChange({
                    ...filters,
                    status: filters.status === "in_stock" ? undefined : "in_stock",
                    offset: 0,
                  })
                }
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filters.status === "in_stock"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-white text-[#8B7355] border border-[#BBA496]/30 hover:bg-[#F8F5F2]"
                }`}
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                🟢 In Stock
              </button>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={() =>
                    onFilterChange({
                      limit: filters.limit,
                      offset: 0,
                      sortBy: "product",
                      sortOrder: "asc",
                    })
                  }
                  className="ml-auto px-3 py-1 text-xs font-medium text-[#8B7355] hover:text-[#232D35] hover:bg-white border border-[#BBA496]/30 rounded-full transition-colors"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
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
