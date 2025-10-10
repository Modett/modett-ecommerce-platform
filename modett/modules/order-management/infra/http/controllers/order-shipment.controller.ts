import { FastifyRequest, FastifyReply } from "fastify";
import { OrderManagementService } from "../../../application/services/order-management.service";
import { CreateShipmentCommandHandler } from "../../../application/commands/create-shipment.command";
import { UpdateShipmentTrackingCommandHandler } from "../../../application/commands/update-shipment-tracking.command";
import { MarkShipmentShippedCommandHandler } from "../../../application/commands/mark-shipment-shipped.command";
import { MarkShipmentDeliveredCommandHandler } from "../../../application/commands/mark-shipment-delivered.command";
import { GetOrderShipmentsHandler } from "../../../application/queries/get-order-shipments.query";
import { GetShipmentHandler } from "../../../application/queries/get-shipment.query";

interface CreateShipmentRequest {
  Params: { orderId: string };
  Body: {
    carrier?: string;
    service?: string;
    trackingNumber?: string;
    giftReceipt?: boolean;
    pickupLocationId?: string;
  };
}

interface MarkShippedRequest {
  Params: { orderId: string; shipmentId: string };
  Body: {
    carrier: string;
    service: string;
    trackingNumber: string;
  };
}

interface UpdateTrackingRequest {
  Params: { orderId: string; shipmentId: string };
  Body: {
    trackingNumber: string;
    carrier?: string;
    service?: string;
  };
}

interface MarkDeliveredRequest {
  Params: { orderId: string; shipmentId: string };
  Body: {
    deliveredAt?: string;
  };
}

interface GetShipmentsRequest {
  Params: { orderId: string };
}

interface GetShipmentRequest {
  Params: { orderId: string; shipmentId: string };
}

export class OrderShipmentController {
  constructor(private readonly orderService: OrderManagementService) {}

  async createShipment(
    request: FastifyRequest<CreateShipmentRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId } = request.params;
      const {
        carrier,
        service,
        trackingNumber,
        giftReceipt,
        pickupLocationId,
      } = request.body;

      const handler = new CreateShipmentCommandHandler(this.orderService);
      const result = await handler.handle({
        orderId,
        carrier,
        service,
        trackingNumber,
        giftReceipt,
        pickupLocationId,
      });

      if (result.success) {
        reply.status(201).send({
          success: true,
          data: result.data?.toJSON ? result.data.toJSON() : result.data,
          message: "Shipment created successfully",
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

  async getShipments(
    request: FastifyRequest<GetShipmentsRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId } = request.params;

      const handler = new GetOrderShipmentsHandler(this.orderService);
      const result = await handler.handle({ orderId });

      if (result.success) {
        reply.status(200).send({
          success: true,
          data: result.data, // Already plain objects from query
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

  async getShipment(
    request: FastifyRequest<GetShipmentRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId, shipmentId } = request.params;

      const handler = new GetShipmentHandler(this.orderService);
      const result = await handler.handle({ orderId, shipmentId });

      if (result.success) {
        reply.status(200).send({
          success: true,
          data: result.data, // Already a plain object from query
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

  async markShipped(
    request: FastifyRequest<MarkShippedRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId, shipmentId } = request.params;
      const { carrier, service, trackingNumber } = request.body;

      const handler = new MarkShipmentShippedCommandHandler(this.orderService);
      const result = await handler.handle({
        orderId,
        shipmentId,
        carrier,
        service,
        trackingNumber,
      });

      if (result.success) {
        reply.status(200).send({
          success: true,
          data: result.data?.toJSON ? result.data.toJSON() : result.data,
          message: "Shipment marked as shipped successfully",
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

  async updateTracking(
    request: FastifyRequest<UpdateTrackingRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId, shipmentId } = request.params;
      const { trackingNumber, carrier, service } = request.body;

      const handler = new UpdateShipmentTrackingCommandHandler(this.orderService);
      const result = await handler.handle({
        orderId,
        shipmentId,
        trackingNumber,
        carrier,
        service,
      });

      if (result.success) {
        reply.status(200).send({
          success: true,
          data: result.data?.toJSON ? result.data.toJSON() : result.data,
          message: "Shipment tracking updated successfully",
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

  async markDelivered(
    request: FastifyRequest<MarkDeliveredRequest>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { orderId, shipmentId } = request.params;
      const { deliveredAt } = request.body;

      const handler = new MarkShipmentDeliveredCommandHandler(this.orderService);
      const result = await handler.handle({
        orderId,
        shipmentId,
        deliveredAt: deliveredAt ? new Date(deliveredAt) : new Date(),
      });

      if (result.success) {
        reply.status(200).send({
          success: true,
          data: result.data?.toJSON ? result.data.toJSON() : result.data,
          message: "Shipment marked as delivered successfully",
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
}
