// ============================================================================
// INVENTORY REPORTS TYPES
// ============================================================================

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
  status: 'healthy' | 'low' | 'critical' | 'out_of_stock';
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
  generatedAt: Date;
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
  referenceId: string | null;
  createdAt: Date;
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
    startDate: Date;
    endDate: Date;
    variantId?: string;
    locationId?: string;
  };
  generatedAt: Date;
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
  estimatedStockoutDate: Date | null;
  recommendedOrderQuantity: number;
  urgency: 'immediate' | 'urgent' | 'soon' | 'monitor';
}

export interface LowStockForecast {
  items: LowStockForecastItem[];
  summary: {
    immediateActionRequired: number;
    urgentCount: number;
    soonCount: number;
    monitorCount: number;
  };
  forecastPeriod: number; // days to forecast
  generatedAt: Date;
}

/**
 * Inventory Valuation - Total value of current inventory
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
  generatedAt: Date;
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
  lastSoldDate: Date | null;
  daysSinceLastSale: number | null;
  totalSales: number;
  turnoverRate: number; // sales per day
  inventoryValue: number;
  recommendation: 'discount' | 'promote' | 'bundle' | 'clearance';
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
  generatedAt: Date;
}
