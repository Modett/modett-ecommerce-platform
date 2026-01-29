"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  AlertTriangle,
  Lock,
  Unlock,
} from "lucide-react";
import type { AdminCustomer, UserStatus } from "@/features/admin";
import {
  getCustomerById,
  updateCustomerStatus,
  updateCustomerRole,
  deleteCustomer,
} from "@/features/admin";
import axios from "axios";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CustomerDetailsModalProps {
  customer: AdminCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated?: () => void;
}

interface Address {
  addressId: string;
  type: "billing" | "shipping";
  isDefault: boolean;
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

interface PaymentMethod {
  paymentMethodId: string;
  type: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

interface Order {
  orderId: string;
  orderNumber: string;
  status: string;
  totals: {
    total: number;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
  };
  createdAt: string;
}

// ============================================================================
// CUSTOMER DETAILS MODAL COMPONENT
// ============================================================================

export function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
  onCustomerUpdated,
}: CustomerDetailsModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  /* Confirmation State */
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
    type: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: async () => {},
    type: "info",
  });

  // Local state for role selection to prevent snapback
  const [selectedRole, setSelectedRole] = useState(
    customer?.role || "CUSTOMER"
  );

  // Fetch customer details when modal opens and sync role
  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerDetails();
      setSelectedRole(customer.role);
    }
  }, [isOpen, customer]);

  const fetchCustomerDetails = async () => {
    if (!customer) return;

    setIsLoadingDetails(true);
    const token = localStorage.getItem("authToken");

    // Use environment variable or fallback
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

    try {
      // Fetch addresses, payment methods, and orders in parallel
      const [addressesRes, paymentsRes, ordersRes] = await Promise.allSettled([
        axios.get(`${baseURL}/users/${customer.userId}/addresses`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }),
        axios.get(`${baseURL}/users/${customer.userId}/payment-methods`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }),
        axios.get(`${baseURL}/orders?userId=${customer.userId}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }),
        // Also refresh customer details to get latest status
        axios.get(`${baseURL}/users/${customer.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }),
      ]);

      if (addressesRes.status === "fulfilled") {
        setAddresses(addressesRes.value.data.data || []);
      }

      if (paymentsRes.status === "fulfilled") {
        setPaymentMethods(paymentsRes.value.data.data?.paymentMethods || []);
      }

      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value.data.data?.orders || []);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const executeAction = async () => {
    if (confirmDialog.action) {
      await confirmDialog.action();
    }
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const handleStatusChangeClick = (newStatus: UserStatus) => {
    const isBlocking = newStatus === "blocked";
    setConfirmDialog({
      isOpen: true,
      title: isBlocking ? "Block User" : "Unblock User",
      message: isBlocking
        ? "Are you sure you want to block this user? They will not be able to log in or place orders."
        : "Are you sure you want to unblock this user?",
      type: isBlocking ? "danger" : "info",
      action: async () => {
        if (!customer) return;
        try {
          const result = await updateCustomerStatus(customer.userId, {
            status: newStatus,
            notes: "Status updated by admin via customer details modal",
          });

          if (result.success) {
            if (onCustomerUpdated) onCustomerUpdated();
            onClose();
          } else {
            alert(
              "Failed to update status: " + (result.error || "Unknown error")
            );
          }
        } catch (error) {
          console.error("Error updating status:", error);
          alert("An error occurred while updating status");
        }
      },
    });
  };

  const handleRoleChangeClick = (newRole: string) => {
    // Optimistically update local state
    setSelectedRole(newRole as any);

    setConfirmDialog({
      isOpen: true,
      title: "Update User Role",
      message: `Are you sure you want to change this user's role to ${newRole}?`,
      type: "warning",
      action: async () => {
        if (!customer) return;
        try {
          const result = await updateCustomerRole(
            customer.userId,
            newRole,
            "Role updated by admin via customer details modal"
          );

          if (result.success) {
            if (onCustomerUpdated) onCustomerUpdated();
            onClose();
          } else {
            // Revert on failure
            setSelectedRole(customer.role);
            alert(
              "Failed to update role: " + (result.error || "Unknown error")
            );
          }
        } catch (error) {
          // Revert on error
          setSelectedRole(customer.role);
          console.error("Error updating role:", error);
          alert("An error occurred while updating role");
        }
      },
    });
  };

  const handleDeleteUserClick = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete User",
      message:
        "Are you sure you want to DELETE this user? This action cannot be undone.",
      type: "danger",
      action: async () => {
        if (!customer) return;
        try {
          const result = await deleteCustomer(customer.userId);

          if (result.success) {
            if (onCustomerUpdated) onCustomerUpdated();
            onClose();
          } else {
            alert(
              "Failed to delete user: " + (result.error || "Unknown error")
            );
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          alert("An error occurred while deleting user");
        }
      },
    });
  };

  if (!isOpen || !customer) return null;

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
        className={`px-3 py-1 text-sm font-medium border rounded-lg ${config.bg} ${config.text}`}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, { bg: string; text: string }> = {
      GUEST: { bg: "bg-gray-100", text: "text-gray-800" },
      CUSTOMER: { bg: "bg-blue-100", text: "text-blue-800" },
      ADMIN: { bg: "bg-purple-100", text: "text-purple-800" },
      INVENTORY_STAFF: { bg: "bg-amber-100", text: "text-amber-800" },
      CUSTOMER_SERVICE: { bg: "bg-teal-100", text: "text-teal-800" },
      ANALYST: { bg: "bg-indigo-100", text: "text-indigo-800" },
      VENDOR: { bg: "bg-orange-100", text: "text-orange-800" },
    };

    const config = roleColors[role] || roleColors.CUSTOMER;

    return (
      <span
        className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {role}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return "LKR 0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount);
  };

  const totalSpent = orders.reduce(
    (sum, order) => sum + (Number(order.totals?.total) || 0),
    0
  );

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#BBA496]/20 bg-gradient-to-r from-white to-[#F8F5F2]/50">
              <div>
                <h2
                  className="text-2xl font-normal text-[#232D35]"
                  style={{ fontFamily: "Playfair Display, serif" }}
                >
                  Customer Details
                </h2>
                <p
                  className="text-sm text-[#A09B93] mt-1"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {customer.email}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#A09B93] hover:text-[#232D35] hover:bg-[#F8F5F2] rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Customer Overview */}
              <div className="mb-6 p-5 bg-gradient-to-br from-[#F8F5F2]/80 to-white border border-[#BBA496]/20 rounded-xl">
                {/* Changed to 2 columns to give Role dropdown more space and prevent overlap */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">
                      Status
                    </p>
                    {getStatusBadge(customer.status)}
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">
                      Role
                    </p>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(customer.role)}
                      <select
                        className="ml-2 text-xs border border-gray-300 rounded p-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#BBA496]"
                        value={selectedRole}
                        onChange={(e) => handleRoleChangeClick(e.target.value)}
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="ADMIN">Admin</option>
                        <option value="INVENTORY_STAFF">Inventory Staff</option>
                        <option value="CUSTOMER_SERVICE">
                          Customer Service
                        </option>
                        <option value="ANALYST">Analyst</option>
                        <option value="VENDOR">Vendor</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">
                      Total Orders
                    </p>
                    <p className="text-lg font-semibold text-[#232D35]">
                      {orders.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">
                      Total Spent
                    </p>
                    <p className="text-lg font-semibold text-[#232D35]">
                      {formatCurrency(totalSpent)}
                    </p>
                  </div>
                </div>

                {/* Delete Button */}
                <div className="mt-4 pt-4 border-t border-[#BBA496]/20 flex justify-between items-center">
                  <div className="flex gap-3">
                    {customer.status === "blocked" ? (
                      <button
                        onClick={() => handleStatusChangeClick("active")}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                      >
                        <Unlock className="w-4 h-4" />
                        Unblock User
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChangeClick("blocked")}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                      >
                        <Lock className="w-4 h-4" />
                        Block User
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleDeleteUserClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Delete User
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Account Information */}
                  <div className="border border-[#BBA496]/30 rounded-xl p-5 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-5 h-5 text-[#8B7355]" />
                      <h3
                        className="font-semibold text-[#232D35]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Account Information
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 text-[#8B7355] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-[#8B7355] mb-0.5">Email</p>
                          <p className="text-sm text-[#232D35] font-medium">
                            {customer.email}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {customer.emailVerified ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600">
                                  Verified
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  Unverified
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {customer.phone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-[#8B7355] mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-[#8B7355] mb-0.5">
                              Phone
                            </p>
                            <p className="text-sm text-[#232D35] font-medium">
                              {customer.phone}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {customer.phoneVerified ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  <span className="text-xs text-green-600">
                                    Verified
                                  </span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">
                                    Unverified
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-[#8B7355] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-[#8B7355] mb-0.5">
                            Member Since
                          </p>
                          <p className="text-sm text-[#232D35] font-medium">
                            {formatDate(customer.createdAt)}
                          </p>
                        </div>
                      </div>

                      {customer.isGuest && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <Shield className="w-4 h-4 text-gray-600" />
                          <span className="text-xs text-gray-600 font-medium">
                            Guest Account
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="border border-[#BBA496]/30 rounded-xl p-5 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-[#8B7355]" />
                      <h3
                        className="font-semibold text-[#232D35]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Addresses ({addresses.length})
                      </h3>
                    </div>
                    {isLoadingDetails ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-16 bg-[#BBA496]/10 rounded-lg" />
                        <div className="h-16 bg-[#BBA496]/10 rounded-lg" />
                      </div>
                    ) : addresses.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {addresses.map((address) => (
                          <div
                            key={address.addressId}
                            className="p-3 bg-[#F8F5F2]/50 rounded-lg border border-[#BBA496]/20"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-[#8B7355] uppercase">
                                {address.type}
                              </span>
                              {address.isDefault && (
                                <span className="text-xs px-2 py-0.5 bg-[#232D35] text-white rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#232D35]">
                              {address.firstName} {address.lastName}
                            </p>
                            <p className="text-xs text-[#52525B]">
                              {address.addressLine1}
                              {address.addressLine2 &&
                                `, ${address.addressLine2}`}
                            </p>
                            <p className="text-xs text-[#52525B]">
                              {address.city}, {address.state}{" "}
                              {address.postalCode}
                            </p>
                            <p className="text-xs text-[#52525B]">
                              {address.country}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#A09B93] text-center py-4">
                        No addresses found
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Payment Methods */}
                  <div className="border border-[#BBA496]/30 rounded-xl p-5 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-[#8B7355]" />
                      <h3
                        className="font-semibold text-[#232D35]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Payment Methods ({paymentMethods.length})
                      </h3>
                    </div>
                    {isLoadingDetails ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-12 bg-[#BBA496]/10 rounded-lg" />
                      </div>
                    ) : paymentMethods.length > 0 ? (
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.paymentMethodId}
                            className="p-3 bg-[#F8F5F2]/50 rounded-lg border border-[#BBA496]/20"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-[#232D35]">
                                  {method.brand} •••• {method.last4}
                                </p>
                                {method.expMonth && method.expYear && (
                                  <p className="text-xs text-[#52525B]">
                                    Expires {method.expMonth}/{method.expYear}
                                  </p>
                                )}
                              </div>
                              {method.isDefault && (
                                <span className="text-xs px-2 py-0.5 bg-[#232D35] text-white rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#A09B93] text-center py-4">
                        No payment methods found
                      </p>
                    )}
                  </div>

                  {/* Recent Orders */}
                  <div className="border border-[#BBA496]/30 rounded-xl p-5 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingBag className="w-5 h-5 text-[#8B7355]" />
                      <h3
                        className="font-semibold text-[#232D35]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Recent Orders ({orders.length})
                      </h3>
                    </div>
                    {isLoadingDetails ? (
                      <div className="animate-pulse space-y-3">
                        <div className="h-12 bg-[#BBA496]/10 rounded-lg" />
                        <div className="h-12 bg-[#BBA496]/10 rounded-lg" />
                        <div className="h-12 bg-[#BBA496]/10 rounded-lg" />
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {orders.map((order) => (
                          <div
                            key={order.orderId}
                            className="p-3 bg-[#F8F5F2]/50 rounded-lg border border-[#BBA496]/20 hover:bg-[#F8F5F2] transition-colors"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-[#232D35]">
                                #{order.orderNumber}
                              </p>
                              <p className="text-sm font-semibold text-[#232D35]">
                                {formatCurrency(order.totals?.total || 0)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-[#52525B]">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#A09B93] text-center py-4">
                        No orders found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#BBA496]/20 bg-[#F8F5F2]/30">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-[#BBA496]/50 text-[#232D35] rounded-xl hover:bg-white transition-all font-medium"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6 transform transition-all">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  confirmDialog.type === "danger"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {confirmDialog.type === "danger" ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Shield className="w-6 h-6" />
                )}
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {confirmDialog.title}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {confirmDialog.message}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                    // Revert selection if cancelling role change
                    if (customer) setSelectedRole(customer.role);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    confirmDialog.type === "danger"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
