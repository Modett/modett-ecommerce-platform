import { Search, Filter } from "lucide-react";
import type {
  InventoryFilters,
  StockLocation,
} from "../types/inventory.types";

interface InventoryFilterProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  locations?: StockLocation[];
}

export function InventoryFilter({
  filters,
  onFiltersChange,
  locations = [],
}: InventoryFilterProps) {
  return (
    <div className="bg-white border border-[#BBA496]/30 rounded-xl p-6 space-y-4">
      {/* Search and Status Filters Row */}
      <div className="flex flex-wrap gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[250px]">
          <label
            className="block text-sm font-medium text-[#8B7355] mb-2"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
            <input
              type="text"
              placeholder="Search by product, SKU, or brand..."
              value={filters.search || ""}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] text-[#232D35]"
              style={{ fontFamily: "Raleway, sans-serif" }}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-auto min-w-[200px]">
          <label
            className="block text-sm font-medium text-[#8B7355] mb-2"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Stock Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value
                  ? (e.target.value as "low_stock" | "out_of_stock" | "in_stock")
                  : undefined,
              })
            }
            className="w-full px-4 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] bg-white text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <option value="">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Location Filter */}
        <div className="w-full sm:w-auto min-w-[200px]">
          <label
            className="block text-sm font-medium text-[#8B7355] mb-2"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Location
          </label>
          <select
            value={filters.locationId || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                locationId: e.target.value || undefined,
              })
            }
            className="w-full px-4 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] bg-white text-[#232D35]"
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
      </div>

      {/* Sort Options Row */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-full sm:w-auto min-w-[200px]">
          <label
            className="block text-sm font-medium text-[#8B7355] mb-2"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Sort By
          </label>
          <select
            value={filters.sortBy || "product"}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                sortBy: e.target.value as
                  | "available"
                  | "onHand"
                  | "location"
                  | "product",
              })
            }
            className="w-full px-4 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] bg-white text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <option value="product">Product Name</option>
            <option value="available">Available Quantity</option>
            <option value="onHand">On Hand Quantity</option>
            <option value="location">Location</option>
          </select>
        </div>

        <div className="w-full sm:w-auto min-w-[150px]">
          <label
            className="block text-sm font-medium text-[#8B7355] mb-2"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Order
          </label>
          <select
            value={filters.sortOrder || "asc"}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                sortOrder: e.target.value as "asc" | "desc",
              })
            }
            className="w-full px-4 py-2 border border-[#BBA496]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BBA496] bg-white text-[#232D35]"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(filters.search ||
          filters.status ||
          filters.locationId ||
          filters.sortBy !== "product" ||
          filters.sortOrder !== "asc") && (
          <button
            onClick={() =>
              onFiltersChange({
                limit: filters.limit,
                offset: 0,
                sortBy: "product",
                sortOrder: "asc",
              })
            }
            className="px-4 py-2 text-sm font-medium text-[#8B7355] hover:text-[#232D35] hover:bg-[#F8F5F2] border border-[#BBA496]/30 rounded-lg transition-colors"
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Quick Status Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        <span
          className="text-xs font-medium text-[#8B7355]"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          Quick Filters:
        </span>
        <button
          onClick={() =>
            onFiltersChange({
              ...filters,
              status: filters.status === "out_of_stock" ? undefined : "out_of_stock",
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
            onFiltersChange({
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
            onFiltersChange({
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
      </div>
    </div>
  );
}
