export interface DashboardSummary {
  revenue: number;
  orders: number;
  averageOrderValue: number;
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
