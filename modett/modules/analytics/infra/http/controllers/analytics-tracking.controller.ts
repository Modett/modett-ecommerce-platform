import { FastifyRequest, FastifyReply } from 'fastify';
import {
  TrackProductViewCommand,
  TrackProductViewHandler,
  TrackPurchaseCommand,
  TrackPurchaseHandler,
} from '../../../application/commands';

interface TrackProductViewRequest {
  productId: string;
  variantId?: string;
  sessionId: string;
  context?: {
    source?: 'search' | 'category' | 'recommendation' | 'direct';
    searchQuery?: string;
    categoryId?: string;
  };
}

interface TrackPurchaseRequest {
  orderId: string;
  orderItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }>;
  sessionId: string;
  totalAmount: number;
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
    const { productId, variantId, sessionId, context } = request.body;

    // Extract user context from request
    const userId = (request as any).user?.id;
    const guestToken = request.headers['x-guest-token'] as string;

    // Extract metadata
    const userAgent = request.headers['user-agent'];
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
    const { orderId, orderItems, sessionId, totalAmount } = request.body;

    const userId = (request as any).user?.id;
    const guestToken = request.headers['x-guest-token'] as string;
    const userAgent = request.headers['user-agent'];
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
