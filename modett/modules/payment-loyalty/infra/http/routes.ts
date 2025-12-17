import { FastifyInstance } from "fastify";
import {
  PaymentIntentController,
  PaymentTransactionController,
  PaymentWebhookController,
  BnplTransactionController,
  GiftCardController,
  GiftCardTransactionController,
  PromotionController,
  PromotionUsageController,
  LoyaltyProgramController,
  LoyaltyAccountController,
  LoyaltyTransactionController,
} from "./controllers";
import { PayableIPGController } from "./controllers/payable-ipg.controller";
import { isPayableIPGConfigured } from "../config/payable-ipg.config";
import {
  PaymentService,
  BnplTransactionService,
  GiftCardService,
  PromotionService,
  PaymentWebhookService,
  LoyaltyService,
  LoyaltyTransactionService,
} from "../../application/services";
import {
  optionalAuth,
  authenticateUser,
  authenticateAdmin,
  authenticateStaff,
} from "../../../user-management/infra/http/middleware/auth.middleware";

// Standard error responses for Swagger
const errorResponses = {
  400: {
    description: "Bad request - validation failed",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Validation failed" },
      errors: { type: "array", items: { type: "string" } },
    },
  },
  401: {
    description: "Unauthorized - authentication required",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Authentication required" },
    },
  },
  404: {
    description: "Not found",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Resource not found" },
    },
  },
  500: {
    description: "Internal server error",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Internal server error" },
    },
  },
};

// Route registration function
export async function registerPaymentLoyaltyRoutes(
  fastify: FastifyInstance,
  services: {
    paymentService: PaymentService;
    bnplService: BnplTransactionService;
    giftCardService: GiftCardService;
    promotionService: PromotionService;
    webhookService: PaymentWebhookService;
    loyaltyService: LoyaltyService;
    loyaltyTxnService: LoyaltyTransactionService;
  }
) {
  // Initialize controllers
  const paymentIntentController = new PaymentIntentController(
    services.paymentService
  );
  const paymentTransactionController = new PaymentTransactionController(
    services.paymentService
  );
  const paymentWebhookController = new PaymentWebhookController(
    services.webhookService
  );
  const bnplController = new BnplTransactionController(services.bnplService);
  const giftCardController = new GiftCardController(services.giftCardService);
  const giftCardTxnController = new GiftCardTransactionController(
    services.giftCardService
  );
  const promotionController = new PromotionController(
    services.promotionService
  );
  const promotionUsageController = new PromotionUsageController(
    services.promotionService
  );
  const loyaltyProgramController = new LoyaltyProgramController(
    services.loyaltyService
  );
  const loyaltyAccountController = new LoyaltyAccountController(
    services.loyaltyService
  );
  const loyaltyTxnController = new LoyaltyTransactionController(
    services.loyaltyService,
    services.loyaltyTxnService
  );

  // =============================================================================
  // PAYMENT INTENT ROUTES
  // =============================================================================

  // Create payment intent
  fastify.post(
    "/payment-intents",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Create a new payment intent for processing a payment. Links to an order and can use various payment providers (Stripe, Ayesha, Koko, Mintpay, etc.).",
        tags: ["Payment Intents"],
        summary: "Create Payment Intent",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["orderId", "provider", "amount"],
          properties: {
            orderId: {
              type: "string",
              format: "uuid",
              description: "Order ID",
            },
            provider: {
              type: "string",
              description:
                "Payment provider (stripe, ayesha, koko, mintpay, etc.)",
            },
            amount: {
              type: "number",
              minimum: 0,
              description: "Payment amount",
            },
            currency: {
              type: "string",
              default: "USD",
              description: "Currency code",
            },
            idempotencyKey: {
              type: "string",
              description: "Idempotency key for duplicate prevention",
            },
            clientSecret: {
              type: "string",
              description: "Client secret from provider",
            },
          },
        },
        response: {
          201: {
            description: "Payment intent created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => paymentIntentController.create(req, reply)
  );

  // Process payment (authorize/capture)
  fastify.post(
    "/payment-intents/process",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Process a payment intent - authorize and capture funds",
        tags: ["Payment Intents"],
        summary: "Process Payment",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["intentId"],
          properties: {
            intentId: {
              type: "string",
              format: "uuid",
              description: "Payment intent ID",
            },
            pspReference: {
              type: "string",
              description: "Payment service provider reference",
            },
          },
        },
        response: {
          200: {
            description: "Payment processed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => paymentIntentController.process(req, reply)
  );

  // Refund payment
  fastify.post(
    "/payment-intents/refund",
    {
      preHandler: authenticateStaff,
      schema: {
        description:
          "Refund a captured payment (full or partial) - Staff/Admin only",
        tags: ["Payment Intents"],
        summary: "Refund Payment",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["intentId"],
          properties: {
            intentId: {
              type: "string",
              format: "uuid",
              description: "Payment intent ID",
            },
            amount: {
              type: "number",
              minimum: 0,
              description: "Refund amount (optional, defaults to full refund)",
            },
            reason: { type: "string", description: "Reason for refund" },
          },
        },
        response: {
          200: {
            description: "Payment refunded successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => paymentIntentController.refund(req, reply)
  );

  // Void payment
  fastify.post(
    "/payment-intents/void",
    {
      preHandler: authenticateStaff,
      schema: {
        description:
          "Void an authorized (not yet captured) payment - Staff/Admin only",
        tags: ["Payment Intents"],
        summary: "Void Payment",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["intentId"],
          properties: {
            intentId: {
              type: "string",
              format: "uuid",
              description: "Payment intent ID",
            },
            pspReference: {
              type: "string",
              description: "Payment service provider reference",
            },
          },
        },
        response: {
          200: {
            description: "Payment voided successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => paymentIntentController.void(req, reply)
  );

  // Get payment intent
  fastify.get(
    "/payment-intents",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get payment intent by intentId or orderId",
        tags: ["Payment Intents"],
        summary: "Get Payment Intent",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            intentId: {
              type: "string",
              format: "uuid",
              description: "Payment intent ID",
            },
            orderId: {
              type: "string",
              format: "uuid",
              description: "Order ID",
            },
          },
        },
        response: {
          200: {
            description: "Payment intent retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          404: errorResponses[404],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => paymentIntentController.get(req, reply)
  );

  // =============================================================================
  // PAYMENT TRANSACTION ROUTES
  // =============================================================================

  // List payment transactions
  fastify.get(
    "/payment-intents/:intentId/transactions",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "List all payment transactions (auth, capture, refund, void) for a payment intent",
        tags: ["Payment Transactions"],
        summary: "List Payment Transactions",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["intentId"],
          properties: {
            intentId: {
              type: "string",
              format: "uuid",
              description: "Payment intent ID",
            },
          },
        },
        response: {
          200: {
            description: "Payment transactions retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
          },
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) =>
      paymentTransactionController.list(req, reply)
  );

  // =============================================================================
  // BNPL (BUY NOW PAY LATER) ROUTES
  // =============================================================================

  // Create BNPL transaction
  fastify.post(
    "/bnpl",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Create a Buy Now Pay Later (BNPL) transaction with providers like Koko, Mintpay, etc.",
        tags: ["BNPL"],
        summary: "Create BNPL Transaction",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["intentId", "provider", "plan"],
          properties: {
            intentId: {
              type: "string",
              format: "uuid",
              description: "Payment intent ID",
            },
            provider: {
              type: "string",
              description: "BNPL provider (koko, mintpay, etc.)",
            },
            plan: {
              type: "object",
              description: "BNPL payment plan details (JSONB)",
            },
          },
        },
        response: {
          201: {
            description: "BNPL transaction created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => bnplController.create(req, reply)
  );

  // Process BNPL transaction
  fastify.post(
    "/bnpl/:bnplId/:action",
    {
      preHandler: authenticateStaff,
      schema: {
        description:
          "Process a BNPL transaction (approve, reject, activate, complete, cancel) - Staff/Admin only",
        tags: ["BNPL"],
        summary: "Process BNPL",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["bnplId", "action"],
          properties: {
            bnplId: {
              type: "string",
              format: "uuid",
              description: "BNPL transaction ID",
            },
            action: {
              type: "string",
              enum: ["approve", "reject", "activate", "complete", "cancel"],
              description: "Action to perform on BNPL transaction",
            },
          },
        },
        response: {
          200: {
            description: "BNPL transaction processed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => bnplController.process(req, reply)
  );

  // List BNPL transactions
  fastify.get(
    "/bnpl",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "List BNPL transactions with optional filters (bnplId, intentId, orderId)",
        tags: ["BNPL"],
        summary: "List BNPL Transactions",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            bnplId: {
              type: "string",
              format: "uuid",
              description: "BNPL transaction ID",
            },
            intentId: {
              type: "string",
              format: "uuid",
              description: "Payment intent ID",
            },
            orderId: {
              type: "string",
              format: "uuid",
              description: "Order ID",
            },
          },
        },
        response: {
          200: {
            description: "BNPL transactions retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
          },
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => bnplController.list(req, reply)
  );

  // =============================================================================
  // GIFT CARD ROUTES
  // =============================================================================

  // Create gift card
  fastify.post(
    "/gift-cards",
    {
      preHandler: authenticateAdmin,
      schema: {
        description:
          "Create a new gift card with initial balance and optional expiration - Admin only",
        tags: ["Gift Cards"],
        summary: "Create Gift Card",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["code", "initialBalance"],
          properties: {
            code: { type: "string", description: "Unique gift card code" },
            initialBalance: {
              type: "number",
              minimum: 0,
              description: "Initial balance",
            },
            currency: {
              type: "string",
              default: "USD",
              description: "Currency code",
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              description: "Expiration date",
            },
            recipientEmail: {
              type: "string",
              format: "email",
              description: "Recipient email",
            },
            recipientName: { type: "string", description: "Recipient name" },
            message: { type: "string", description: "Gift message" },
          },
        },
        response: {
          201: {
            description: "Gift card created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => giftCardController.create(req, reply)
  );

  // Redeem gift card
  fastify.post(
    "/gift-cards/:giftCardId/redeem",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Redeem a gift card towards an order",
        tags: ["Gift Cards"],
        summary: "Redeem Gift Card",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["giftCardId"],
          properties: {
            giftCardId: {
              type: "string",
              format: "uuid",
              description: "Gift card ID",
            },
          },
        },
        body: {
          type: "object",
          required: ["amount", "orderId"],
          properties: {
            amount: {
              type: "number",
              minimum: 0,
              description: "Amount to redeem",
            },
            orderId: {
              type: "string",
              format: "uuid",
              description: "Order ID",
            },
          },
        },
        response: {
          200: {
            description: "Gift card redeemed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => giftCardController.redeem(req, reply)
  );

  // Get gift card balance
  fastify.get(
    "/gift-cards/balance",
    {
      schema: {
        description: "Get gift card balance by code or ID",
        tags: ["Gift Cards"],
        summary: "Get Gift Card Balance",
        querystring: {
          type: "object",
          required: ["codeOrId"],
          properties: {
            codeOrId: { type: "string", description: "Gift card code or ID" },
          },
        },
        response: {
          200: {
            description: "Gift card balance retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          404: errorResponses[404],
        },
      },
    },
    async (req: any, reply: any) => giftCardController.getBalance(req, reply)
  );

  // List gift card transactions
  fastify.get(
    "/gift-cards/:giftCardId/transactions",
    {
      preHandler: authenticateAdmin,
      schema: {
        description:
          "List all transactions (issue, redeem, refund) for a gift card - Admin only",
        tags: ["Gift Card Transactions"],
        summary: "List Gift Card Transactions",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["giftCardId"],
          properties: {
            giftCardId: {
              type: "string",
              format: "uuid",
              description: "Gift card ID",
            },
          },
        },
        response: {
          200: {
            description: "Gift card transactions retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    async (req: any, reply: any) => giftCardTxnController.list(req, reply)
  );

  // =============================================================================
  // PROMOTION ROUTES
  // =============================================================================

  // Create promotion
  fastify.post(
    "/promotions",
    {
      preHandler: authenticateAdmin,
      schema: {
        description:
          "Create a new promotion with discount rules, validity period, and usage limits - Admin only",
        tags: ["Promotions"],
        summary: "Create Promotion",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["rule"],
          properties: {
            code: { type: "string", description: "Optional promotion code" },
            rule: {
              type: "object",
              description: "Promotion discount rules (JSONB)",
            },
            startsAt: {
              type: "string",
              format: "date-time",
              description: "Promotion start date",
            },
            endsAt: {
              type: "string",
              format: "date-time",
              description: "Promotion end date",
            },
            usageLimit: {
              type: "number",
              minimum: 0,
              description: "Maximum usage count",
            },
          },
        },
        response: {
          201: {
            description: "Promotion created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => promotionController.create(req, reply)
  );

  // Apply promotion
  fastify.post(
    "/promotions/apply",
    {
      schema: {
        description:
          "Apply a promotion code to calculate discount for an order or cart",
        tags: ["Promotions"],
        summary: "Apply Promotion",
        body: {
          type: "object",
          required: ["promoCode", "orderAmount"],
          properties: {
            promoCode: { type: "string", description: "Promotion code" },
            orderId: {
              type: "string",
              format: "uuid",
              description: "Order ID (optional)",
            },
            orderAmount: {
              type: "number",
              minimum: 0,
              description: "Order/cart total amount",
            },
            currency: { type: "string", description: "Currency code" },
            products: {
              type: "array",
              items: { type: "string" },
              description: "Product IDs in cart/order",
            },
            categories: {
              type: "array",
              items: { type: "string" },
              description: "Product categories",
            },
          },
        },
        response: {
          200: {
            description: "Promotion applied successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
        },
      },
    },
    async (req: any, reply: any) => promotionController.apply(req, reply)
  );

  // List active promotions
  fastify.get(
    "/promotions/active",
    {
      schema: {
        description: "List all currently active promotions",
        tags: ["Promotions"],
        summary: "List Active Promotions",
        response: {
          200: {
            description: "Active promotions retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    async (req: any, reply: any) => promotionController.listActive(req, reply)
  );

  // Record promotion usage
  fastify.post(
    "/promotions/:promoId/usage",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Record that a promotion was used in an order",
        tags: ["Promotion Usage"],
        summary: "Record Promotion Usage",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["promoId"],
          properties: {
            promoId: {
              type: "string",
              format: "uuid",
              description: "Promotion ID",
            },
          },
        },
        body: {
          type: "object",
          required: ["orderId", "discountAmount"],
          properties: {
            orderId: {
              type: "string",
              format: "uuid",
              description: "Order ID",
            },
            discountAmount: {
              type: "number",
              minimum: 0,
              description: "Discount amount applied",
            },
            currency: { type: "string", description: "Currency code" },
          },
        },
        response: {
          201: {
            description: "Promotion usage recorded successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => promotionUsageController.record(req, reply)
  );

  // List promotion usage
  fastify.get(
    "/promotions/:promoId/usage",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "List all usage records for a promotion - Admin only",
        tags: ["Promotion Usage"],
        summary: "List Promotion Usage",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["promoId"],
          properties: {
            promoId: {
              type: "string",
              format: "uuid",
              description: "Promotion ID",
            },
          },
        },
        response: {
          200: {
            description: "Promotion usage records retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    async (req: any, reply: any) => promotionUsageController.list(req, reply)
  );

  // =============================================================================
  // WEBHOOK ROUTES
  // =============================================================================

  // Process payment webhook
  fastify.post(
    "/webhooks/payment",
    {
      schema: {
        description:
          "Process payment provider webhook events (Stripe, PayPal, etc.)",
        tags: ["Webhooks"],
        summary: "Process Payment Webhook",
        body: {
          type: "object",
          required: ["provider", "event"],
          properties: {
            provider: {
              type: "string",
              enum: ["stripe", "paypal", "razorpay"],
              description: "Payment provider",
            },
            event: {
              type: "object",
              description: "Webhook event payload (JSONB)",
            },
            signature: {
              type: "string",
              description: "Webhook signature for verification",
            },
          },
        },
        response: {
          200: {
            description: "Webhook processed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
        },
      },
    },
    async (req: any, reply: any) =>
      paymentWebhookController.processWebhook(req, reply)
  );

  // List webhook events
  fastify.get(
    "/webhooks/events",
    {
      preHandler: authenticateAdmin,
      schema: {
        description:
          "List all received payment webhook events with optional filtering by provider or status - Admin only",
        tags: ["Webhooks"],
        summary: "List Webhook Events",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            provider: {
              type: "string",
              enum: ["stripe", "paypal", "razorpay"],
              description: "Filter by provider",
            },
            status: {
              type: "string",
              description: "Filter by processing status",
            },
            limit: {
              type: "number",
              minimum: 1,
              maximum: 100,
              default: 50,
              description: "Limit results",
            },
            offset: {
              type: "number",
              minimum: 0,
              default: 0,
              description: "Offset for pagination",
            },
          },
        },
        response: {
          200: {
            description: "Webhook events retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    async (req: any, reply: any) =>
      paymentWebhookController.listWebhookEvents(req, reply)
  );

  // =============================================================================
  // LOYALTY ROUTES
  // =============================================================================

  // Create loyalty program
  fastify.post(
    "/loyalty/programs",
    {
      preHandler: authenticateAdmin,
      schema: {
        description:
          "Create a new loyalty program with tier configuration and redemption rules - Admin only",
        tags: ["Loyalty Programs"],
        summary: "Create Loyalty Program",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name", "config"],
          properties: {
            name: { type: "string", description: "Loyalty program name" },
            config: {
              type: "object",
              description: "Tier configuration and rules (JSONB)",
            },
            startDate: {
              type: "string",
              format: "date-time",
              description: "Program start date",
            },
            endDate: {
              type: "string",
              format: "date-time",
              description: "Program end date",
            },
          },
        },
        response: {
          201: {
            description: "Loyalty program created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => loyaltyProgramController.create(req, reply)
  );

  // Award loyalty points
  fastify.post(
    "/loyalty/points/award",
    {
      preHandler: authenticateStaff,
      schema: {
        description:
          "Award loyalty points to a customer for a purchase or action - Staff/Admin only",
        tags: ["Loyalty Transactions"],
        summary: "Award Loyalty Points",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["customerId", "programId", "points"],
          properties: {
            customerId: {
              type: "string",
              format: "uuid",
              description: "Customer ID",
            },
            programId: {
              type: "string",
              format: "uuid",
              description: "Loyalty program ID",
            },
            points: {
              type: "number",
              minimum: 1,
              description: "Points to award",
            },
            reason: {
              type: "string",
              description: "Reason for awarding points",
            },
            orderId: {
              type: "string",
              format: "uuid",
              description: "Related order ID (optional)",
            },
          },
        },
        response: {
          201: {
            description: "Loyalty points awarded successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => loyaltyTxnController.award(req, reply)
  );

  // Redeem loyalty points
  fastify.post(
    "/loyalty/points/redeem",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Redeem loyalty points for a discount or reward",
        tags: ["Loyalty Transactions"],
        summary: "Redeem Loyalty Points",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["customerId", "programId", "points"],
          properties: {
            customerId: {
              type: "string",
              format: "uuid",
              description: "Customer ID",
            },
            programId: {
              type: "string",
              format: "uuid",
              description: "Loyalty program ID",
            },
            points: {
              type: "number",
              minimum: 1,
              description: "Points to redeem",
            },
            reason: { type: "string", description: "Redemption reason" },
            orderId: {
              type: "string",
              format: "uuid",
              description: "Related order ID (optional)",
            },
          },
        },
        response: {
          201: {
            description: "Loyalty points redeemed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: errorResponses[400],
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => loyaltyTxnController.redeem(req, reply)
  );

  // Get loyalty account
  fastify.get(
    "/loyalty/account",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Get loyalty account details for a customer including balance and tier",
        tags: ["Loyalty Accounts"],
        summary: "Get Loyalty Account",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          required: ["userId", "programId"],
          properties: {
            userId: {
              type: "string",
              format: "uuid",
              description: "Customer/User ID",
            },
            programId: {
              type: "string",
              format: "uuid",
              description: "Loyalty program ID",
            },
          },
        },
        response: {
          200: {
            description: "Loyalty account retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          401: errorResponses[401],
          404: errorResponses[404],
        },
      },
    },
    async (req: any, reply: any) => loyaltyAccountController.get(req, reply)
  );

  // List loyalty programs
  fastify.get(
    "/loyalty/programs",
    {
      schema: {
        description: "List all available loyalty programs",
        tags: ["Loyalty Programs"],
        summary: "List Loyalty Programs",
        response: {
          200: {
            description: "Loyalty programs retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    async (req: any, reply: any) => loyaltyProgramController.list(req, reply)
  );

  // List loyalty transactions
  fastify.get(
    "/loyalty/transactions",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "List loyalty transaction history filtered by account or order",
        tags: ["Loyalty Transactions"],
        summary: "List Loyalty Transactions",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              format: "uuid",
              description: "Filter by loyalty account ID",
            },
            orderId: {
              type: "string",
              format: "uuid",
              description: "Filter by order ID",
            },
            programId: {
              type: "string",
              format: "uuid",
              description: "Filter by program ID",
            },
            limit: {
              type: "number",
              minimum: 1,
              maximum: 100,
              default: 50,
              description: "Limit results",
            },
            offset: {
              type: "number",
              minimum: 0,
              default: 0,
              description: "Offset for pagination",
            },
          },
        },
        response: {
          200: {
            description: "Loyalty transactions retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
            },
          },
          401: errorResponses[401],
        },
      },
    },
    async (req: any, reply: any) => loyaltyTxnController.list(req, reply)
  );

  // =============================================================================
  // PAYABLE IPG ROUTES (Sri Lankan Payment Gateway)
  // =============================================================================

  // Only register PayableIPG routes if configured
  if (isPayableIPGConfigured()) {
    const payableIPGController = new PayableIPGController(
      services.paymentService
    );

    // Create PayableIPG payment
    fastify.post(
      "/payments/payable-ipg/create",
      {
        preHandler: authenticateUser,
        schema: {
          description:
            "Create a PayableIPG payment session and get redirect URL for checkout",
          tags: ["PayableIPG"],
          summary: "Create PayableIPG Payment",
          security: [{ bearerAuth: [] }],
          body: {
            type: "object",
            required: ["orderId", "amount", "customerEmail", "customerName"],
            properties: {
              orderId: {
                type: "string",
                format: "uuid",
                description: "Order ID",
              },
              amount: {
                type: "number",
                minimum: 0,
                description: "Payment amount in LKR",
              },
              customerEmail: {
                type: "string",
                format: "email",
                description: "Customer email",
              },
              customerName: { type: "string", description: "Customer name" },
              customerPhone: {
                type: "string",
                description: "Customer phone number",
              },
              returnUrl: {
                type: "string",
                description: "URL to redirect after successful payment",
              },
              cancelUrl: {
                type: "string",
                description: "URL to redirect after cancelled payment",
              },
              description: {
                type: "string",
                description: "Payment description",
              },
            },
          },
          response: {
            200: {
              description: "Payment session created successfully",
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                data: {
                  type: "object",
                  properties: {
                    intentId: { type: "string" },
                    transactionId: { type: "string" },
                    redirectUrl: { type: "string" },
                    status: { type: "string" },
                  },
                },
              },
            },
            400: errorResponses[400],
            401: errorResponses[401],
          },
        },
      },
      async (req: any, reply: any) =>
        payableIPGController.createPayment(req, reply)
    );

    // PayableIPG webhook handler (no authentication - validates signature)
    fastify.post(
      "/payments/payable-ipg/webhook",
      {
        schema: {
          description:
            "Handle PayableIPG webhook notifications for payment status updates",
          tags: ["PayableIPG"],
          summary: "PayableIPG Webhook Handler",
          body: {
            type: "object",
            properties: {
              event: { type: "string", description: "Event type" },
              transactionId: { type: "string", description: "Transaction ID" },
              orderId: { type: "string", description: "Order ID" },
              status: { type: "string", description: "Payment status" },
              amount: { type: "number", description: "Payment amount" },
            },
          },
          response: {
            200: {
              description: "Webhook processed successfully",
              type: "object",
              properties: {
                success: { type: "boolean", example: true },
                message: { type: "string" },
              },
            },
          },
        },
      },
      async (req: any, reply: any) =>
        payableIPGController.handleWebhook(req, reply)
    );

    // Verify PayableIPG payment
    fastify.get(
      "/payments/payable-ipg/verify/:transactionId",
      {
        preHandler: authenticateUser,
        schema: {
          description: "Verify PayableIPG payment status",
          tags: ["PayableIPG"],
          summary: "Verify Payment",
          security: [{ bearerAuth: [] }],
          params: {
            type: "object",
            required: ["transactionId"],
            properties: {
              transactionId: {
                type: "string",
                description: "PayableIPG transaction ID",
              },
            },
          },
          response: {
            200: {
              description: "Payment status retrieved successfully",
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { type: "object", additionalProperties: true },
              },
            },
            401: errorResponses[401],
          },
        },
      },
      async (req: any, reply: any) =>
        payableIPGController.verifyPayment(req, reply)
    );

    // Refund PayableIPG payment
    fastify.post(
      "/payments/payable-ipg/refund",
      {
        preHandler: authenticateStaff,
        schema: {
          description:
            "Process refund for PayableIPG payment - Staff/Admin only",
          tags: ["PayableIPG"],
          summary: "Refund Payment",
          security: [{ bearerAuth: [] }],
          body: {
            type: "object",
            required: ["transactionId"],
            properties: {
              transactionId: {
                type: "string",
                description: "PayableIPG transaction ID",
              },
              amount: {
                type: "number",
                minimum: 0,
                description:
                  "Refund amount (optional, full refund if not provided)",
              },
              reason: { type: "string", description: "Refund reason" },
            },
          },
          response: {
            200: {
              description: "Refund processed successfully",
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: { type: "object", additionalProperties: true },
              },
            },
            400: errorResponses[400],
            401: errorResponses[401],
          },
        },
      },
      async (req: any, reply: any) =>
        payableIPGController.refundPayment(req, reply)
    );

    // Get supported card types
    fastify.get(
      "/payments/payable-ipg/card-types",
      {
        schema: {
          description:
            "Get supported card types and recurring payment capabilities",
          tags: ["PayableIPG"],
          summary: "Get Card Types",
          response: {
            200: {
              description: "Card types retrieved successfully",
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "object",
                  properties: {
                    cardTypes: {
                      type: "array",
                      items: { type: "string" },
                    },
                    recurringSupport: { type: "object" },
                  },
                },
              },
            },
          },
        },
      },
      async (req: any, reply: any) =>
        payableIPGController.getCardTypes(req, reply)
    );

    fastify.log.info("PayableIPG payment routes registered successfully");
  } else {
    fastify.log.warn(
      "PayableIPG not configured - skipping PayableIPG routes registration"
    );
  }
}
