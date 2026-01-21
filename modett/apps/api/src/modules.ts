import { FastifyInstance } from "fastify";
import { ServiceContainer } from "./container";

// Import route registration functions from all modules
import { registerProductCatalogRoutes } from "../../../modules/product-catalog/infra/http/routes";
import { registerUserManagementRoutes } from "../../../modules/user-management/infra/http/routes";
import { registerCartRoutes } from "../../../modules/cart/infra/http/routes";
import { registerOrderManagementRoutes } from "../../../modules/order-management/infra/http/routes";
import { registerInventoryManagementRoutes } from "../../../modules/inventory-management/infra/http/routes";
import { registerPaymentLoyaltyRoutes } from "../../../modules/payment-loyalty/infra/http/routes";
import { registerCustomerCareRoutes } from "../../../modules/customer-care/infra/http/routes";
import { registerEngagementRoutes } from "../../../modules/engagement/infra/http/routes";
import { registerFulfillmentRoutes } from "../../../modules/fulfillment/infra/http/routes";
import { registerAnalyticsRoutes } from "../../../modules/analytics/infra/http/routes";
import { registerAdminRoutes } from "../../../modules/admin/infra/http/routes";

export async function registerModules(
  server: FastifyInstance,
  container: ServiceContainer,
) {
  // Register Product Catalog Routes (Prefix: /api/v1/catalog)
  await server.register(
    async (fastify) => {
      await registerProductCatalogRoutes(fastify, {
        productService: container.productManagementService,
        productSearchService: container.productSearchService,
        categoryService: container.categoryManagementService,
        variantService: container.variantManagementService,
        mediaService: container.mediaManagementService,
        productTagService: container.productTagManagementService,
        sizeGuideService: container.sizeGuideManagementService,
        editorialLookService: container.editorialLookManagementService,
        productMediaService: container.productMediaManagementService,
        prisma: container.prisma,
      });
    },
    { prefix: "/api/v1/catalog" },
  );

  // Register User Management Routes (Prefix: /api/v1)
  await server.register(
    async (fastify) => {
      await registerUserManagementRoutes(fastify, {
        authService: container.authService,
        userProfileService: container.userProfileService,
        addressService: container.addressService,
        paymentMethodService: container.paymentMethodService,
        userRepository: container.userRepository,
        addressRepository: container.addressRepository,
      });
    },
    { prefix: "/api/v1" },
  );

  // Register Cart Routes (Prefix: /api/v1/cart)
  await server.register(
    async (fastify) => {
      await registerCartRoutes(fastify, {
        cartManagementService: container.cartManagementService,
        reservationService: container.reservationService,
        checkoutService: container.checkoutService,
        checkoutOrderService: container.checkoutOrderService,
      });
    },
    { prefix: "/api/v1/cart" },
  );

  // Register Order Management Routes (Prefix: /api/v1)
  await server.register(
    async (fastify) => {
      await registerOrderManagementRoutes(fastify, {
        orderService: container.orderManagementService,
        orderEventService: container.orderEventService,
        preorderService: container.preorderManagementService,
        backorderService: container.backorderManagementService,
      });
    },
    { prefix: "/api/v1" },
  );

  // Register Inventory Management Routes (Prefix: /api/v1/inventory)
  await server.register(
    async (fastify) => {
      await registerInventoryManagementRoutes(fastify, {
        stockService: container.stockManagementService,
        locationService: container.locationManagementService,
        supplierService: container.supplierManagementService,
        poService: container.purchaseOrderManagementService,
        alertService: container.stockAlertService,
        reservationService: container.pickupReservationService,
      });
    },
    { prefix: "/api/v1/inventory" },
  );

  // Register Payment & Loyalty Routes (Prefix: /api/v1)
  await server.register(
    async (fastify) => {
      await registerPaymentLoyaltyRoutes(fastify, {
        paymentService: container.paymentService,
        bnplService: container.bnplTransactionService,
        giftCardService: container.giftCardService,
        promotionService: container.promotionService,
        webhookService: container.paymentWebhookService,
        loyaltyService: container.loyaltyService,
        loyaltyTxnService: container.loyaltyTransactionService,
        checkoutOrderService: container.checkoutOrderService,
      });
    },
    { prefix: "/api/v1" },
  );

  // Register Customer Care Routes (Prefix: /api/v1)
  await server.register(
    async (fastify) => {
      await registerCustomerCareRoutes(fastify, {
        supportTicketService: container.supportTicketService,
        ticketMessageService: container.ticketMessageService,
        supportAgentService: container.supportAgentService,
        chatSessionService: container.chatSessionService,
        chatMessageService: container.chatMessageService,
        returnRequestService: container.returnRequestService,
        returnItemService: container.returnItemService,
        repairService: container.repairService,
        goodwillRecordService: container.goodwillRecordService,
        customerFeedbackService: container.customerFeedbackService,
      });
    },
    { prefix: "/api/v1" },
  );

  // Register Engagement Routes (Prefix: /api/v1)
  await server.register(
    async (fastify) => {
      await registerEngagementRoutes(fastify, {
        wishlistService: container.wishlistManagementService,
        reminderService: container.reminderManagementService,
        notificationService: container.notificationService,
        appointmentService: container.appointmentService,
        productReviewService: container.productReviewService,
        newsletterService: container.newsletterService,
        prisma: container.prisma,
      });
    },
    { prefix: "/api/v1" },
  );

  // Register Fulfillment Routes (Prefix: /api/v1/fulfillment)
  await server.register(
    async (fastify) => {
      await registerFulfillmentRoutes(fastify, {
        shipmentService: container.shipmentService,
        shipmentItemService: container.shipmentItemService,
      });
    },
    { prefix: "/api/v1/fulfillment" },
  );

  // Register Analytics Routes (Prefix: /api/v1/analytics)
  await server.register(
    async (fastify) => {
      await registerAnalyticsRoutes(fastify, {
        trackProductViewHandler: container.trackProductViewHandler,
        trackPurchaseHandler: container.trackPurchaseHandler,
        trackAddToCartHandler: container.trackAddToCartHandler,
        trackBeginCheckoutHandler: container.trackBeginCheckoutHandler,
        trackAddShippingInfoHandler: container.trackAddShippingInfoHandler,
        trackAddPaymentInfoHandler: container.trackAddPaymentInfoHandler,
      });
    },
    { prefix: "/api/v1/analytics" },
  );

  // Register Admin Routes (Prefix: /api/v1)
  await server.register(
    async (fastify) => {
      await registerAdminRoutes(fastify, {
        dashboardRepository: container.dashboardRepository,
        settingsService: container.settingsService,
      });
    },
    { prefix: "/api/v1" },
  );
}
