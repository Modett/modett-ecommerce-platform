import {
  DashboardSummary,
  DashboardAlerts,
  ActivityItem,
  AnalyticsOverview
} from "../types";
import {
  StockLevelReport,
  StockMovementReport,
  LowStockForecast,
  InventoryValuation,
  SlowMovingStockReport
} from "../inventory-report-types";

export interface IDashboardRepository {
  getDailyStats(): Promise<DashboardSummary>;
  getAlerts(): Promise<DashboardAlerts>;
  getRecentActivity(): Promise<ActivityItem[]>;
  getAnalyticsOverview(startDate: Date, endDate: Date, granularity: 'day' | 'week' | 'month'): Promise<AnalyticsOverview>;

  // Inventory Reports
  getStockLevelReport(filters?: { locationId?: string; status?: string }): Promise<StockLevelReport>;
  getStockMovementReport(startDate: Date, endDate: Date, filters?: { variantId?: string; locationId?: string }): Promise<StockMovementReport>;
  getLowStockForecast(forecastDays?: number): Promise<LowStockForecast>;
  getInventoryValuation(): Promise<InventoryValuation>;
  getSlowMovingStockReport(minimumDaysInStock?: number, minimumValue?: number): Promise<SlowMovingStockReport>;
}
