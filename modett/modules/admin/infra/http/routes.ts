import { FastifyInstance } from "fastify";
import { DashboardController } from "./controllers/dashboard.controller";
import { GetDailyStatsHandler } from "../../application/queries/get-daily-stats.query";
import { GetAlertsHandler } from "../../application/queries/get-alerts.query";
import { GetRecentActivityHandler } from "../../application/queries/get-recent-activity.query";
import { IDashboardRepository } from "../../domain/repositories/dashboard.repository.interface";

export async function registerAdminRoutes(
  fastify: FastifyInstance,
  services: {
    dashboardRepository: IDashboardRepository;
  }
) {
  // Handlers
  const getDailyStatsHandler = new GetDailyStatsHandler(
    services.dashboardRepository
  );
  const getAlertsHandler = new GetAlertsHandler(services.dashboardRepository);
  const getRecentActivityHandler = new GetRecentActivityHandler(
    services.dashboardRepository
  );

  // Controller
  const controller = new DashboardController(
    getDailyStatsHandler,
    getAlertsHandler,
    getRecentActivityHandler
  );

  // ============================================================
  // Dashboard Routes
  // ============================================================

  // Get Daily Stats (Today's Sales Summary)
  fastify.get(
    "/admin/dashboard/summary",
    {
      schema: {
        description: "Get today's sales summary (revenue, orders, average order value)",
        tags: ["Admin - Dashboard"],
        summary: "Get Daily Stats",
        response: {
          200: {
            description: "Daily statistics retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  revenue: { type: "number", description: "Today's total revenue" },
                  orders: { type: "number", description: "Number of orders today" },
                  averageOrderValue: { type: "number", description: "Average order value" },
                },
              },
            },
          },
          500: {
            description: "Server error",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    controller.getSummary.bind(controller)
  );

  // Get Dashboard Alerts (Low Stock & Pending Orders)
  fastify.get(
    "/admin/dashboard/alerts",
    {
      schema: {
        description: "Get dashboard alerts for low stock and pending orders",
        tags: ["Admin - Dashboard"],
        summary: "Get Dashboard Alerts",
        response: {
          200: {
            description: "Alerts retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  pendingOrders: { type: "number", description: "Count of pending orders" },
                  lowStock: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        variantId: { type: "string" },
                        productTitle: { type: "string" },
                        sku: { type: "string" },
                        onHand: { type: "number" },
                        threshold: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Server error",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    controller.getAlerts.bind(controller)
  );

  // Get Recent Activity (Orders & Customer Registrations)
  fastify.get(
    "/admin/dashboard/activity",
    {
      schema: {
        description: "Get recent activity (orders and customer registrations)",
        tags: ["Admin - Dashboard"],
        summary: "Get Recent Activity",
        response: {
          200: {
            description: "Recent activity retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    type: { type: "string", enum: ["order", "user"] },
                    description: { type: "string" },
                    timestamp: { type: "string", format: "date-time" },
                    referenceId: { type: "string" },
                  },
                },
              },
            },
          },
          500: {
            description: "Server error",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    controller.getActivity.bind(controller)
  );
}
