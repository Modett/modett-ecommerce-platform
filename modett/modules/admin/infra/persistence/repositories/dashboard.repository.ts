import { PrismaClient } from "@prisma/client";
import { IDashboardRepository } from "../../../domain/repositories/dashboard.repository.interface";
import {
  DashboardSummary,
  DashboardAlerts,
  ActivityItem,
} from "../../../domain/types";

export class DashboardRepositoryImpl implements IDashboardRepository {
  constructor(private prisma: PrismaClient) {}

  async getDailyStats(): Promise<DashboardSummary> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      },
    });

    const orderCount = orders.length;
    let revenue = 0;

    for (const order of orders) {
      const totals = order.totals as any;
      revenue += Number(totals.total || 0);
    }

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

    return {
      revenue,
      orders: orderCount,
      averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
      totalCustomers,
      newCustomersToday,
    };
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
}
