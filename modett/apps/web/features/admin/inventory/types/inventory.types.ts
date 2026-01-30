export interface StockLocation {
  locationId: string;
  type: "warehouse" | "store" | "vendor";
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface InventorySupplier {
  supplierId: string;
  name: string;
  leadTimeDays?: number;
  contacts: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
}

export interface StockItem {
  stockId: string;
  variantId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  available: number; // calculated as onHand - reserved
  lowStockThreshold?: number;
  safetyStock?: number;
  updatedAt: string;

  // Relations (often included in list/get responses)
  variant?: {
    id: string; // backend variant id
    sku: string;
    price: number;
    size?: string;
    color?: string;
    product?: {
      title: string;
      media?: Array<{
        asset?: {
          url?: string;
          publicUrl?: string;
          storageKey?: string;
        };
      }>;
    };
    attributes?: Record<string, string>; // size, color etc
  };
  location?: StockLocation;
}

export type StockStatus =
  | "healthy"
  | "warning"
  | "critical"
  | "low_stock"
  | "out_of_stock"
  | "in_stock";

export interface InventoryItem {
  id: string;
  variantId: string;
  productTitle: string;
  productImage?: string;
  sku: string;
  size?: string;
  color?: string;
  inStock: number;
  reserved: number;
  available: number;
  status: StockStatus;
  updatedAt?: string;
}

export interface InventoryFilters {
  limit?: number;
  offset?: number; // pagination usually uses page/limit but backend routes.ts showed offset
  page?: number;
  variantId?: string;
  locationId?: string;
  search?: string;
  status?: StockStatus;
  sortBy?: "available" | "onHand" | "location" | "product";
  sortOrder?: "asc" | "desc";
}

export interface StocksListResponse {
  success: boolean;
  data: {
    stocks: StockItem[];
    total: number;
  };
  error?: string;
}

export interface LocationsListResponse {
  success: boolean;
  data: {
    locations: StockLocation[];
    total: number;
  };
  error?: string;
}

export interface InventoryStatsResponse {
  success: boolean;
  data: {
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
  };
  error?: string;
}

export interface AddStockRequest {
  variantId: string;
  locationId: string;
  quantity: number;
  reason: "return" | "adjustment" | "po";
}

export interface TransferStockRequest {
  variantId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
}

export interface AdjustStockRequest {
  variantId: string;
  locationId: string;
  quantityDelta: number;
  reason: string;
}

// ============================================
// INVENTORY REPORTS TYPES
// ============================================

/**
 * Stock Level Report - Current inventory status across all products
 */
export interface StockLevelReportItem {
  variantId: string;
  productTitle: string;
  sku: string;
  locationId: string;
  locationName: string;
  onHand: number;
  reserved: number;
  available: number;
  lowStockThreshold: number | null;
  safetyStock: number | null;
  status: "healthy" | "low" | "critical" | "out_of_stock";
  costPerUnit: number;
  totalValue: number;
}

export interface StockLevelReport {
  items: StockLevelReportItem[];
  summary: {
    totalProducts: number;
    totalValue: number;
    healthyCount: number;
    lowStockCount: number;
    criticalCount: number;
    outOfStockCount: number;
  };
  generatedAt: Date | string;
}

/**
 * Stock Movement Report - Track inventory changes over time
 */
export interface StockMovementItem {
  transactionId: string;
  variantId: string;
  productTitle: string;
  sku: string;
  locationId: string;
  locationName: string;
  qtyDelta: number;
  reason: string;
  referenceType: string | null;
  referenceId: string;
  createdAt: Date | string;
  runningBalance: number;
}

export interface StockMovementReport {
  items: StockMovementItem[];
  summary: {
    totalTransactions: number;
    totalInbound: number;
    totalOutbound: number;
    netChange: number;
    mostActiveProducts: Array<{
      variantId: string;
      productTitle: string;
      sku: string;
      transactionCount: number;
    }>;
  };
  filters: {
    startDate: Date | string;
    endDate: Date | string;
    variantId?: string;
    locationId?: string;
  };
  generatedAt: Date | string;
}

/**
 * Low Stock Forecast - Predict future stockouts based on sales trends
 */
export interface LowStockForecastItem {
  variantId: string;
  productTitle: string;
  sku: string;
  locationId: string;
  locationName: string;
  currentStock: number;
  averageDailySales: number;
  daysUntilStockout: number;
  estimatedStockoutDate: Date | string | null;
  recommendedOrderQuantity: number;
  urgency: "immediate" | "urgent" | "soon" | "monitor";
}

export interface LowStockForecast {
  items: LowStockForecastItem[];
  summary: {
    immediateActionRequired: number;
    urgentCount: number;
    soonCount: number;
    monitorCount: number;
  };
  forecastPeriod: number;
  generatedAt: Date | string;
}

/**
 * Inventory Valuation - Total value of current inventory with profit analysis
 */
export interface InventoryValuationItem {
  variantId: string;
  productTitle: string;
  sku: string;
  locationId: string;
  locationName: string;
  onHand: number;
  costPerUnit: number;
  totalCost: number;
  averageSellingPrice: number;
  potentialRevenue: number;
  potentialProfit: number;
  profitMargin: number;
}

export interface InventoryValuation {
  items: InventoryValuationItem[];
  summary: {
    totalInventoryValue: number;
    totalPotentialRevenue: number;
    totalPotentialProfit: number;
    averageProfitMargin: number;
    totalUnitsInStock: number;
  };
  byLocation: Array<{
    locationId: string;
    locationName: string;
    totalValue: number;
    itemCount: number;
  }>;
  generatedAt: Date | string;
}

/**
 * Slow Moving Stock - Identify products with low turnover
 */
export interface SlowMovingStockItem {
  variantId: string;
  productTitle: string;
  sku: string;
  locationId: string;
  locationName: string;
  onHand: number;
  daysInStock: number;
  lastSoldDate: Date | string | null;
  daysSinceLastSale: number | null;
  totalSales: number;
  turnoverRate: number;
  inventoryValue: number;
  recommendation: "discount" | "promote" | "bundle" | "clearance";
}

export interface SlowMovingStockReport {
  items: SlowMovingStockItem[];
  summary: {
    totalSlowMovingValue: number;
    totalSlowMovingUnits: number;
    averageDaysInStock: number;
    recommendedActions: {
      discount: number;
      promote: number;
      bundle: number;
      clearance: number;
    };
  };
  filters: {
    minimumDaysInStock: number;
    minimumInventoryValue: number;
  };
  generatedAt: Date | string;
}

/**
 * Report API Response Wrappers
 */
export interface StockLevelReportResponse {
  success: boolean;
  data: StockLevelReport;
  error?: string;
}

export interface StockMovementReportResponse {
  success: boolean;
  data: StockMovementReport;
  error?: string;
}

export interface LowStockForecastResponse {
  success: boolean;
  data: LowStockForecast;
  error?: string;
}

export interface InventoryValuationResponse {
  success: boolean;
  data: InventoryValuation;
  error?: string;
}

export interface SlowMovingStockReportResponse {
  success: boolean;
  data: SlowMovingStockReport;
  error?: string;
}
