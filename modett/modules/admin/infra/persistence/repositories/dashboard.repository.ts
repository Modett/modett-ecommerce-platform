import { PrismaClient } from "@prisma/client";
import { IDashboardRepository } from "../../../domain/repositories/dashboard.repository.interface";
import {
  DashboardSummary,
  DashboardAlerts,
  ActivityItem,
} from "../../../domain/types";
import {
  StockLevelReport,
  StockMovementReport,
  LowStockForecast,
  InventoryValuation,
  SlowMovingStockReport,
  StockLevelReportItem,
  StockMovementItem,
  LowStockForecastItem,
  InventoryValuationItem,
  SlowMovingStockItem
} from "../../../domain/inventory-report-types";

export class DashboardRepositoryImpl implements IDashboardRepository {
  constructor(private prisma: PrismaClient) {}

  async getDailyStats(): Promise<DashboardSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    console.log('[Dashboard Stats] Today start:', today);
    console.log('[Dashboard Stats] Yesterday start:', yesterday);

    // Get today's orders
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
        },
        status: {
          not: "cancelled",
        },
      },
      select: {
        totals: true,
        createdAt: true,
        orderNo: true,
      },
    });

    const orderCount = orders.length;
    let revenue = 0;

    for (const order of orders) {
      const totals = order.totals as any;
      revenue += Number(totals.total || 0);
      console.log(`  - Order ${order.orderNo}: ${totals.total}, Created: ${order.createdAt}`);
    }

    // Get yesterday's orders
    const yesterdayOrders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
        status: {
          not: "cancelled",
        },
      },
      select: {
        totals: true,
        createdAt: true,
        orderNo: true,
      },
    });

    const yesterdayOrderCount = yesterdayOrders.length;
    let yesterdayRevenue = 0;

    console.log('[Dashboard Stats] Yesterday orders:');
    for (const order of yesterdayOrders) {
      const totals = order.totals as any;
      yesterdayRevenue += Number(totals.total || 0);
      console.log(`  - Order ${order.orderNo}: ${totals.total}, Created: ${order.createdAt}`);
    }

    console.log('[Dashboard Stats] Today - Orders:', orderCount, 'Revenue:', revenue);
    console.log('[Dashboard Stats] Yesterday - Orders:', yesterdayOrderCount, 'Revenue:', yesterdayRevenue);

    // Calculate percentage changes
    const revenueChange = yesterdayRevenue > 0
      ? ((revenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : revenue > 0 ? 100 : 0;

    const ordersChange = yesterdayOrderCount > 0
      ? ((orderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100
      : orderCount > 0 ? 100 : 0;

    const todayAverageOrderValue = orderCount > 0 ? revenue / orderCount : 0;
    const yesterdayAverageOrderValue = yesterdayOrderCount > 0 ? yesterdayRevenue / yesterdayOrderCount : 0;

    const averageOrderValueChange = yesterdayAverageOrderValue > 0
      ? ((todayAverageOrderValue - yesterdayAverageOrderValue) / yesterdayAverageOrderValue) * 100
      : todayAverageOrderValue > 0 ? 100 : 0;

    // Get User Stats
    const totalCustomers = await this.prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    });

    const newCustomersToday = await this.prisma.user.count({
      where: {
        role: "CUSTOMER",
        createdAt: {
          gte: today,
        },
      },
    });

    // Calculate conversion rate from analytics events (last 7 days for better sample)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const productViews = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM analytics.analytics_events
      WHERE event_type = 'product_view'
      AND created_at >= ${sevenDaysAgo}
    `;

    const purchases = await this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM analytics.analytics_events
      WHERE event_type = 'purchase'
      AND created_at >= ${sevenDaysAgo}
    `;

    const viewCount = Number(productViews[0]?.count || 0);
    const purchaseCount = Number(purchases[0]?.count || 0);
    const conversionRate = viewCount > 0 ? (purchaseCount / viewCount) * 100 : 0;

    const result = {
      revenue,
      orders: orderCount,
      averageOrderValue: todayAverageOrderValue,
      totalCustomers,
      newCustomersToday,
      revenueChange,
      ordersChange,
      averageOrderValueChange,
      conversionRate,
    };

    console.log('[Dashboard Stats] Conversion - Views:', viewCount, 'Purchases:', purchaseCount, 'Rate:', conversionRate.toFixed(2) + '%');
    console.log('[Dashboard Stats] Returning result:', JSON.stringify(result, null, 2));
    return result;
  }

  async getAlerts(): Promise<DashboardAlerts> {
    const pendingOrders = await this.prisma.order.count({
      where: {
        status: {
          in: ["created", "paid"],
        },
      },
    });

    const lowStockItems = await this.prisma.inventoryStock.findMany({
      where: {
        onHand: {
          lte: 5,
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
      take: 10,
    });

    return {
      pendingOrders,
      lowStock: lowStockItems.map((item) => ({
        variantId: item.variantId,
        productTitle: item.variant.product.title,
        sku: item.variant.sku,
        onHand: item.onHand,
        threshold: item.lowStockThreshold || 5, // Weak threshold
      })),
    };
  }

  async getRecentActivity(): Promise<ActivityItem[]> {
    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    const activities: ActivityItem[] = [];

    recentOrders.forEach((order) => {
      activities.push({
        id: `ord-${order.id}`,
        type: "order",
        description: `New order #${order.orderNo} placed by ${
          order.user?.email || "Guest"
        }`,
        timestamp: order.createdAt,
        referenceId: order.id,
      });
    });

    recentUsers.forEach((user) => {
      activities.push({
        id: `usr-${user.id}`,
        type: "user",
        description: `New customer registered: ${user.email}`,
        timestamp: user.createdAt,
        referenceId: user.id,
      });
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);
  }

  async getAnalyticsOverview(
    startDate: Date,
    endDate: Date,
    granularity: 'day' | 'week' | 'month'
  ): Promise<any> {
    // Helper function to format dates for grouping
    const formatDateForGroup = (date: Date, gran: string): string => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      switch (gran) {
        case 'day':
          return `${year}-${month}-${day}`;
        case 'month':
          return `${year}-${month}`;
        case 'week':
          // Simple week grouping (first day of week)
          const weekStart = new Date(d.setDate(d.getDate() - d.getDay()));
          return `${weekStart.getFullYear()}-W${String(Math.ceil(weekStart.getDate() / 7)).padStart(2, '0')}`;
        default:
          return `${year}-${month}-${day}`;
      }
    };

    // 1. SALES TRENDS - Get all orders and group manually
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'cancelled',
        },
      },
      select: {
        createdAt: true,
        totals: true,
      },
    });

    const salesTrendsMap = new Map<string, { revenue: number; orders: number }>();
    orders.forEach((order) => {
      const dateKey = formatDateForGroup(order.createdAt, granularity);
      const totals = order.totals as any;
      const revenue = Number(totals?.total || 0);

      const existing = salesTrendsMap.get(dateKey) || { revenue: 0, orders: 0 };
      salesTrendsMap.set(dateKey, {
        revenue: existing.revenue + revenue,
        orders: existing.orders + 1,
      });
    });

    const salesTrends = Array.from(salesTrendsMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 2. BEST SELLING PRODUCTS - Get order items with actual product/variant data
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            notIn: ['cancelled', 'refunded'],
          },
        },
      },
      select: {
        variantId: true,
        qty: true,
        productSnapshot: true,
        variant: {
          select: {
            sku: true,
            price: true,
            product: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    const productMap = new Map<string, { title: string; sku: string; units: number; revenue: number }>();
    orderItems.forEach((item) => {
      const variantId = item.variantId;
      const units = item.qty;

      // Try to get price from snapshot first, fallback to variant price
      const snapshot = item.productSnapshot as any;
      const price = Number(snapshot?.price || item.variant.price || 0);
      const revenue = price * units;

      // Get product title and SKU from the actual product/variant relations
      const title = item.variant.product.title || 'Unknown Product';
      const sku = item.variant.sku || 'N/A';

      const existing = productMap.get(variantId) || {
        title,
        sku,
        units: 0,
        revenue: 0,
      };

      productMap.set(variantId, {
        title: existing.title,
        sku: existing.sku,
        units: existing.units + units,
        revenue: existing.revenue + revenue,
      });
    });

    const bestSellingProducts = Array.from(productMap.entries())
      .map(([variantId, data]) => ({
        variantId,
        productTitle: data.title,
        sku: data.sku,
        unitsSold: data.units,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // 3. CUSTOMER GROWTH - New customers over time
    const customers = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        role: 'CUSTOMER',
      },
      select: {
        createdAt: true,
      },
    });

    const customerGrowthMap = new Map<string, number>();
    customers.forEach((customer) => {
      const dateKey = formatDateForGroup(customer.createdAt, granularity);
      const existing = customerGrowthMap.get(dateKey) || 0;
      customerGrowthMap.set(dateKey, existing + 1);
    });

    // Calculate cumulative total customers
    let cumulativeCustomers = await this.prisma.user.count({
      where: {
        role: 'CUSTOMER',
        createdAt: { lt: startDate },
      },
    });

    const customerGrowth = Array.from(customerGrowthMap.entries())
      .map(([date, newCustomers]) => {
        cumulativeCustomers += newCustomers;
        return {
          date,
          newCustomers,
          totalCustomers: cumulativeCustomers,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    // 4. ORDER STATUS BREAKDOWN - Distribution of order statuses
    const orderStatusRaw = await this.prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalOrdersForPercentage = orderStatusRaw.reduce(
      (sum, item) => sum + item._count.id,
      0
    );

    const orderStatusBreakdown = orderStatusRaw.map((item) => ({
      status: item.status,
      count: item._count.id,
      percentage:
        totalOrdersForPercentage > 0
          ? (item._count.id / totalOrdersForPercentage) * 100
          : 0,
    }));

    // 5. TOTAL METRICS - Overall summary for the period
    const totals = await this.prisma.order.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'cancelled',
        },
      },
      _count: {
        id: true,
      },
    });

    const totalOrders = totals._count.id || 0;
    const totalRevenue = salesTrends.reduce((sum, item) => sum + item.revenue, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      salesTrends,
      bestSellingProducts,
      customerGrowth,
      orderStatusBreakdown,
      totalRevenue,
      totalOrders,
      averageOrderValue,
    };
  }

  // ============================================================================
  // INVENTORY REPORTS
  // ============================================================================

  /**
   * Stock Level Report - Current inventory status across all products
   */
  async getStockLevelReport(filters?: { locationId?: string; status?: string }): Promise<StockLevelReport> {
    const whereClause: any = {};

    if (filters?.locationId) {
      whereClause.locationId = filters.locationId;
    }

    const stocks = await this.prisma.inventoryStock.findMany({
      where: whereClause,
      include: {
        variant: {
          select: {
            sku: true,
            price: true,
            product: {
              select: {
                title: true,
              },
            },
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
    });

    const items: StockLevelReportItem[] = stocks.map((stock) => {
      const available = stock.onHand - stock.reserved;
      // Use variant price as cost estimate (in production, you'd have a separate cost field)
      const costPerUnit = Number(stock.variant.price) * 0.5; // Assume 50% cost-to-price ratio
      const totalValue = stock.onHand * costPerUnit;

      let status: 'healthy' | 'low' | 'critical' | 'out_of_stock' = 'healthy';
      if (stock.onHand === 0) {
        status = 'out_of_stock';
      } else if (stock.lowStockThreshold !== null && stock.onHand <= stock.lowStockThreshold * 0.5) {
        status = 'critical';
      } else if (stock.lowStockThreshold !== null && stock.onHand <= stock.lowStockThreshold) {
        status = 'low';
      }

      return {
        variantId: stock.variantId,
        productTitle: stock.variant.product.title,
        sku: stock.variant.sku,
        locationId: stock.locationId,
        locationName: stock.location.name,
        onHand: stock.onHand,
        reserved: stock.reserved,
        available,
        lowStockThreshold: stock.lowStockThreshold,
        safetyStock: stock.safetyStock,
        status,
        costPerUnit,
        totalValue,
      };
    });

    // Apply status filter if provided
    const filteredItems = filters?.status
      ? items.filter(item => item.status === filters.status)
      : items;

    // Calculate summary
    const summary = {
      totalProducts: filteredItems.length,
      totalValue: filteredItems.reduce((sum, item) => sum + item.totalValue, 0),
      healthyCount: filteredItems.filter(item => item.status === 'healthy').length,
      lowStockCount: filteredItems.filter(item => item.status === 'low').length,
      criticalCount: filteredItems.filter(item => item.status === 'critical').length,
      outOfStockCount: filteredItems.filter(item => item.status === 'out_of_stock').length,
    };

    return {
      items: filteredItems,
      summary,
      generatedAt: new Date(),
    };
  }

  /**
   * Stock Movement Report - Track inventory changes over time
   */
  async getStockMovementReport(
    startDate: Date,
    endDate: Date,
    filters?: { variantId?: string; locationId?: string }
  ): Promise<StockMovementReport> {
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (filters?.variantId) {
      whereClause.variantId = filters.variantId;
    }
    if (filters?.locationId) {
      whereClause.locationId = filters.locationId;
    }

    const transactions = await this.prisma.inventoryTransaction.findMany({
      where: whereClause,
      include: {
        variant: {
          include: {
            product: {
              select: {
                title: true,
              },
            },
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate running balance for each variant-location combination
    const balanceMap = new Map<string, number>();

    const items: StockMovementItem[] = transactions.map((txn) => {
      const key = `${txn.variantId}-${txn.locationId}`;
      const currentBalance = balanceMap.get(key) || 0;
      const newBalance = currentBalance + txn.qtyDelta;
      balanceMap.set(key, newBalance);

      return {
        transactionId: txn.invTxnId,
        variantId: txn.variantId,
        productTitle: txn.variant.product.title,
        sku: txn.variant.sku,
        locationId: txn.locationId,
        locationName: txn.location.name,
        qtyDelta: txn.qtyDelta,
        reason: txn.reason,
        referenceType: txn.referenceType,
        referenceId: txn.referenceId,
        createdAt: txn.createdAt,
        runningBalance: newBalance,
      };
    });

    // Calculate summary
    const totalInbound = items.filter(item => item.qtyDelta > 0)
      .reduce((sum, item) => sum + item.qtyDelta, 0);
    const totalOutbound = Math.abs(items.filter(item => item.qtyDelta < 0)
      .reduce((sum, item) => sum + item.qtyDelta, 0));
    const netChange = totalInbound - totalOutbound;

    // Most active products
    const productActivityMap = new Map<string, { title: string; sku: string; count: number }>();
    items.forEach(item => {
      const existing = productActivityMap.get(item.variantId);
      if (existing) {
        existing.count++;
      } else {
        productActivityMap.set(item.variantId, {
          title: item.productTitle,
          sku: item.sku,
          count: 1,
        });
      }
    });

    const mostActiveProducts = Array.from(productActivityMap.entries())
      .map(([variantId, data]) => ({
        variantId,
        productTitle: data.title,
        sku: data.sku,
        transactionCount: data.count,
      }))
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .slice(0, 10);

    return {
      items,
      summary: {
        totalTransactions: items.length,
        totalInbound,
        totalOutbound,
        netChange,
        mostActiveProducts,
      },
      filters: {
        startDate,
        endDate,
        variantId: filters?.variantId,
        locationId: filters?.locationId,
      },
      generatedAt: new Date(),
    };
  }

  /**
   * Low Stock Forecast - Predict future stockouts based on sales trends
   */
  async getLowStockForecast(forecastDays: number = 30): Promise<LowStockForecast> {
    // Get current stock levels
    const stocks = await this.prisma.inventoryStock.findMany({
      where: {
        onHand: {
          gt: 0, // Only products with stock
        },
      },
      include: {
        variant: {
          select: {
            sku: true,
            product: {
              select: {
                title: true,
              },
            },
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get sales data for the past 30 days to calculate average daily sales
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await this.prisma.orderItem.groupBy({
      by: ['variantId'],
      where: {
        order: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
          status: {
            notIn: ['cancelled', 'refunded'],
          },
        },
      },
      _sum: {
        qty: true,
      },
    });

    const salesMap = new Map(
      salesData.map(item => [item.variantId, Number(item._sum.qty || 0)])
    );

    const items: LowStockForecastItem[] = [];

    for (const stock of stocks) {
      const totalSalesLast30Days = salesMap.get(stock.variantId) || 0;
      const averageDailySales = totalSalesLast30Days / 30;

      // Skip if no sales history
      if (averageDailySales === 0) continue;

      const available = stock.onHand - stock.reserved;
      const daysUntilStockout = averageDailySales > 0 ? available / averageDailySales : 999;

      // Only include items that will run out within forecast period
      if (daysUntilStockout > forecastDays) continue;

      const estimatedStockoutDate = new Date();
      estimatedStockoutDate.setDate(estimatedStockoutDate.getDate() + Math.floor(daysUntilStockout));

      // Calculate recommended order quantity (enough for next 30 days + safety stock)
      const recommendedOrderQuantity = Math.max(
        Math.ceil(averageDailySales * 30) - available,
        stock.safetyStock || 0
      );

      let urgency: 'immediate' | 'urgent' | 'soon' | 'monitor' = 'monitor';
      if (daysUntilStockout <= 3) {
        urgency = 'immediate';
      } else if (daysUntilStockout <= 7) {
        urgency = 'urgent';
      } else if (daysUntilStockout <= 14) {
        urgency = 'soon';
      }

      items.push({
        variantId: stock.variantId,
        productTitle: stock.variant.product.title,
        sku: stock.variant.sku,
        locationId: stock.locationId,
        locationName: stock.location.name,
        currentStock: available,
        averageDailySales,
        daysUntilStockout: Math.floor(daysUntilStockout),
        estimatedStockoutDate: daysUntilStockout < 999 ? estimatedStockoutDate : null,
        recommendedOrderQuantity,
        urgency,
      });
    }

    // Sort by urgency
    items.sort((a, b) => {
      const urgencyOrder = { immediate: 0, urgent: 1, soon: 2, monitor: 3 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

    const summary = {
      immediateActionRequired: items.filter(item => item.urgency === 'immediate').length,
      urgentCount: items.filter(item => item.urgency === 'urgent').length,
      soonCount: items.filter(item => item.urgency === 'soon').length,
      monitorCount: items.filter(item => item.urgency === 'monitor').length,
    };

    return {
      items,
      summary,
      forecastPeriod: forecastDays,
      generatedAt: new Date(),
    };
  }

  /**
   * Inventory Valuation - Total value of current inventory
   */
  async getInventoryValuation(): Promise<InventoryValuation> {
    const stocks = await this.prisma.inventoryStock.findMany({
      where: {
        onHand: {
          gt: 0,
        },
      },
      include: {
        variant: {
          select: {
            sku: true,
            price: true,
            product: {
              select: {
                title: true,
              },
            },
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
    });

    const items: InventoryValuationItem[] = stocks.map((stock) => {
      const averageSellingPrice = Number(stock.variant.price);
      // Estimate cost as 50% of selling price (in production, you'd have a separate cost field)
      const costPerUnit = averageSellingPrice * 0.5;
      const totalCost = stock.onHand * costPerUnit;
      const potentialRevenue = stock.onHand * averageSellingPrice;
      const potentialProfit = potentialRevenue - totalCost;
      const profitMargin = potentialRevenue > 0 ? (potentialProfit / potentialRevenue) * 100 : 0;

      return {
        variantId: stock.variantId,
        productTitle: stock.variant.product.title,
        sku: stock.variant.sku,
        locationId: stock.locationId,
        locationName: stock.location.name,
        onHand: stock.onHand,
        costPerUnit,
        totalCost,
        averageSellingPrice,
        potentialRevenue,
        potentialProfit,
        profitMargin,
      };
    });

    // Summary
    const totalInventoryValue = items.reduce((sum, item) => sum + item.totalCost, 0);
    const totalPotentialRevenue = items.reduce((sum, item) => sum + item.potentialRevenue, 0);
    const totalPotentialProfit = items.reduce((sum, item) => sum + item.potentialProfit, 0);
    const averageProfitMargin = totalPotentialRevenue > 0
      ? (totalPotentialProfit / totalPotentialRevenue) * 100
      : 0;
    const totalUnitsInStock = items.reduce((sum, item) => sum + item.onHand, 0);

    // By location
    const locationMap = new Map<string, { name: string; value: number; count: number }>();
    items.forEach(item => {
      const existing = locationMap.get(item.locationId);
      if (existing) {
        existing.value += item.totalCost;
        existing.count++;
      } else {
        locationMap.set(item.locationId, {
          name: item.locationName,
          value: item.totalCost,
          count: 1,
        });
      }
    });

    const byLocation = Array.from(locationMap.entries()).map(([locationId, data]) => ({
      locationId,
      locationName: data.name,
      totalValue: data.value,
      itemCount: data.count,
    }));

    return {
      items,
      summary: {
        totalInventoryValue,
        totalPotentialRevenue,
        totalPotentialProfit,
        averageProfitMargin,
        totalUnitsInStock,
      },
      byLocation,
      generatedAt: new Date(),
    };
  }

  /**
   * Slow Moving Stock - Identify products with low turnover
   */
  async getSlowMovingStockReport(
    minimumDaysInStock: number = 90,
    minimumValue: number = 0
  ): Promise<SlowMovingStockReport> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - minimumDaysInStock);

    // Get all stock with inventory
    const stocks = await this.prisma.inventoryStock.findMany({
      where: {
        onHand: {
          gt: 0,
        },
      },
      include: {
        variant: {
          select: {
            sku: true,
            price: true,
            createdAt: true,
            product: {
              select: {
                title: true,
              },
            },
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get sales data for each variant - use Order's createdAt
    const variantIds = stocks.map(s => s.variantId);

    // Get the most recent order for each variant
    const recentOrders = await this.prisma.order.findMany({
      where: {
        items: {
          some: {
            variantId: {
              in: variantIds,
            },
          },
        },
        status: {
          notIn: ['cancelled', 'refunded'],
        },
      },
      include: {
        items: {
          where: {
            variantId: {
              in: variantIds,
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Build sales map
    const salesMap = new Map<string, { totalSales: number; lastSoldDate: Date | null }>();

    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = salesMap.get(item.variantId);
        if (existing) {
          existing.totalSales += item.qty;
          if (!existing.lastSoldDate || order.createdAt > existing.lastSoldDate) {
            existing.lastSoldDate = order.createdAt;
          }
        } else {
          salesMap.set(item.variantId, {
            totalSales: item.qty,
            lastSoldDate: order.createdAt,
          });
        }
      });
    });

    const items: SlowMovingStockItem[] = [];

    for (const stock of stocks) {
      const costPerUnit = Number(stock.variant.price) * 0.5; // Estimate cost
      const inventoryValue = stock.onHand * costPerUnit;

      // Skip if below minimum value threshold
      if (inventoryValue < minimumValue) continue;

      const salesInfo = salesMap.get(stock.variantId);
      const totalSales = salesInfo?.totalSales || 0;
      const lastSoldDate = salesInfo?.lastSoldDate || null;

      // Calculate days in stock
      const productCreatedAt = stock.variant.createdAt;
      const daysInStock = Math.floor(
        (new Date().getTime() - productCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Skip if not in stock long enough
      if (daysInStock < minimumDaysInStock) continue;

      // Calculate days since last sale
      const daysSinceLastSale = lastSoldDate
        ? Math.floor((new Date().getTime() - lastSoldDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      // Calculate turnover rate (sales per day)
      const turnoverRate = daysInStock > 0 ? totalSales / daysInStock : 0;

      // Determine recommendation
      let recommendation: 'discount' | 'promote' | 'bundle' | 'clearance' = 'promote';
      if (turnoverRate < 0.01 && daysInStock > 180) {
        recommendation = 'clearance';
      } else if (turnoverRate < 0.02 && daysInStock > 120) {
        recommendation = 'discount';
      } else if (turnoverRate < 0.05) {
        recommendation = 'bundle';
      }

      items.push({
        variantId: stock.variantId,
        productTitle: stock.variant.product.title,
        sku: stock.variant.sku,
        locationId: stock.locationId,
        locationName: stock.location.name,
        onHand: stock.onHand,
        daysInStock,
        lastSoldDate,
        daysSinceLastSale,
        totalSales,
        turnoverRate,
        inventoryValue,
        recommendation,
      });
    }

    // Sort by inventory value (highest first)
    items.sort((a, b) => b.inventoryValue - a.inventoryValue);

    const summary = {
      totalSlowMovingValue: items.reduce((sum, item) => sum + item.inventoryValue, 0),
      totalSlowMovingUnits: items.reduce((sum, item) => sum + item.onHand, 0),
      averageDaysInStock: items.length > 0
        ? items.reduce((sum, item) => sum + item.daysInStock, 0) / items.length
        : 0,
      recommendedActions: {
        discount: items.filter(item => item.recommendation === 'discount').length,
        promote: items.filter(item => item.recommendation === 'promote').length,
        bundle: items.filter(item => item.recommendation === 'bundle').length,
        clearance: items.filter(item => item.recommendation === 'clearance').length,
      },
    };

    return {
      items,
      summary,
      filters: {
        minimumDaysInStock,
        minimumInventoryValue: minimumValue,
      },
      generatedAt: new Date(),
    };
  }
}
