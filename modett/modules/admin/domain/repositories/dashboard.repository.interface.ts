import {
  DashboardSummary,
  DashboardAlerts,
  ActivityItem,
  AnalyticsOverview
} from "../types";

export interface IDashboardRepository {
  getDailyStats(): Promise<DashboardSummary>;
  getAlerts(): Promise<DashboardAlerts>;
  getRecentActivity(): Promise<ActivityItem[]>;
  getAnalyticsOverview(startDate: Date, endDate: Date, granularity: 'day' | 'week' | 'month'): Promise<AnalyticsOverview>;
}
