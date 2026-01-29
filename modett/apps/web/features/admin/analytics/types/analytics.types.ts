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

export interface CustomerGrowthMetric {
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
  customerGrowth: CustomerGrowthMetric[];
  orderStatusBreakdown: OrderStatusBreakdown[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  granularity?: "day" | "week" | "month";
}

export interface AnalyticsResponse {
  success: boolean;
  data?: AnalyticsOverview;
  error?: string;
}
