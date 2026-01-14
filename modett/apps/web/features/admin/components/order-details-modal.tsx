"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  AlertCircle,
  Trash,
} from "lucide-react";
import type { AdminOrder, OrderStatus } from "../types/order.types";
import { updateOrderStatus, deleteOrder } from "../api/orders.api";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

// ============================================================================
// ORDER DETAILS MODAL COMPONENT
// ============================================================================

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(
    null
  );

  if (!isOpen || !order) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteOrder(order.orderId);
      if (result.success) {
        onOrderUpdated?.();
        onClose();
      } else {
        alert(result.error || "Failed to delete order");
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert("An error occurred while deleting the order");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(order.orderId, {
        status: newStatus,
      });
      if (result.success) {
        onOrderUpdated?.();
        setSelectedStatus(null);
        onClose();
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusStyles: Record<OrderStatus, string> = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
      PAID: "bg-green-100 text-green-800 border-green-200",
      PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
      SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
      DELIVERED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
      CREATED: "bg-gray-100 text-gray-800 border-gray-200",
      FULFILLED: "bg-green-100 text-green-800 border-green-200",
      PARTIALLY_RETURNED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };

    return (
      <span
        className={`px-3 py-1 text-sm font-medium border rounded-lg ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
        style={{ fontFamily: "Raleway, sans-serif" }}
      >
        {status}
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

  const availableStatuses: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#BBA496]/20">
            <div>
              <h2
                className="text-2xl font-normal text-[#232D35]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Order #{order.orderNumber}
              </h2>
              <p
                className="text-sm text-[#A09B93] mt-1"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                Placed on {formatDate(order.createdAt)}
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
            {/* Status & Actions */}
            <div className="mb-6 p-4 bg-[#F8F5F2] rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-medium text-[#232D35]"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    Order Status:
                  </span>
                  {getStatusBadge(order.status)}
                </div>
                <button
                  onClick={() =>
                    setSelectedStatus(selectedStatus ? null : order.status)
                  }
                  className="text-sm font-medium text-[#232D35] hover:underline"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  Update Status
                </button>
              </div>

              {/* Status Update Dropdown */}
              {selectedStatus !== null && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-[#BBA496]/20">
                  {availableStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={isUpdating || status === order.status}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        status === order.status
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-white text-[#232D35] border border-[#BBA496] hover:bg-[#232D35] hover:text-white"
                      }`}
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="border border-[#BBA496]/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-[#8B7355]" />
                    <h3
                      className="font-medium text-[#232D35]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Customer Information
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p
                      className="text-sm text-[#232D35]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      <span className="font-medium">Name:</span>{" "}
                      {order.customerName}
                    </p>
                    <p
                      className="text-sm text-[#232D35]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      <span className="font-medium">Email:</span>{" "}
                      {order.customerEmail}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="border border-[#BBA496]/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-[#8B7355]" />
                      <h3
                        className="font-medium text-[#232D35]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Shipping Address
                      </h3>
                    </div>
                    <div
                      className="text-sm text-[#232D35] space-y-1"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      <p>
                        {order.shippingAddress.firstName}{" "}
                        {order.shippingAddress.lastName}
                      </p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p>{order.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                      {order.shippingAddress.phone && (
                        <p>{order.shippingAddress.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Billing Address */}
                {order.billingAddress && (
                  <div className="border border-[#BBA496]/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-5 h-5 text-[#8B7355]" />
                      <h3
                        className="font-medium text-[#232D35]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Billing Address
                      </h3>
                    </div>
                    <div
                      className="text-sm text-[#232D35] space-y-1"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      <p>
                        {order.billingAddress.firstName}{" "}
                        {order.billingAddress.lastName}
                      </p>
                      <p>{order.billingAddress.addressLine1}</p>
                      {order.billingAddress.addressLine2 && (
                        <p>{order.billingAddress.addressLine2}</p>
                      )}
                      <p>
                        {order.billingAddress.city},{" "}
                        {order.billingAddress.state}{" "}
                        {order.billingAddress.postalCode}
                      </p>
                      <p>{order.billingAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Shipments */}
                {order.shipments && order.shipments.length > 0 && (
                  <div className="border border-[#BBA496]/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-5 h-5 text-[#8B7355]" />
                      <h3
                        className="font-medium text-[#232D35]"
                        style={{ fontFamily: "Raleway, sans-serif" }}
                      >
                        Shipment Information
                      </h3>
                    </div>
                    {order.shipments.map((shipment) => (
                      <div key={shipment.shipmentId} className="space-y-2">
                        {shipment.carrier && (
                          <p
                            className="text-sm text-[#232D35]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            <span className="font-medium">Carrier:</span>{" "}
                            {shipment.carrier}
                          </p>
                        )}
                        {shipment.trackingNumber && (
                          <p
                            className="text-sm text-[#232D35]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            <span className="font-medium">Tracking:</span>{" "}
                            {shipment.trackingNumber}
                          </p>
                        )}
                        {shipment.shippedAt && (
                          <p
                            className="text-sm text-[#232D35]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            <span className="font-medium">Shipped:</span>{" "}
                            {formatDate(shipment.shippedAt)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Order Items */}
              <div>
                <div className="border border-[#BBA496]/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-[#8B7355]" />
                    <h3
                      className="font-medium text-[#232D35]"
                      style={{ fontFamily: "Raleway, sans-serif" }}
                    >
                      Order Items ({order.items.length})
                    </h3>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.orderItemId}
                        className="flex gap-4 pb-4 border-b border-[#BBA496]/20 last:border-0 last:pb-0"
                      >
                        {item.productSnapshot.imageUrl && (
                          <img
                            src={item.productSnapshot.imageUrl}
                            alt={item.productSnapshot.name}
                            className="w-16 h-16 object-cover rounded-lg border border-[#BBA496]/30"
                          />
                        )}
                        <div className="flex-1">
                          <p
                            className="text-sm font-medium text-[#232D35]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            {item.productSnapshot.name}
                          </p>
                          {item.productSnapshot.variantName && (
                            <p
                              className="text-xs text-[#A09B93]"
                              style={{ fontFamily: "Raleway, sans-serif" }}
                            >
                              {item.productSnapshot.variantName}
                            </p>
                          )}
                          <p
                            className="text-xs text-[#A09B93]"
                            style={{ fontFamily: "Raleway, sans-serif" }}
                          >
                            SKU: {item.productSnapshot.sku}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p
                              className="text-xs text-[#A09B93]"
                              style={{ fontFamily: "Raleway, sans-serif" }}
                            >
                              Qty: {item.quantity}
                            </p>
                            <p
                              className="text-sm font-medium text-[#232D35]"
                              style={{ fontFamily: "Raleway, sans-serif" }}
                            >
                              {formatCurrency(
                                item.subtotal ||
                                  item.productSnapshot.price * item.quantity
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div
                    className="space-y-2 pt-4 border-t border-[#BBA496]/20"
                    style={{ fontFamily: "Raleway, sans-serif" }}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A09B93]">Subtotal</span>
                      <span className="text-[#232D35]">
                        {formatCurrency(order.totals.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A09B93]">Shipping</span>
                      <span className="text-[#232D35]">
                        {formatCurrency(order.totals.shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#A09B93]">Tax</span>
                      <span className="text-[#232D35]">
                        {formatCurrency(order.totals.tax)}
                      </span>
                    </div>
                    {order.totals.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#A09B93]">Discount</span>
                        <span className="text-green-600">
                          -{formatCurrency(order.totals.discount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-medium pt-2 border-t border-[#BBA496]/20">
                      <span className="text-[#232D35]">Total</span>
                      <span className="text-[#232D35]">
                        {formatCurrency(order.totals.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-[#BBA496]/20">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600 font-medium">
                  Are you sure?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                style={{ fontFamily: "Raleway, sans-serif" }}
              >
                <Trash className="w-4 h-4" />
                Delete Order
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2 border border-[#BBA496] text-[#232D35] rounded-lg hover:bg-[#F8F5F2] transition-colors"
              style={{ fontFamily: "Raleway, sans-serif" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
