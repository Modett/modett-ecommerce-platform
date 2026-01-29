"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Edit,
} from "lucide-react";
import type {
  InventoryItem,
  InventoryFilters,
  StockStatus,
} from "../types/inventory.types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface StockOverviewTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  filters: InventoryFilters;
  onFilterChange: (filters: InventoryFilters) => void;
  onEditReorderPoint: (item: InventoryItem) => void;
  onAdjustStock: (item: InventoryItem) => void;
}

// ============================================================================
// STOCK OVERVIEW TABLE COMPONENT
// ============================================================================

export function StockOverviewTable({
  items,
  isLoading,
  pagination,
  filters,
  onFilterChange,
  onEditReorderPoint,
  onAdjustStock,
}: StockOverviewTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput, page: 1 });
  };

  const handleStatusFilter = (status: StockStatus | undefined) => {
    onFilterChange({ ...filters, status, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onFilterChange({ ...filters, page: newPage });
  };

  const getStatusBadge = (status: StockStatus) => {
    const statusConfig: Record<
      StockStatus,
      { bg: string; text: string; icon: any; label: string }
    > = {
      critical: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: AlertCircle,
        label: "Critical",
      },
      warning: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: AlertTriangle,
        label: "Warning",
      },
      healthy: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: CheckCircle2,
        label: "Healthy",
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} border border-transparent shadow-sm`}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-[#BBA496]/30 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header with Search and Filters */}
      <div className="p-6 border-b border-[#BBA496]/20 bg-gradient-to-r from-white/50 to-transparent">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md w-full">
            <div className="relative group">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by product, SKU..."
                className="w-full h-11 pl-11 pr-4 bg-white/50 border border-[#BBA496]/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#BBA496]/20 focus:border-[#BBA496] transition-all"
                style={{ fontFamily: "Raleway, sans-serif" }}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09B93] group-focus-within:text-[#232D35] transition-colors" />
            </div>
          </form>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${
              showFilters || filters.status
                ? "bg-[#232D35] text-white border-[#232D35]"
                : "bg-white/50 text-[#232D35] border-[#BBA496]/50 hover:bg-[#F8F5F2]"
            }`}
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <Filter className="w-4 h-4" />
            Filters
            {filters.status && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 text-white text-[10px] rounded-full">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-[#F8F5F2]/50 border border-[#BBA496]/20 rounded-xl">
            <p className="text-xs font-semibold text-[#8B7355] mb-3 uppercase tracking-wider">
              Filter by Stock Status
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilter(undefined)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  !filters.status
                    ? "bg-[#232D35] text-white shadow-md"
                    : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                }`}
              >
                All
              </button>
              {(["critical", "warning", "healthy"] as StockStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                      filters.status === status
                        ? "bg-[#232D35] text-white shadow-md"
                        : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#BBA496]/20 bg-[#F8F5F2]/50">
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap w-[80px]">
                Image
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Product
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                SKU
              </th>
              <th className="px-3 py-4 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                In Stock
              </th>
              <th className="px-3 py-4 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Reserved
              </th>
              <th className="px-3 py-4 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Available
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-3 py-4 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap w-[100px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#BBA496]/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/40">
                  <td className="px-3 py-5">
                    <div className="w-12 h-12 bg-[#BBA496]/20 rounded-lg" />
                  </td>
                  <td className="px-3 py-5">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-32" />
                  </td>
                  <td className="px-3 py-5">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-24" />
                  </td>
                  <td className="px-3 py-5">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-16 ml-auto" />
                  </td>
                  <td className="px-3 py-5">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-16 ml-auto" />
                  </td>
                  <td className="px-3 py-5">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-16 ml-auto" />
                  </td>
                  <td className="px-3 py-5">
                    <div className="h-6 bg-[#BBA496]/20 rounded-full w-20" />
                  </td>
                  <td className="px-3 py-5">
                    <div className="h-8 bg-[#BBA496]/20 rounded w-16 ml-auto" />
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-[#F8F5F2] flex items-center justify-center">
                      <Search className="w-8 h-8 text-[#A09B93]" />
                    </div>
                    <div>
                      <p
                        className="text-[#232D35] font-medium text-lg"
                        style={{ fontFamily: "Playfair Display, serif" }}
                      >
                        No inventory items found
                      </p>
                      <p className="text-sm text-[#A09B93]">
                        Try adjusting your filters or search query.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-[#F8F5F2]/40 transition-colors border-b border-[#BBA496]/10 last:border-0"
                >
                  <td className="px-3 py-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col max-w-[250px]">
                      <span
                        className="text-sm font-medium text-[#232D35] truncate"
                        title={item.productTitle}
                      >
                        {item.productTitle}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-[#8B7355]">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className="text-sm font-mono text-[#52525B]">
                      {item.sku}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span className="text-sm font-semibold text-[#232D35]">
                      {item.inStock}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span className="text-sm text-[#A09B93]">
                      {item.reserved}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span
                      className={`text-sm font-semibold ${item.available > 0 ? "text-[#232D35]" : "text-red-600"}`}
                    >
                      {item.available}
                    </span>
                  </td>
                  <td className="px-3 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditReorderPoint(item)}
                        className="inline-flex items-center justify-center w-8 h-8 text-[#232D35] hover:bg-[#232D35] hover:text-white rounded-full transition-colors"
                        title="Edit Reorder Point"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAdjustStock(item)}
                        className="px-3 py-1.5 text-xs font-medium bg-[#232D35] text-white rounded-lg hover:bg-black transition-all shadow-sm"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Adjust
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && items.length > 0 && (
        <div className="px-6 py-4 border-t border-[#BBA496]/20 flex items-center justify-between bg-[#F8F5F2]/30">
          <p className="text-xs text-[#8B7355]">
            Showing{" "}
            <span className="font-medium text-[#232D35]">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-[#232D35]">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[#232D35]">
              {pagination.total}
            </span>{" "}
            items
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 text-[#232D35] hover:bg-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                const pg = idx + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => handlePageChange(pg)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${pagination.page === pg ? "bg-[#232D35] text-white shadow-md" : "text-[#6B7280] hover:bg-white"}`}
                  >
                    {pg}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === totalPages}
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
