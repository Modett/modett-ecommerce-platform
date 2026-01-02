# Analytics Module - Complete Implementation Guide

## ✅ What's Been Completed

### 1. Domain Layer (100%)
- ✅ Value Objects: EventId, SessionId, EventType, UserContext, ProductReference
- ✅ Entity: AnalyticsEvent with create() and reconstitute()
- ✅ Repository Interface: AnalyticsEventRepository

### 2. Infrastructure Layer (100%)
- ✅ Prisma Schema: Added to main schema.prisma (lines 1384-1434)
- ✅ Repository Implementation: AnalyticsEventRepositoryImpl

### 3. Application Layer (100%)
- ✅ Service: AnalyticsTrackingService
- ✅ Commands: TrackProductViewCommand, TrackPurchaseCommand
- ✅ Handlers: Following CQRS pattern with CommandResult

---

## 🔧 Remaining Implementation Steps

### STEP 1: Create HTTP Controller

**File**: `modules/analytics/infra/http/controllers/analytics-tracking.controller.ts`

```typescript
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
```

### STEP 2: Register Routes

**File**: `modules/analytics/infra/http/routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { AnalyticsTrackingController } from './controllers/analytics-tracking.controller';

export async function registerAnalyticsRoutes(
  server: FastifyInstance,
  controller: AnalyticsTrackingController
) {
  // Public tracking endpoints (no auth required)
  server.post('/analytics/track/product-view', async (request, reply) => {
    return controller.trackProductView(request, reply);
  });

  // Internal endpoint (typically called from backend after order creation)
  server.post('/analytics/track/purchase', async (request, reply) => {
    return controller.trackPurchase(request, reply);
  });
}
```

### STEP 3: Wire Up Dependency Injection

**File**: `apps/api/src/server.ts` (add to existing DI setup)

```typescript
// Add to imports
import { AnalyticsEventRepositoryImpl } from '../../../modules/analytics/infra/persistence/repositories/analytics-event.repository.impl';
import { AnalyticsTrackingService } from '../../../modules/analytics/application/services/analytics-tracking.service';
import {
  TrackProductViewHandler,
  TrackPurchaseHandler,
} from '../../../modules/analytics/application/commands';
import { AnalyticsTrackingController } from '../../../modules/analytics/infra/http/controllers/analytics-tracking.controller';
import { registerAnalyticsRoutes } from '../../../modules/analytics/infra/http/routes';

// Add to DI container
const analyticsEventRepository = new AnalyticsEventRepositoryImpl(prisma);
const analyticsTrackingService = new AnalyticsTrackingService(analyticsEventRepository);
const trackProductViewHandler = new TrackProductViewHandler(analyticsTrackingService);
const trackPurchaseHandler = new TrackPurchaseHandler(analyticsTrackingService);
const analyticsTrackingController = new AnalyticsTrackingController(
  trackProductViewHandler,
  trackPurchaseHandler
);

// Register routes
await registerAnalyticsRoutes(server, analyticsTrackingController);
```

---

## 📱 Frontend Implementation

### STEP 4: Session Management Utility

**File**: `apps/web/features/analytics/utils/session.ts`

```typescript
const SESSION_KEY = 'modett_analytics_session';
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface SessionData {
  sessionId: string;
  lastActivity: number;
}

export const getOrCreateSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  const stored = localStorage.getItem(SESSION_KEY);

  if (stored) {
    try {
      const parsed: SessionData = JSON.parse(stored);
      const now = Date.now();

      if (now - parsed.lastActivity < SESSION_DURATION_MS) {
        // Update activity
        localStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            sessionId: parsed.sessionId,
            lastActivity: now,
          })
        );
        return parsed.sessionId;
      }
    } catch (error) {
      console.error('Failed to parse session data:', error);
    }
  }

  // Create new session
  const newSessionId = crypto.randomUUID();
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      sessionId: newSessionId,
      lastActivity: Date.now(),
    })
  );

  return newSessionId;
};

export const clearSessionId = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
};
```

### STEP 5: Analytics API Client

**File**: `apps/web/features/analytics/api.ts`

```typescript
import { apiClient } from '@/lib/api-client';

export interface TrackProductViewParams {
  productId: string;
  variantId?: string;
  sessionId: string;
  context?: {
    source?: 'search' | 'category' | 'recommendation' | 'direct';
  };
}

export const trackProductView = async (
  params: TrackProductViewParams
): Promise<void> => {
  try {
    await apiClient.post('/analytics/track/product-view', params);
  } catch (error) {
    // Silent fail - never break user experience
    console.error('Product view tracking failed:', error);
  }
};
```

### STEP 6: Product View Tracking Hook

**File**: `apps/web/features/analytics/hooks/useTrackProductView.ts`

```typescript
import { useEffect, useRef } from 'react';
import { trackProductView } from '../api';
import { getOrCreateSessionId } from '../utils/session';

export const useTrackProductView = (
  productId: string | undefined,
  variantId?: string
) => {
  const tracked = useRef(false);

  useEffect(() => {
    if (!productId || tracked.current) return;

    // 2-second delay to ensure intentional view (filter bounces)
    const timer = setTimeout(async () => {
      try {
        const sessionId = getOrCreateSessionId();

        await trackProductView({
          productId,
          variantId,
          sessionId,
          context: {
            source: document.referrer.includes('/search')
              ? 'search'
              : document.referrer.includes('/collections')
              ? 'category'
              : 'direct',
          },
        });

        tracked.current = true;
      } catch (error) {
        // Silent fail
        console.error('Analytics tracking failed:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [productId, variantId]);
};
```

### STEP 7: Integrate into Product Page

**File**: `apps/web/app/(shop)/product/[handle]/page.tsx`

```typescript
// Add import
import { useTrackProductView } from '@/features/analytics/hooks/useTrackProductView';

export default function ProductPage({ params }: ProductPageProps) {
  const { handle } = use(params);
  const { data: product, isLoading } = useProductBySlug(handle);

  // Track product view
  useTrackProductView(product?.id);

  // ... rest of component
}
```

### STEP 8: Integrate Purchase Tracking into Order Service

**File**: `modules/cart/application/services/checkout-order.service.ts`

```typescript
// Add import
import { AnalyticsTrackingService } from '../../../analytics/application/services/analytics-tracking.service';

export class CheckoutOrderService {
  constructor(
    // ... existing dependencies
    private readonly analyticsTrackingService: AnalyticsTrackingService
  ) {}

  async completeCheckoutWithOrder(
    dto: CompleteCheckoutWithOrderDto
  ): Promise<OrderResult> {
    return await this.prisma.$transaction(async (tx) => {
      // ... existing order creation logic

      // After order is created successfully, track purchase
      try {
        // Extract session ID from somewhere (you'll need to pass this through)
        const sessionId = crypto.randomUUID(); // TODO: Get actual session from frontend

        await this.analyticsTrackingService.trackPurchase({
          orderId: order.id,
          orderItems: orderItems.map((item) => ({
            productId: item.productSnapshot.productId,
            variantId: item.productSnapshot.variantId,
            quantity: item.qty,
            price: item.productSnapshot.price,
          })),
          userId: dto.userId,
          guestToken: dto.guestToken,
          sessionId,
          totalAmount: total,
        });
      } catch (error) {
        // Log error but don't fail the order
        console.error('Failed to track purchase analytics:', error);
      }

      return orderResult;
    });
  }
}
```

---

## 🚀 Deployment Steps

### 1. Stop Development Server
```bash
# Stop your dev server
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Create and Run Migration
```bash
npx prisma migrate dev --name add_analytics_module
```

### 4. Restart Development Server
```bash
npm run dev
```

---

## ✅ Testing Checklist

### Product View Tracking
1. Navigate to a product page: `/product/[slug]`
2. Wait 2 seconds
3. Check browser Network tab for POST to `/analytics/track/product-view`
4. Verify response: 204 No Content

### Purchase Tracking
1. Complete a full checkout flow
2. After order creation, check database:
```sql
SELECT * FROM analytics.analytics_events WHERE event_type = 'purchase';
```

### Database Verification
```sql
-- Check analytics events table was created
SELECT * FROM analytics.analytics_events LIMIT 10;

-- Check product view events
SELECT product_id, COUNT(*) as view_count
FROM analytics.analytics_events
WHERE event_type = 'product_view'
GROUP BY product_id
ORDER BY view_count DESC;

-- Check purchase events
SELECT product_id, COUNT(*) as purchase_count
FROM analytics.analytics_events
WHERE event_type = 'purchase'
GROUP BY product_id;
```

---

## 📊 What You Can Now Track

1. **Product Views**:
   - Which products customers view
   - View counts by product
   - View sessions

2. **Purchases**:
   - Which products are purchased
   - Purchase quantities
   - Order values

3. **Analysis Capabilities**:
   - View-to-purchase conversion rates
   - User journey tracking (session-based)
   - Most viewed vs most purchased products

---

## 🎯 Next Phase Enhancements

After this works, you can add:
1. **Analytics Query Service** - Pre-built queries for common reports
2. **Admin Dashboard** - UI to view analytics
3. **Conversion Funnels** - Track full user journey
4. **A/B Testing** - Track experiment results
5. **Cart Abandonment** - Track when users add to cart but don't purchase

