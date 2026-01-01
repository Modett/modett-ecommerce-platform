import { FastifyRequest, FastifyReply } from "fastify";
import {
  TrackProductViewCommand,
  TrackProductViewHandler,
  TrackPurchaseCommand,
  TrackPurchaseHandler,
} from "../../../application/commands";

export interface TrackProductViewRequest {
  productId: string;
  variantId?: string;
  sessionId: string;
  guestToken?: string;
  userId?: string;
  context?: {
    source?: "search" | "category" | "recommendation" | "direct";
    searchQuery?: string;
    categoryId?: string;
  };
}

export interface TrackPurchaseRequest {
  orderId: string;
  orderItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }>;
  sessionId: string;
  totalAmount: number;
  guestToken?: string;
  userId?: string;
}

export class AnalyticsTrackingController {
  constructor(
    private readonly trackProductViewHandler: TrackProductViewHandler,
    private readonly trackPurchaseHandler: TrackPurchaseHandler
  ) {}

  async trackProductView(
    request: FastifyRequest<{ Body: TrackProductViewRequest }>,
    reply: FastifyReply
  ) {
    const { productId, variantId, sessionId, guestToken, userId, context } =
      request.body;

    // Extract metadata from headers
    const userAgent = request.headers["user-agent"];
    const ipAddress = request.ip;
    const referrer = request.headers.referer;

    const command: TrackProductViewCommand = {
      productId,
      variantId,
      userId,
      guestToken,
      sessionId,
      userAgent,
      ipAddress,
      referrer,
      context,
    };

    const result = await this.trackProductViewHandler.handle(command);

    if (!result.success) {
      return reply.code(400).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }

    // Fire and forget - return immediately
    return reply.code(204).send();
  }

  async trackPurchase(
    request: FastifyRequest<{ Body: TrackPurchaseRequest }>,
    reply: FastifyReply
  ) {
    const { orderId, orderItems, sessionId, totalAmount, guestToken, userId } =
      request.body;
    console.log(
      "[DEBUG] Analytics Controller - Track Purchase Request Received:",
      JSON.stringify(request.body, null, 2)
    );

    // Extract metadata from headers
    const userAgent = request.headers["user-agent"];
    const ipAddress = request.ip;

    const command: TrackPurchaseCommand = {
      orderId,
      orderItems,
      userId,
      guestToken,
      sessionId,
      userAgent,
      ipAddress,
      totalAmount,
    };

    const result = await this.trackPurchaseHandler.handle(command);

    if (!result.success) {
      return reply.code(400).send({
        success: false,
        error: result.error,
        errors: result.errors,
      });
    }

    return reply.code(204).send();
  }
}
