"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import type {
  AdminOrder,
  OrderStatus,
  OrderFilters,
} from "../types/order.types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface OrdersTableProps {
  orders: AdminOrder[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: OrderFilters;
  onFilterChange: (filters: OrderFilters) => void;
  onViewOrder: (order: AdminOrder) => void;
}

// ============================================================================
// ORDERS TABLE COMPONENT
// ============================================================================

export function OrdersTable({
  orders,
  isLoading,
  pagination,
  filters,
  onFilterChange,
  onViewOrder,
}: OrdersTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput, page: 1 });
  };

  const handleStatusFilter = (status: OrderStatus | undefined) => {
    onFilterChange({ ...filters, status, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onFilterChange({ ...filters, page: newPage });
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper to copying order ID
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: OrderStatus | string) => {
    const statusConfig: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      PENDING: { bg: "bg-amber-100", text: "text-amber-800", label: "Pending" },
      CONFIRMED: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Confirmed",
      },
      PROCESSING: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Processing",
      },
      SHIPPED: {
        bg: "bg-indigo-100",
        text: "text-indigo-800",
        label: "Shipped",
      },
      DELIVERED: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        label: "Delivered",
      },
      CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
      REFUNDED: {
        bg: "bg-slate-100",
        text: "text-slate-800",
        label: "Refunded",
      },
    };

    const normalized = status?.toUpperCase() || "PENDING";
    const config = statusConfig[normalized] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status,
    };

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} border border-transparent shadow-sm`}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
                placeholder="Search orders..."
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
                1
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-[#F8F5F2]/50 border border-[#BBA496]/20 rounded-xl animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-semibold text-[#8B7355] mb-3 uppercase tracking-wider">
              Filter by Status
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
              {(
                [
                  "PENDING",
                  "CONFIRMED",
                  "PROCESSING",
                  "SHIPPED",
                  "DELIVERED",
                  "CANCELLED",
                ] as OrderStatus[]
              ).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    filters.status === status
                      ? "bg-[#232D35] text-white shadow-md"
                      : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#BBA496]/20 bg-[#F8F5F2]/50">
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap w-[180px]">
                Order Number
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap w-[200px]">
                Customer
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap w-[130px]">
                Date
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap w-[110px]">
                Status
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap w-[100px]">
                Total
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap w-[80px]">
                Items
              </th>
              <th className="px-3 py-4 text-right text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap w-[70px]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#BBA496]/20">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse bg-white/40">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-20" />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#BBA496]/20" />
                      <div className="h-4 bg-[#BBA496]/20 rounded w-24" />
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-24" />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-6 bg-[#BBA496]/20 rounded-full w-20" />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-16" />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-8" />
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-8 bg-[#BBA496]/20 rounded w-16 ml-auto" />
                  </td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-60">
                    <div className="w-16 h-16 rounded-full bg-[#F8F5F2] flex items-center justify-center">
                      <Search className="w-8 h-8 text-[#A09B93]" />
                    </div>
                    <div>
                      <p
                        className="text-[#232D35] font-medium text-lg"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        No orders found
                      </p>
                      <p className="text-sm text-[#A09B93]">
                        We couldn't find any orders matching your filters.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.orderId}
                  className="group hover:bg-[#F8F5F2]/40 transition-colors border-b border-[#BBA496]/10 last:border-0"
                >
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 group/id max-w-[240px]">
                      <span className="text-sm font-semibold text-[#232D35] font-mono tracking-tight truncate">
                        {order.orderNumber}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(order.orderNumber, order.orderId);
                        }}
                        className="text-[#A09B93] hover:text-[#232D35] transition-colors p-1 opacity-0 group-hover/id:opacity-100 focus:opacity-100"
                        title="Copy Order Number"
                      >
                        {copiedId === order.orderId ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#232D35] flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0">
                        {(order.customerName?.[0] || "G").toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-[#232D35]">
                          {order.customerName || "Guest Customer"}
                        </span>
                        <span className="text-xs text-[#8B7355] truncate max-w-[150px]">
                          {order.customerEmail || "No email"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#232D35]">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="text-xs text-[#A09B93]">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-[#232D35] tracking-tight">
                      {formatCurrency(order.totals?.total || 0)}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#52525B] font-medium">
                      {order.items?.length || 0} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="inline-flex items-center justify-center w-8 h-8 text-[#232D35] hover:bg-[#232D35] hover:text-white rounded-full transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && orders.length > 0 && (
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
            orders
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
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
                (_, idx) => {
                  const pg = idx + 1; // Simplified pagination logic
                  return (
                    <button
                      key={pg}
                      onClick={() => handlePageChange(pg)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${pagination.page === pg ? "bg-[#232D35] text-white shadow-md" : "text-[#6B7280] hover:bg-white"}`}
                    >
                      {pg}
                    </button>
                  );
                }
              )}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
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
