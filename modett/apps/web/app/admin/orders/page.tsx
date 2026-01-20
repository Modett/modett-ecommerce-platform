"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrdersTable } from "@/features/admin/components/orders-table";
import { DashboardHeader } from "@/features/admin/components";
import { OrderDetailsModal } from "@/features/admin/components/order-details-modal";
import { getOrders } from "@/features/admin/api/orders.api";
import type {
  AdminOrder,
  OrderFilters,
} from "@/features/admin/types/order.types";

// ============================================================================
// ORDERS PAGE COMPONENT
// ============================================================================

export default function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch orders with React Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: () => getOrders(filters),
    placeholderData: (previousData) => previousData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleFilterChange = (newFilters: OrderFilters) => {
    setFilters(newFilters);
  };

  const handleViewOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOrderUpdated = () => {
    refetch();
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page Header */}
      <DashboardHeader
        title="Orders Management"
        subtitle="View and manage all customer orders"
      />

      {/* Orders Table */}
      <OrdersTable
        orders={data?.data?.orders || []}
        isLoading={isLoading}
        pagination={
          data?.data?.pagination || {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
          }
        }
        filters={filters}
        onFilterChange={handleFilterChange}
        onViewOrder={handleViewOrder}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}
