export interface DashboardSummary {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomersToday: number;
}

export interface StockAlertItem {
  variantId: string;
  productTitle: string;
  sku: string;
  onHand: number;
  threshold: number;
}

export interface ActivityItem {
  id: string;
  type: "order" | "user";
  description: string;
  timestamp: Date;
  referenceId?: string;
}

export interface DashboardAlerts {
  lowStock: StockAlertItem[];
  pendingOrders: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface SalesTrendItem {
  date: string;
  revenue: number;
  orders: number;
}

export interface BestSellingProduct {
  variantId: string;
  productTitle: string;
  sku: string;
  unitsSold: number;
  revenue: number;
}

export interface CustomerGrowthItem {
  date: string;
  newCustomers: number;
  totalCustomers: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface AnalyticsOverview {
  salesTrends: SalesTrendItem[];
  bestSellingProducts: BestSellingProduct[];
  customerGrowth: CustomerGrowthItem[];
  orderStatusBreakdown: OrderStatusBreakdown[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}
