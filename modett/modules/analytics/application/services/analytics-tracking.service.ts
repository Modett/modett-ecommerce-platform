import { AnalyticsEventRepository } from '../../domain/repositories/analytics-event.repository';
import { AnalyticsEvent } from '../../domain/entities/analytics-event.entity';
import { EventType, UserContext, SessionId, ProductReference } from '../../domain/value-objects';

export interface TrackProductViewDto {
  productId: string;
  variantId?: string;
  userId?: string;
  guestToken?: string;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  context?: {
    source?: 'search' | 'category' | 'recommendation' | 'direct';
    searchQuery?: string;
    categoryId?: string;
  };
}

export interface TrackPurchaseDto {
  orderId: string;
  orderItems: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }>;
  userId?: string;
  guestToken?: string;
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  totalAmount: number;
}

export class AnalyticsTrackingService {
  constructor(
    private readonly analyticsEventRepository: AnalyticsEventRepository
  ) {}

  async trackProductView(dto: TrackProductViewDto): Promise<void> {
    // Validate user context
    if (!dto.userId && !dto.guestToken) {
      throw new Error('Either userId or guestToken is required');
    }

    // Create user context
    const userContext = dto.userId
      ? UserContext.forUser(dto.userId)
      : UserContext.forGuest(dto.guestToken!);

    // Create event
    const event = AnalyticsEvent.create({
      eventType: EventType.productView(),
      userContext,
      sessionId: SessionId.create(dto.sessionId),
      productReference: ProductReference.create(dto.productId, dto.variantId),
      eventData: dto.context,
      metadata: {
        userAgent: dto.userAgent,
        ipAddress: dto.ipAddress,
        referrer: dto.referrer,
      },
    });

    // Persist event
    await this.analyticsEventRepository.save(event);
  }

  async trackPurchase(dto: TrackPurchaseDto): Promise<void> {
    if (!dto.userId && !dto.guestToken) {
      throw new Error('Either userId or guestToken is required');
    }

    const userContext = dto.userId
      ? UserContext.forUser(dto.userId)
      : UserContext.forGuest(dto.guestToken!);

    const events = dto.orderItems.map((item) =>
      AnalyticsEvent.create({
        eventType: EventType.purchase(),
        userContext,
        sessionId: SessionId.create(dto.sessionId),
        productReference: ProductReference.create(item.productId, item.variantId),
        eventData: {
          orderId: dto.orderId,
          quantity: item.quantity,
          price: item.price,
          totalAmount: dto.totalAmount,
        },
        metadata: {
          userAgent: dto.userAgent,
          ipAddress: dto.ipAddress,
        },
      })
    );

    await this.analyticsEventRepository.saveMany(events);
  }
}
