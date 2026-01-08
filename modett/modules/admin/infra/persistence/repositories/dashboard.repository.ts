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

    return {
      revenue,
      orders: orderCount,
      averageOrderValue: orderCount > 0 ? revenue / orderCount : 0,
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
}
