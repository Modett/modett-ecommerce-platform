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

import { backendApiClient as adminApiClient } from "../../../../lib/backend-api-client";

/**
 * Get all stocks with filters/pagination
 */
export const getStocks = async (
  filters: InventoryFilters = {},
): Promise<StocksListResponse> => {
  try {
    const { data } = await adminApiClient.get("/inventory/stocks", {
      params: {
        limit: filters.limit || 20,
        offset: filters.offset || 0,
        search: filters.search,
        status: filters.status,
        locationId: filters.locationId,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
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
  request: AddStockRequest,
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Backend expects { variantId, locationId, quantity, reason }
    const { data } = await adminApiClient.post(
      "/inventory/stocks/add",
      request,
    );
    return {
      success: true, // Backend returns 201 created
    };
  } catch (error: any) {
    console.error("Add stock error:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add stock",
    };
  }
};

/**
 * Adjust stock
 */
export const adjustStock = async (
  request: import("../types/inventory.types").AdjustStockRequest,
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
  request: TransferStockRequest,
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

// ============================================================================
// INVENTORY REPORTS API
// ============================================================================

import type {
  StockLevelReportResponse,
  StockMovementReportResponse,
  LowStockForecastResponse,
  InventoryValuationResponse,
  SlowMovingStockReportResponse,
} from "../types/inventory.types";

/**
 * Get Stock Level Report - Current inventory status across all products
 */
export const getStockLevelReport = async (filters?: {
  locationId?: string;
  status?: "healthy" | "low" | "critical" | "out_of_stock";
}): Promise<StockLevelReportResponse> => {
  try {
    const { data } = await adminApiClient.get(
      "/admin/reports/inventory/stock-level",
      {
        params: filters,
      },
    );
    return data;
  } catch (error: any) {
    console.error("Get stock level report error:", error);
    return {
      success: false,
      data: {
        items: [],
        summary: {
          totalProducts: 0,
          totalValue: 0,
          healthyCount: 0,
          lowStockCount: 0,
          criticalCount: 0,
          outOfStockCount: 0,
        },
        generatedAt: new Date().toISOString(),
      },
      error:
        error.response?.data?.error || "Failed to fetch stock level report",
    };
  }
};

/**
 * Get Stock Movement Report - Track inventory changes over time
 */
export const getStockMovementReport = async (
  startDate: string,
  endDate: string,
  filters?: { variantId?: string; locationId?: string },
): Promise<StockMovementReportResponse> => {
  try {
    const { data } = await adminApiClient.get(
      "/admin/reports/inventory/stock-movement",
      {
        params: {
          startDate,
          endDate,
          ...filters,
        },
      },
    );
    return data;
  } catch (error: any) {
    console.error("Get stock movement report error:", error);
    return {
      success: false,
      data: {
        items: [],
        summary: {
          totalTransactions: 0,
          totalInbound: 0,
          totalOutbound: 0,
          netChange: 0,
          mostActiveProducts: [],
        },
        filters: { startDate, endDate, ...filters },
        generatedAt: new Date().toISOString(),
      },
      error:
        error.response?.data?.error || "Failed to fetch stock movement report",
    };
  }
};

/**
 * Get Low Stock Forecast - Predict future stockouts based on sales trends
 */
export const getLowStockForecast = async (
  forecastDays: number = 30,
): Promise<LowStockForecastResponse> => {
  try {
    const { data } = await adminApiClient.get(
      "/admin/reports/inventory/low-stock-forecast",
      {
        params: { forecastDays },
      },
    );
    return data;
  } catch (error: any) {
    console.error("Get low stock forecast error:", error);
    return {
      success: false,
      data: {
        items: [],
        summary: {
          immediateActionRequired: 0,
          urgentCount: 0,
          soonCount: 0,
          monitorCount: 0,
        },
        forecastPeriod: forecastDays,
        generatedAt: new Date().toISOString(),
      },
      error:
        error.response?.data?.error || "Failed to fetch low stock forecast",
    };
  }
};

/**
 * Get Inventory Valuation - Total value of current inventory
 */
export const getInventoryValuation =
  async (): Promise<InventoryValuationResponse> => {
    try {
      const { data } = await adminApiClient.get(
        "/admin/reports/inventory/valuation",
      );
      return data;
    } catch (error: any) {
      console.error("Get inventory valuation error:", error);
      return {
        success: false,
        data: {
          items: [],
          summary: {
            totalInventoryValue: 0,
            totalPotentialRevenue: 0,
            totalPotentialProfit: 0,
            averageProfitMargin: 0,
            totalUnitsInStock: 0,
          },
          byLocation: [],
          generatedAt: new Date().toISOString(),
        },
        error:
          error.response?.data?.error || "Failed to fetch inventory valuation",
      };
    }
  };

/**
 * Get Slow Moving Stock Report - Identify products with low turnover
 */
export const getSlowMovingStock = async (
  minimumDaysInStock: number = 90,
  minimumValue: number = 0,
): Promise<SlowMovingStockReportResponse> => {
  try {
    const { data } = await adminApiClient.get(
      "/admin/reports/inventory/slow-moving",
      {
        params: { minimumDaysInStock, minimumValue },
      },
    );
    return data;
  } catch (error: any) {
    console.error("Get slow moving stock error:", error);
    return {
      success: false,
      data: {
        items: [],
        summary: {
          totalSlowMovingValue: 0,
          totalSlowMovingUnits: 0,
          averageDaysInStock: 0,
          recommendedActions: {
            discount: 0,
            promote: 0,
            bundle: 0,
            clearance: 0,
          },
        },
        filters: { minimumDaysInStock, minimumInventoryValue: minimumValue },
        generatedAt: new Date().toISOString(),
      },
      error:
        error.response?.data?.error ||
        "Failed to fetch slow moving stock report",
    };
  }
};
