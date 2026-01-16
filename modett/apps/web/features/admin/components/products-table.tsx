"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Edit,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ImageIcon,
} from "lucide-react";
import type {
  AdminProduct,
  ProductStatus,
  ProductFilters,
  ProductCategory,
} from "../types/product.types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ProductsTableProps {
  products: AdminProduct[];
  categories: ProductCategory[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  onEditProduct: (product: AdminProduct) => void;
}

// ============================================================================
// PRODUCTS TABLE COMPONENT
// ============================================================================

export function ProductsTable({
  products,
  categories,
  isLoading,
  pagination,
  filters,
  onFilterChange,
  onEditProduct,
}: ProductsTableProps) {
  const [showFilters, setShowFilters] = useState(false);
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handleStatusFilter = (status: ProductStatus | undefined) => {
    onFilterChange({ ...filters, status, page: 1 });
  };

  const handleCategoryFilter = (categoryId: string | undefined) => {
    onFilterChange({ ...filters, categoryId, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onFilterChange({ ...filters, page: newPage });
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: ProductStatus) => {
    const statusConfig: Record<
      ProductStatus,
      { bg: string; text: string; label: string }
    > = {
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
      published: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Published",
      },
      scheduled: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Scheduled",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;

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
    if (!dateString) return "-";
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
          {/* Search - Removed as we have global search */}
          <div className="flex-1"></div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${
              showFilters || filters.status || filters.categoryId
                ? "bg-[#232D35] text-white border-[#232D35]"
                : "bg-white/50 text-[#232D35] border-[#BBA496]/50 hover:bg-[#F8F5F2]"
            }`}
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.status || filters.categoryId) && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 text-white text-[10px] rounded-full">
                !
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-6 p-4 bg-[#F8F5F2]/50 border border-[#BBA496]/20 rounded-xl animate-in fade-in slide-in-from-top-2 flex flex-col gap-4">
            {/* Status Filter */}
            <div>
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
                {(["draft", "published", "scheduled"] as ProductStatus[]).map(
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

            {/* Category Filter */}
            <div>
              <p className="text-xs font-semibold text-[#8B7355] mb-3 uppercase tracking-wider">
                Filter by Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryFilter(undefined)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    !filters.categoryId
                      ? "bg-[#232D35] text-white shadow-md"
                      : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryFilter(cat.id)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                      filters.categoryId === cat.id
                        ? "bg-[#232D35] text-white shadow-md"
                        : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
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
                Status
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Price
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Stock
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Published
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
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="w-12 h-12 bg-[#BBA496]/20 rounded-lg" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-32" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-6 bg-[#BBA496]/20 rounded-full w-20" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-16" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-16" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-24" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-8 bg-[#BBA496]/20 rounded w-8 ml-auto" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
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
                        No products found
                      </p>
                      <p className="text-sm text-[#A09B93]">
                        Try adjusting your filters or search query.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const mainImage = product.images?.[0]?.url;
                const stockTotal =
                  product.variants?.reduce(
                    (sum, v) => sum + (v.inventory || 0),
                    0
                  ) || 0;
                // Assuming price is from the first variant if strictly variants based, or product price itself if available
                // AdminProduct has price, using that.

                return (
                  <tr
                    key={product.productId}
                    className="group hover:bg-[#F8F5F2]/40 transition-colors border-b border-[#BBA496]/10 last:border-0"
                  >
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt={product.title}
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
                          title={product.title}
                        >
                          {product.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[#8B7355] truncate max-w-full">
                          {product.brand && (
                            <span className="flex-shrink-0">
                              {product.brand}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#232D35]">
                        {/* Check if variants have different prices? For now display product price */}
                        {/* Wait, the product types has price but variants might override. */}
                        {/* Displaying raw product price from API response */}
                        {/* Since I haven't seen the exact data, fallback to 0 */}
                        {/* The AdminProduct type I updated has 'variants' with price, but the top-level 'price' field was removed in my type update? NO, I removed it? Let me check type update. */}
                        {/* I removed `price` from top level AdminProduct in my type update block? */}
                        {/* Checking previous replace_file_content... */}
                        {/* I see `productId`, `title`, ..., `variants` ... I did NOT include `price` at top level in my update block! */}
                        {/* So I should calculate from variants or check if API sends it. */}
                        {/* Typically Dashboard shows a range or "From $X". */}
                        {/* I'll use `variants[0]?.price` for now or a range. */}
                        {product.variants?.length > 0
                          ? formatCurrency(product.variants[0].price)
                          : "-"}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${stockTotal > 0 ? "text-[#232D35]" : "text-red-600"}`}
                      >
                        {stockTotal} in stock
                      </span>
                      <div className="text-xs text-[#A09B93]">
                        {product.variants?.length || 0} variants
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className="text-sm text-[#52525B]">
                        {formatDate(
                          product.publishAt ||
                            (product.status === "published"
                              ? product.updatedAt
                              : "")
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="inline-flex items-center justify-center w-8 h-8 text-[#232D35] hover:bg-[#232D35] hover:text-white rounded-full transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
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
      {!isLoading && products.length > 0 && (
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
            products
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
