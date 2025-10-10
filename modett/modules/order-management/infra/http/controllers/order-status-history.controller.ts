import { FastifyRequest, FastifyReply } from "fastify";
import { OrderManagementService } from "../../../application/services/order-management.service";
import { LogOrderStatusChangeCommandHandler } from "../../../application/commands/log-order-status-change.command";
import { GetOrderStatusHistoryHandler } from "../../../application/queries/get-order-status-history.query";

interface LogStatusChangeRequest {
  Params: { orderId: string };
  Body: {
    fromStatus?: string;
    toStatus: string;
    changedBy?: string;
  };
}

interface GetStatusHistoryRequest {
  Params: { orderId: string };
  Querystring: {
    limit?: number;
    offset?: number;
  };
}

export class OrderStatusHistoryController {
  constructor(private readonly orderService: OrderManagementService) {}

  async logStatusChange(
    request: FastifyRequest<LogStatusChangeRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId } = request.params;
      const { fromStatus, toStatus, changedBy } = request.body;

      const handler = new LogOrderStatusChangeCommandHandler(this.orderService);
      const result = await handler.handle({
        orderId,
        fromStatus,
        toStatus,
        changedBy,
      });

      if (result.success) {
        reply.status(201).send({
          success: true,
          data: result.data?.toJSON ? result.data.toJSON() : result.data,
          message: "Status change logged successfully",
        });
      } else {
        reply.status(400).send({
          success: false,
          error: result.error,
          errors: result.errors,
        });
      }
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  }

  async getStatusHistory(
    request: FastifyRequest<GetStatusHistoryRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId } = request.params;
      const { limit, offset } = request.query;

      const handler = new GetOrderStatusHistoryHandler(this.orderService);
      const result = await handler.handle({
        orderId,
        limit,
        offset,
      });

      if (result.success) {
        reply.status(200).send({
          success: true,
          data: result.data,
        });
      } else {
        reply.status(404).send({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: "Internal server error",
      });
    }
  }
}
