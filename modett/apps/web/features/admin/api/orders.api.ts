// ============================================================================
// ADMIN ORDERS API
// ============================================================================

import axios from "axios";
import type {
  OrderFilters,
  OrdersListResponse,
  OrderDetailsResponse,
  UpdateOrderStatusRequest,
  UpdateOrderStatusResponse,
} from "../types/order.types";

// Create axios instance for admin API
const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Add auth token interceptor
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get all orders with filters and pagination (Admin only)
 */
export const getOrders = async (
  filters: OrderFilters = {}
): Promise<OrdersListResponse> => {
  try {
    const { data } = await adminApiClient.get("/orders", {
      params: {
        status: filters.status,
        search: filters.search,
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: filters.page || 1,
        limit: filters.limit || 20,
        sortBy: filters.sortBy || "createdAt",
        sortOrder: filters.sortOrder || "desc",
      },
    });

    return data;
  } catch (error: any) {
    const errorData = error.response?.data;
    console.error("Get orders error:", {
      status: error.response?.status,
      data: errorData,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.warn(
        "Authentication failed. Please try logging out and logging back in."
      );
    }

    return {
      success: false,
      data: {
        orders: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      },
      error: errorData?.error || "Failed to fetch orders",
    };
  }
};

/**
 * Get single order by ID (Admin only)
 */
export const getOrderById = async (
  orderId: string
): Promise<OrderDetailsResponse> => {
  try {
    const { data } = await adminApiClient.get(`/orders/${orderId}`);
    return data;
  } catch (error: any) {
    console.error("Get order by ID error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch order details",
    };
  }
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (
  orderId: string,
  statusData: UpdateOrderStatusRequest
): Promise<UpdateOrderStatusResponse> => {
  try {
    const { data } = await adminApiClient.patch(
      `/orders/${orderId}/status`,
      statusData
    );
    return data;
  } catch (error: any) {
    console.error("Update order status error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update order status",
    };
  }
};

/**
 * Cancel order (Admin only)
 */
export const cancelOrder = async (
  orderId: string,
  reason?: string
): Promise<UpdateOrderStatusResponse> => {
  return updateOrderStatus(orderId, {
    status: "CANCELLED",
    notes: reason,
  });
};

/**
 * Delete order (Admin only)
 */
export const deleteOrder = async (
  orderId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data } = await adminApiClient.delete(`/orders/${orderId}`);
    return data;
  } catch (error: any) {
    console.error("Delete order error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to delete order",
    };
  }
};
