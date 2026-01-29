"use client";

import { useState } from "react";
import {
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type {
  AdminCustomer,
  UserRole,
  UserStatus,
  CustomerFilters,
  CustomerPagination,
} from "../types/customer.types";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CustomersTableProps {
  customers: AdminCustomer[];
  isLoading: boolean;
  pagination: CustomerPagination;
  filters: CustomerFilters;
  onFilterChange: (filters: CustomerFilters) => void;
  onViewCustomer: (customer: AdminCustomer) => void;
  onToggleEmailVerification: (customer: AdminCustomer) => Promise<void>;
}

// ============================================================================
// CUSTOMERS TABLE COMPONENT
// ============================================================================

export function CustomersTable({
  customers,
  isLoading,
  pagination,
  filters,
  onFilterChange,
  onViewCustomer,
  onToggleEmailVerification,
}: CustomersTableProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const totalPages = pagination.totalPages;

  const handleStatusFilter = (status: UserStatus | undefined) => {
    onFilterChange({ ...filters, status, page: 1 });
  };

  const handleRoleFilter = (role: UserRole | undefined) => {
    onFilterChange({ ...filters, role, page: 1 });
  };

  const handleEmailVerifiedFilter = (verified: boolean | undefined) => {
    onFilterChange({ ...filters, emailVerified: verified, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onFilterChange({ ...filters, page: newPage });
  };

  const handleVerificationClick = async (customer: AdminCustomer) => {
    try {
      setVerifyingId(customer.userId);
      await onToggleEmailVerification(customer);
    } finally {
      setVerifyingId(null);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const statusConfig: Record<
      UserStatus,
      { bg: string; text: string; label: string }
    > = {
      active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      inactive: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Inactive",
      },
      blocked: { bg: "bg-red-100", text: "text-red-800", label: "Blocked" },
    };

    const config = statusConfig[status] || statusConfig.active;

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} border border-transparent shadow-sm`}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig: Record<UserRole, { bg: string; text: string }> = {
      GUEST: { bg: "bg-gray-100", text: "text-gray-800" },
      CUSTOMER: { bg: "bg-blue-100", text: "text-blue-800" },
      ADMIN: { bg: "bg-purple-100", text: "text-purple-800" },
      INVENTORY_STAFF: { bg: "bg-amber-100", text: "text-amber-800" },
      CUSTOMER_SERVICE: { bg: "bg-teal-100", text: "text-teal-800" },
      ANALYST: { bg: "bg-indigo-100", text: "text-indigo-800" },
      VENDOR: { bg: "bg-orange-100", text: "text-orange-800" },
    };

    const config = roleConfig[role] || roleConfig.CUSTOMER;

    return (
      <span
        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {role}
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
      {/* Header with Filters */}
      <div className="p-6 border-b border-[#BBA496]/20 bg-gradient-to-r from-white/50 to-transparent">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1"></div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium transition-all ${
              showFilters ||
              filters.status ||
              filters.role ||
              filters.emailVerified !== undefined
                ? "bg-[#232D35] text-white border-[#232D35]"
                : "bg-white/50 text-[#232D35] border-[#BBA496]/50 hover:bg-[#F8F5F2]"
            }`}
            style={{ fontFamily: "Raleway, sans-serif" }}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.status ||
              filters.role ||
              filters.emailVerified !== undefined) && (
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
                {(["active", "inactive", "blocked"] as UserStatus[]).map(
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

            {/* Role Filter */}
            <div>
              <p className="text-xs font-semibold text-[#8B7355] mb-3 uppercase tracking-wider">
                Filter by Role
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleRoleFilter(undefined)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    !filters.role
                      ? "bg-[#232D35] text-white shadow-md"
                      : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  All
                </button>
                {(
                  [
                    "CUSTOMER",
                    "ADMIN",
                    "INVENTORY_STAFF",
                    "CUSTOMER_SERVICE",
                    "ANALYST",
                    "VENDOR",
                  ] as UserRole[]
                ).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleRoleFilter(role)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                      filters.role === role
                        ? "bg-[#232D35] text-white shadow-md"
                        : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Verified Filter */}
            <div>
              <p className="text-xs font-semibold text-[#8B7355] mb-3 uppercase tracking-wider">
                Email Verification
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleEmailVerifiedFilter(undefined)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    filters.emailVerified === undefined
                      ? "bg-[#232D35] text-white shadow-md"
                      : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => handleEmailVerifiedFilter(true)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    filters.emailVerified === true
                      ? "bg-[#232D35] text-white shadow-md"
                      : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  Verified
                </button>
                <button
                  onClick={() => handleEmailVerifiedFilter(false)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                    filters.emailVerified === false
                      ? "bg-[#232D35] text-white shadow-md"
                      : "bg-white text-[#6B7280] hover:bg-[#E5E7EB]"
                  }`}
                >
                  Unverified
                </button>
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
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Email
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Phone
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Role
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-3 py-4 text-center text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Verified
              </th>
              <th className="px-3 py-4 text-left text-xs font-bold text-[#8B7355] uppercase tracking-wider whitespace-nowrap">
                Joined
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
                    <div className="h-4 bg-[#BBA496]/20 rounded w-40" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-24" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-6 bg-[#BBA496]/20 rounded-full w-20" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-6 bg-[#BBA496]/20 rounded-full w-20" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-4 mx-auto" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-4 bg-[#BBA496]/20 rounded w-24" />
                  </td>
                  <td className="px-3 py-5 whitespace-nowrap">
                    <div className="h-8 bg-[#BBA496]/20 rounded w-8 ml-auto" />
                  </td>
                </tr>
              ))
            ) : customers.length === 0 ? (
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
                        No customers found
                      </p>
                      <p className="text-sm text-[#A09B93]">
                        Try adjusting your filters or search query.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.userId}
                  className="group hover:bg-[#F8F5F2]/40 transition-colors border-b border-[#BBA496]/10 last:border-0"
                >
                  <td className="px-3 py-4">
                    <div className="flex flex-col max-w-[250px]">
                      <span
                        className="text-sm font-medium text-[#232D35] truncate"
                        title={customer.email}
                      >
                        {customer.email}
                      </span>
                      {customer.isGuest && (
                        <span className="text-xs text-[#8B7355] italic">
                          Guest
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#52525B]">
                      {customer.phone || "-"}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {getRoleBadge(customer.role)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {getStatusBadge(customer.status)}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleVerificationClick(customer)}
                      disabled={verifyingId === customer.userId}
                      className={`p-1 rounded-full transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#BBA496]/50 ${
                        verifyingId === customer.userId
                          ? "opacity-50 cursor-wait"
                          : "cursor-pointer"
                      }`}
                      title={
                        customer.emailVerified
                          ? "Mark as Unverified"
                          : "Mark as Verified"
                      }
                    >
                      {verifyingId === customer.userId ? (
                        <div className="w-5 h-5 border-2 border-[#BBA496] border-t-transparent rounded-full animate-spin mx-auto" />
                      ) : customer.emailVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className="text-sm text-[#52525B]">
                      {formatDate(customer.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onViewCustomer(customer)}
                      className="inline-flex items-center justify-center w-8 h-8 text-[#232D35] hover:bg-[#232D35] hover:text-white rounded-full transition-colors"
                      title="View Customer"
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
      {!isLoading && customers.length > 0 && (
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
            customers
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
