"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DashboardHeader,
  InventoryTable,
  ReceivingModal,
  StockAdjustmentModal,
  getStocks,
  getLocations,
} from "@/features/admin";
import { PackagePlus, TrendingUp, AlertTriangle } from "lucide-react";
import type {
  InventoryFilters,
  StockItem,
} from "@/features/admin";

export default function InventoryPage() {
  const [filters, setFilters] = useState<InventoryFilters>({
    limit: 20,
    offset: 0,
    sortBy: "product",
    sortOrder: "asc",
  });
  const [isReceivingOpen, setIsReceivingOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<StockItem | null>(
    null
  );

  const {
    data: stocksData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin-stocks", filters],
    queryFn: () => getStocks(filters),
    placeholderData: (previousData) => previousData,
  });

  // Fetch locations for filter dropdown
  const { data: locationsData } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: () => getLocations(),
  });

  const handleFilterChange = (newFilters: InventoryFilters) => {
    setFilters(newFilters);
  };

  const handleReceiveSuccess = () => {
    refetch();
  };

  // Fetch global stats
  const { data: statsData } = useQuery({
    queryKey: ["admin-inventory-stats"],
    queryFn: () =>
      import("@/features/admin").then((m) =>
        m.getInventoryStats()
      ),
  });

  // Use stats from API or fallback to 0
  const totalItems = statsData?.data?.totalItems || 0;
  const lowStockCount = statsData?.data?.lowStockCount || 0;

  return (
    <div className="space-y-6 max-w-[1600px]">
      <DashboardHeader
        title="Inventory Management"
        subtitle="Track stock levels, multiple locations, and supply chain"
      >
        <button
          onClick={() => setIsReceivingOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#232D35] text-white rounded-xl hover:bg-black transition-all shadow-sm transform hover:-translate-y-0.5"
          style={{ fontFamily: "Raleway, sans-serif" }}
        >
          <PackagePlus className="w-5 h-5" />
          <span className="font-medium">Receive Inventory</span>
        </button>
      </DashboardHeader>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 border border-[#BBA496]/20 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <PackagePlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[#8B7355]">Total Stock Items</p>
            <p className="text-2xl font-semibold text-[#232D35]">
              {totalItems}
            </p>
          </div>
        </div>
        <div className="bg-white/60 border border-[#BBA496]/20 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-[#8B7355]">Low Stock Alerts</p>
            <p className="text-2xl font-semibold text-[#232D35]">
              {lowStockCount}
            </p>
          </div>
        </div>
        {/* Placeholders for future stats */}
      </div>

      <InventoryTable
        stocks={stocksData?.data?.stocks || []}
        locations={locationsData?.data?.locations || []}
        isLoading={isLoading}
        pagination={{
          total: stocksData?.data?.total || 0,
          offset: filters.offset || 0,
          limit: filters.limit || 20,
        }}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAdjust={(item) => {
          setSelectedStockItem(item);
          setIsAdjustmentOpen(true);
        }}
      />

      <ReceivingModal
        isOpen={isReceivingOpen}
        onClose={() => setIsReceivingOpen(false)}
        onSuccess={handleReceiveSuccess}
      />

      <StockAdjustmentModal
        isOpen={isAdjustmentOpen}
        stockItem={selectedStockItem}
        onClose={() => {
          setIsAdjustmentOpen(false);
          setSelectedStockItem(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
