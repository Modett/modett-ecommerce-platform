"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CustomersTable,
  CustomerDetailsModal,
  DashboardHeader,
} from "@/features/admin/components";
import {
  getCustomers,
  toggleCustomerEmailVerification,
} from "@/features/admin/api/customers.api";
import type {
  AdminCustomer,
  CustomerFilters,
} from "@/features/admin/types/customer.types";

// ============================================================================
// CUSTOMERS PAGE COMPONENT
// ============================================================================

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch customers with React Query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-customers", filters],
    queryFn: () => getCustomers(filters),
    placeholderData: (previousData) => previousData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleFilterChange = (newFilters: CustomerFilters) => {
    setFilters(newFilters);
  };

  const handleViewCustomer = (customer: AdminCustomer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleToggleEmailVerification = async (customer: AdminCustomer) => {
    try {
      // Toggle logic
      const newStatus = !customer.emailVerified;
      const result = await toggleCustomerEmailVerification(
        customer.userId,
        newStatus,
        "Verification status toggled by admin"
      );

      if (result.success) {
        // Refresh data to reflect changes
        refetch();
      } else {
        alert("Failed to update verification status: " + result.error);
      }
    } catch (error) {
      console.error("Error toggling verification:", error);
      alert("An error occurred while updating status");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Page Header */}
      <DashboardHeader
        title="Customer Management"
        subtitle="View and manage customer accounts"
        searchTerm={filters.search}
        onSearchChange={(term) =>
          handleFilterChange({ ...filters, search: term, page: 1 })
        }
      />

      {/* Customers Table */}
      <CustomersTable
        customers={data?.data?.users || []}
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
        onViewCustomer={handleViewCustomer}
        onToggleEmailVerification={handleToggleEmailVerification}
      />

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCustomerUpdated={refetch}
      />
    </div>
  );
}
