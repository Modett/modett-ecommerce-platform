import { FastifyRequest, FastifyReply } from "fastify";
import { OrderEventService } from "../../../application/services/order-event.service";
import { LogOrderEventCommandHandler } from "../../../application/commands/log-order-event.command";
import { GetOrderEventsHandler } from "../../../application/queries/get-order-events.query";
import { GetOrderEventHandler } from "../../../application/queries/get-order-event.query";

interface LogEventRequest {
  Params: { orderId: string };
  Body: {
    eventType: string;
    payload?: Record<string, any>;
  };
}

interface GetEventsRequest {
  Params: { orderId: string };
  Querystring: {
    eventType?: string;
    limit?: number;
    offset?: number;
    sortBy?: "createdAt" | "eventId";
    sortOrder?: "asc" | "desc";
  };
}

interface GetEventRequest {
  Params: {
    orderId: string;
    eventId: string;
  };
}

export class OrderEventController {
  constructor(private readonly orderEventService: OrderEventService) {}

  async logEvent(
    request: FastifyRequest<LogEventRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId } = request.params;
      const { eventType, payload } = request.body;

      const handler = new LogOrderEventCommandHandler(this.orderEventService);
      const result = await handler.handle({
        orderId,
        eventType,
        payload,
      });

      if (result.success) {
        reply.status(201).send({
          success: true,
          data: result.data,
          message: "Event logged successfully",
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

  async getEvents(
    request: FastifyRequest<GetEventsRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId } = request.params;
      const { eventType, limit, offset, sortBy, sortOrder } = request.query;

      const handler = new GetOrderEventsHandler(this.orderEventService);
      const result = await handler.handle({
        orderId,
        eventType,
        limit,
        offset,
        sortBy,
        sortOrder,
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

  async getEvent(
    request: FastifyRequest<GetEventRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { eventId } = request.params;
      const eventIdNum = parseInt(eventId, 10);

      if (isNaN(eventIdNum)) {
        reply.status(400).send({
          success: false,
          error: "Invalid event ID",
        });
        return;
      }

      const handler = new GetOrderEventHandler(this.orderEventService);
      const result = await handler.handle({
        eventId: eventIdNum,
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
