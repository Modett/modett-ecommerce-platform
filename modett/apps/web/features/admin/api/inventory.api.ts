// ============================================================================
// ADMIN INVENTORY API
// ============================================================================

import axios from "axios";
import type {
  InventoryFilters,
  StocksListResponse,
  LocationsListResponse,
  AddStockRequest,
  TransferStockRequest,
} from "../types/inventory.types";

// Create axios instance for admin API (reusing logic but separate file for clarity)
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
 * Get all stocks with filters/pagination
 */
export const getStocks = async (
  filters: InventoryFilters = {}
): Promise<StocksListResponse> => {
  try {
    const { data } = await adminApiClient.get("/inventory/stocks", {
      params: {
        limit: filters.limit || 20,
        offset: filters.offset || 0,
        search: filters.search,
      },
    });

    return data;
  } catch (error: any) {
    console.error("Get stocks error:", error);
    return {
      success: false,
      data: {
        stocks: [],
        total: 0,
      },
      error: error.response?.data?.error || "Failed to fetch stocks",
    };
  }
};

/**
 * Get inventory stats
 */
export const getInventoryStats = async (): Promise<
  import("../types/inventory.types").InventoryStatsResponse
> => {
  try {
    const { data } = await adminApiClient.get("/inventory/stocks/stats");
    return data;
  } catch (error: any) {
    console.error("Get inventory stats error:", error);
    return {
      success: false,
      data: {
        totalItems: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        totalValue: 0,
      },
      error: error.response?.data?.error || "Failed to fetch inventory stats",
    };
  }
};

/**
 * Get all locations
 */
export const getLocations = async (): Promise<LocationsListResponse> => {
  try {
    const { data } = await adminApiClient.get("/inventory/locations", {
      params: { limit: 100 },
    });
    return data;
  } catch (error: any) {
    console.error("Get locations error:", error);
    return {
      success: false,
      data: {
        locations: [],
        total: 0,
      },
      error: error.response?.data?.error || "Failed to fetch locations",
    };
  }
};

/**
 * Add stock (Receive Inventory)
 */
export const addStock = async (
  request: AddStockRequest
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Backend expects { variantId, locationId, quantity, reason }
    const { data } = await adminApiClient.post(
      "/inventory/stocks/add",
      request
    );
    return {
      success: true, // Backend returns 201 created
    };
  } catch (error: any) {
    console.error("Add stock error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to add stock",
    };
  }
};

/**
 * Adjust stock
 */
export const adjustStock = async (
  request: import("../types/inventory.types").AdjustStockRequest
): Promise<{ success: boolean; error?: string }> => {
  try {
    await adminApiClient.post("/inventory/stocks/adjust", request);
    return { success: true };
  } catch (error: any) {
    console.error("Adjust stock error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to adjust stock",
    };
  }
};

/**
 * Transfer stock
 */
export const transferStock = async (
  request: TransferStockRequest
): Promise<{ success: boolean; error?: string }> => {
  try {
    await adminApiClient.post("/inventory/stocks/transfer", request);
    return { success: true };
  } catch (error: any) {
    console.error("Transfer stock error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to transfer stock",
    };
  }
};
