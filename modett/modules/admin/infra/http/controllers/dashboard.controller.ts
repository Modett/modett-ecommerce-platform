import { FastifyReply, FastifyRequest } from "fastify";
import {
  GetDailyStatsHandler,
  GetDailyStatsQuery,
} from "../../../application/queries/get-daily-stats.query";
import {
  GetAlertsHandler,
  GetAlertsQuery,
} from "../../../application/queries/get-alerts.query";
import {
  GetRecentActivityHandler,
  GetRecentActivityQuery,
} from "../../../application/queries/get-recent-activity.query";
import {
  GetAnalyticsHandler,
  GetAnalyticsQuery,
} from "../../../application/queries/get-analytics.query";

export class DashboardController {
  constructor(
    private getDailyStatsHandler: GetDailyStatsHandler,
    private getAlertsHandler: GetAlertsHandler,
    private getRecentActivityHandler: GetRecentActivityHandler,
    private getAnalyticsHandler: GetAnalyticsHandler
  ) {}

  async getSummary(req: FastifyRequest, reply: FastifyReply) {
    try {
      const query: GetDailyStatsQuery = {};
      const result = await this.getDailyStatsHandler.handle(query);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      }

      return reply.code(500).send({
        success: false,
        error: result.error,
      });
    } catch (error: any) {
      req.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to fetch dashboard summary",
      });
    }
  }

  async getAlerts(req: FastifyRequest, reply: FastifyReply) {
    try {
      const query: GetAlertsQuery = {};
      const result = await this.getAlertsHandler.handle(query);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      }

      return reply.code(500).send({
        success: false,
        error: result.error,
      });
    } catch (error: any) {
      req.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to fetch dashboard alerts",
      });
    }
  }

  async getActivity(req: FastifyRequest, reply: FastifyReply) {
    try {
      const query: GetRecentActivityQuery = {};
      const result = await this.getRecentActivityHandler.handle(query);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      }

      return reply.code(500).send({
        success: false,
        error: result.error,
      });
    } catch (error: any) {
      req.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to fetch recent activity",
      });
    }
  }

  async getAnalytics(
    req: FastifyRequest<{
      Querystring: {
        startDate?: string;
        endDate?: string;
        granularity?: string;
      };
    }>,
    reply: FastifyReply
  ) {
    try {
      const { startDate, endDate, granularity } = req.query;

      // Default to last 30 days
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate
        ? new Date(startDate)
        : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      const validGranularities = ['day', 'week', 'month'];
      const gran = validGranularities.includes(granularity || '')
        ? (granularity as 'day' | 'week' | 'month')
        : 'day';

      const query = new GetAnalyticsQuery(start, end, gran);
      const result = await this.getAnalyticsHandler.handle(query);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      }

      return reply.code(400).send({
        success: false,
        error: result.error,
      });
    } catch (error: any) {
      req.log.error(error);
      return reply.code(500).send({
        success: false,
        error: "Failed to fetch analytics",
      });
    }
  }
}
