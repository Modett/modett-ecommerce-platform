import { FastifyRequest, FastifyReply } from "fastify";
import {
  TrackProductViewCommand,
  TrackProductViewHandler,
  TrackPurchaseCommand,
  TrackPurchaseHandler,
  TrackAddToCartCommand,
  TrackAddToCartHandler,
  TrackBeginCheckoutCommand,
  TrackBeginCheckoutHandler,
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

export interface TrackAddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  userId?: string;
  guestToken?: string;
  sessionId: string;
  context?: {
    source?: "search" | "category" | "recommendation" | "direct";
    searchQuery?: string;
    categoryId?: string;
  };
}

export interface TrackBeginCheckoutRequest {
  cartId: string;
  cartTotal: number;
  itemCount: number;
  currency: string;
  sessionId: string;
  guestToken?: string;
  userId?: string;
  context?: any;
}

export class AnalyticsTrackingController {
  constructor(
    private readonly trackProductViewHandler: TrackProductViewHandler,
    private readonly trackPurchaseHandler: TrackPurchaseHandler,
    private readonly trackAddToCartHandler: TrackAddToCartHandler,
    private readonly trackBeginCheckoutHandler: TrackBeginCheckoutHandler
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

  async trackAddToCart(
    request: FastifyRequest<{ Body: TrackAddToCartRequest }>,
    reply: FastifyReply
  ) {
    try {
      const {
        productId,
        variantId,
        quantity,
        price,
        sessionId,
        guestToken,
        userId,
        context,
      } = request.body;

      // Extract metadata from headers
      const userAgent = request.headers["user-agent"];
      const ipAddress = request.ip;
      const referrer = request.headers.referer;

      const command: TrackAddToCartCommand = {
        productId,
        variantId,
        quantity,
        price,
        userId,
        guestToken,
        sessionId,
        userAgent,
        ipAddress,
        referrer,
        context,
      };

      const result = await this.trackAddToCartHandler.handle(command);

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          error: result.error,
          errors: result.errors,
        });
      } else {
        return reply.status(204).send();
      }
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async trackBeginCheckout(
    request: FastifyRequest<{ Body: TrackBeginCheckoutRequest }>,
    reply: FastifyReply
  ) {
    try {
      const {
        cartId,
        cartTotal,
        itemCount,
        currency,
        sessionId,
        guestToken,
        userId,
        context,
      } = request.body;

      // Extract metadata from headers
      const userAgent = request.headers["user-agent"];
      const ipAddress = request.ip;
      const referrer = request.headers.referer;

      const command: TrackBeginCheckoutCommand = {
        cartId,
        cartTotal,
        itemCount,
        currency,
        sessionId,
        guestToken,
        userId,
        userAgent,
        ipAddress,
        referrer,
        context,
      };

      const result = await this.trackBeginCheckoutHandler.handle(command);

      if (!result.success) {
        return reply.status(400).send({
          success: false,
          error: result.error,
          errors: result.errors,
        });
      } else {
        return reply.status(204).send();
      }
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: error.message || "Internal server error",
      });
    }
  }

  async trackPurchase(
    request: FastifyRequest<{ Body: TrackPurchaseRequest }>,
    reply: FastifyReply
  ) {
    const { orderId, orderItems, sessionId, totalAmount, guestToken, userId } =
      request.body;

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
