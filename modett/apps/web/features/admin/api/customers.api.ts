// ============================================================================
// ADMIN CUSTOMERS API
// ============================================================================

import axios from "axios";
import type {
  CustomerFilters,
  CustomersListResponse,
  CustomerDetailsResponse,
  UpdateCustomerStatusRequest,
  UpdateCustomerStatusResponse,
} from "../types/customer.types";

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
 * Get all customers with filters and pagination (Admin only)
 */
export const getCustomers = async (
  filters: CustomerFilters = {}
): Promise<CustomersListResponse> => {
  try {
    const { data } = await adminApiClient.get("/admin/users", {
      params: {
        search: filters.search,
        role: filters.role,
        status: filters.status,
        emailVerified: filters.emailVerified,
        page: filters.page || 1,
        limit: filters.limit || 20,
        sortBy: filters.sortBy || "createdAt",
        sortOrder: filters.sortOrder || "desc",
      },
    });

    return data;
  } catch (error: any) {
    const errorData = error.response?.data;
    console.error("Get customers error:", {
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
        users: [],
        pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      },
      error: errorData?.error || "Failed to fetch customers",
    };
  }
};

/**
 * Get single customer by ID (Admin only)
 */
export const getCustomerById = async (
  userId: string
): Promise<CustomerDetailsResponse> => {
  try {
    const { data } = await adminApiClient.get(`/users/${userId}`);
    return data;
  } catch (error: any) {
    console.error("Get customer by ID error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch customer details",
    };
  }
};

/**
 * Update customer status (Admin only)
 * Note: This endpoint may need to be created on the backend
 */
export const updateCustomerStatus = async (
  userId: string,
  statusData: UpdateCustomerStatusRequest
): Promise<UpdateCustomerStatusResponse> => {
  try {
    const { data } = await adminApiClient.patch(
      `/users/${userId}/status`,
      statusData
    );
    return data;
  } catch (error: any) {
    console.error("Update customer status error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update customer status",
    };
  }
};

/**
 * Delete customer (Admin only)
 */
export const deleteCustomer = async (
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data } = await adminApiClient.delete(`/users/${userId}`);
    return data;
  } catch (error: any) {
    console.error("Delete customer error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to delete customer",
    };
  }
};

/**
 * Update customer role (Admin only)
 */
export const updateCustomerRole = async (
  userId: string,
  role: string,
  reason?: string
): Promise<{
  success: boolean;
  data?: { userId: string; role: string };
  error?: string;
}> => {
  try {
    const { data } = await adminApiClient.patch(`/users/${userId}/role`, {
      role,
      reason,
    });
    return data;
  } catch (error: any) {
    console.error("Update customer role error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update customer role",
    };
  }
};

/**
 * Toggle customer email verification status (Admin only)
 */
export const toggleCustomerEmailVerification = async (
  userId: string,
  isVerified: boolean,
  reason?: string
): Promise<{
  success: boolean;
  data?: { userId: string; isVerified: boolean };
  error?: string;
}> => {
  try {
    const { data } = await adminApiClient.patch(
      `/users/${userId}/email-verification`,
      {
        isVerified,
        reason,
      }
    );
    return data;
  } catch (error: any) {
    console.error("Toggle email verification error:", error);
    return {
      success: false,
      error:
        error.response?.data?.error || "Failed to update verification status",
    };
  }
};
