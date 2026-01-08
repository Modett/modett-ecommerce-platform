import { DashboardSummary, DashboardAlerts, ActivityItem } from "../types";

export interface IDashboardRepository {
  getDailyStats(): Promise<DashboardSummary>;
  getAlerts(): Promise<DashboardAlerts>;
  getRecentActivity(): Promise<ActivityItem[]>;
}
