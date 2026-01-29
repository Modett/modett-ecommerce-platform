import { FastifyInstance } from "fastify";
import { DashboardController } from "./controllers/dashboard.controller";
import { GetDailyStatsHandler } from "../../application/queries/get-daily-stats.query";
import { GetAlertsHandler } from "../../application/queries/get-alerts.query";
import { GetRecentActivityHandler } from "../../application/queries/get-recent-activity.query";
import { GetAnalyticsHandler } from "../../application/queries/get-analytics.query";
import { SettingsController } from "./controllers/settings.controller";
import { SettingsService } from "../../application/services/settings.service";
import { IDashboardRepository } from "../../domain/repositories/dashboard.repository.interface";
import { authenticateAdmin } from "../../../user-management/infra/http/middleware/auth.middleware";

export async function registerAdminRoutes(
  fastify: FastifyInstance,
  services: {
    dashboardRepository: IDashboardRepository;
    settingsService: SettingsService;
  },
) {
  // Handlers
  const getDailyStatsHandler = new GetDailyStatsHandler(
    services.dashboardRepository,
  );
  const getAlertsHandler = new GetAlertsHandler(services.dashboardRepository);
  const getRecentActivityHandler = new GetRecentActivityHandler(
    services.dashboardRepository,
  );
  const getAnalyticsHandler = new GetAnalyticsHandler(
    services.dashboardRepository,
  );

  // Controller
  const controller = new DashboardController(
    getDailyStatsHandler,
    getAlertsHandler,
    getRecentActivityHandler,
    getAnalyticsHandler,
  );

  // ============================================================
  // Dashboard Routes
  // ============================================================

  // Get Daily Stats (Today's Sales Summary)
  fastify.get(
    "/admin/dashboard/summary",
    {
      schema: {
        description:
          "Get today's sales summary (revenue, orders, average order value)",
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
                  revenue: {
                    type: "number",
                    description: "Today's total revenue",
                  },
                  orders: {
                    type: "number",
                    description: "Number of orders today",
                  },
                  averageOrderValue: {
                    type: "number",
                    description: "Average order value",
                  },
                  totalCustomers: {
                    type: "number",
                    description: "Total number of customers",
                  },
                  newCustomersToday: {
                    type: "number",
                    description: "New customers registered today",
                  },
                  revenueChange: {
                    type: "number",
                    description: "Percentage change in revenue from yesterday",
                  },
                  ordersChange: {
                    type: "number",
                    description: "Percentage change in orders from yesterday",
                  },
                  averageOrderValueChange: {
                    type: "number",
                    description: "Percentage change in average order value from yesterday",
                  },
                  conversionRate: {
                    type: "number",
                    description: "Conversion rate (purchases / product views) over last 7 days",
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
    controller.getSummary.bind(controller),
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
                  pendingOrders: {
                    type: "number",
                    description: "Count of pending orders",
                  },
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
    controller.getAlerts.bind(controller),
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
    controller.getActivity.bind(controller),
  );

  // Get Analytics Overview
  fastify.get(
    "/admin/analytics",
    {
      schema: {
        description:
          "Get comprehensive analytics data including sales trends, best-selling products, customer growth, and order status breakdown",
        tags: ["Admin - Analytics"],
        summary: "Get Analytics Overview",
        querystring: {
          type: "object",
          properties: {
            startDate: {
              type: "string",
              format: "date-time",
              description:
                "Start date for analytics (ISO 8601). Defaults to 30 days ago.",
            },
            endDate: {
              type: "string",
              format: "date-time",
              description:
                "End date for analytics (ISO 8601). Defaults to today.",
            },
            granularity: {
              type: "string",
              enum: ["day", "week", "month"],
              default: "day",
              description: "Time granularity for trends",
            },
          },
        },
        response: {
          200: {
            description: "Analytics data retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  salesTrends: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string" },
                        revenue: { type: "number" },
                        orders: { type: "number" },
                      },
                    },
                  },
                  bestSellingProducts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        variantId: { type: "string" },
                        productTitle: { type: "string" },
                        sku: { type: "string" },
                        unitsSold: { type: "number" },
                        revenue: { type: "number" },
                      },
                    },
                  },
                  customerGrowth: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        date: { type: "string" },
                        newCustomers: { type: "number" },
                        totalCustomers: { type: "number" },
                      },
                    },
                  },
                  orderStatusBreakdown: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        status: { type: "string" },
                        count: { type: "number" },
                        percentage: { type: "number" },
                      },
                    },
                  },
                  totalRevenue: { type: "number" },
                  totalOrders: { type: "number" },
                  averageOrderValue: { type: "number" },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
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
    controller.getAnalytics.bind(controller),
  );
  // ============================================================
  // Settings Routes
  // ============================================================

  const settingsController = new SettingsController(services.settingsService);

  // Get All Settings (Admin)
  fastify.get(
    "/admin/settings",
    {
      schema: {
        tags: ["Admin - Settings"],
        summary: "Get all system settings",
        response: {
          200: {
            description: "Settings retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin,
    },
    settingsController.getAll.bind(settingsController),
  );

  // Update Settings Bulk (Admin)
  fastify.put(
    "/admin/settings",
    {
      schema: {
        tags: ["Admin - Settings"],
        summary: "Update settings in bulk",
        body: {
          type: "object",
          required: ["settings"],
          properties: {
            settings: {
              type: "array",
              items: {
                type: "object",
                required: ["key", "value"],
                properties: {
                  key: { type: "string" },
                  value: { type: ["string", "number", "boolean", "object"] },
                },
              },
            },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
            },
          },
        },
      },
      preHandler: authenticateAdmin,
    },
    settingsController.updateBulk.bind(settingsController),
  );

  // Get Public Context (Storefront)
  fastify.get(
    "/public/context",
    {
      schema: {
        tags: ["Public - Context"],
        summary: "Get public store context (settings)",
        response: {
          200: {
            type: "object",
            additionalProperties: true, // Dynamic key-value pairs
          },
        },
      },
    },
    settingsController.getPublic.bind(settingsController),
  );

  // ============================================================
  // Inventory Reports Routes
  // ============================================================

  // Stock Level Report
  fastify.get(
    "/admin/reports/inventory/stock-level",
    {
      schema: {
        description: "Get current inventory status across all products",
        tags: ["Admin - Inventory Reports"],
        summary: "Stock Level Report",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            locationId: { type: "string" },
            status: { type: "string", enum: ["healthy", "low", "critical", "out_of_stock"] },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin,
    },
    async (request, reply) => {
      try {
        const { locationId, status } = request.query as any;
        console.log('[Stock Level Report] Filters:', { locationId, status });
        const report = await services.dashboardRepository.getStockLevelReport({ locationId, status });
        console.log('[Stock Level Report] Report generated:', {
          itemCount: report.items.length,
          summary: report.summary
        });
        return reply.send({ success: true, data: report });
      } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );

  // Stock Movement Report
  fastify.get(
    "/admin/reports/inventory/stock-movement",
    {
      schema: {
        description: "Track inventory changes over time",
        tags: ["Admin - Inventory Reports"],
        summary: "Stock Movement Report",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          required: ["startDate", "endDate"],
          properties: {
            startDate: { type: "string", format: "date-time" },
            endDate: { type: "string", format: "date-time" },
            variantId: { type: "string" },
            locationId: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin,
    },
    async (request, reply) => {
      try {
        const { startDate, endDate, variantId, locationId } = request.query as any;
        const report = await services.dashboardRepository.getStockMovementReport(
          new Date(startDate),
          new Date(endDate),
          { variantId, locationId }
        );
        return reply.send({ success: true, data: report });
      } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );

  // Low Stock Forecast
  fastify.get(
    "/admin/reports/inventory/low-stock-forecast",
    {
      schema: {
        description: "Predict future stockouts based on sales trends",
        tags: ["Admin - Inventory Reports"],
        summary: "Low Stock Forecast",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            forecastDays: { type: "number", default: 30 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin,
    },
    async (request, reply) => {
      try {
        const { forecastDays } = request.query as any;
        const report = await services.dashboardRepository.getLowStockForecast(forecastDays);
        return reply.send({ success: true, data: report });
      } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );

  // Inventory Valuation
  fastify.get(
    "/admin/reports/inventory/valuation",
    {
      schema: {
        description: "Total value of current inventory",
        tags: ["Admin - Inventory Reports"],
        summary: "Inventory Valuation Report",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin,
    },
    async (request, reply) => {
      try {
        const report = await services.dashboardRepository.getInventoryValuation();
        return reply.send({ success: true, data: report });
      } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );

  // Slow Moving Stock Report
  fastify.get(
    "/admin/reports/inventory/slow-moving",
    {
      schema: {
        description: "Identify products with low turnover",
        tags: ["Admin - Inventory Reports"],
        summary: "Slow Moving Stock Report",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            minimumDaysInStock: { type: "number", default: 90 },
            minimumValue: { type: "number", default: 0 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          500: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin,
    },
    async (request, reply) => {
      try {
        const { minimumDaysInStock, minimumValue } = request.query as any;
        const report = await services.dashboardRepository.getSlowMovingStockReport(
          minimumDaysInStock,
          minimumValue
        );
        return reply.send({ success: true, data: report });
      } catch (error: any) {
        request.log.error(error);
        return reply.status(500).send({ success: false, error: error.message });
      }
    },
  );
}
