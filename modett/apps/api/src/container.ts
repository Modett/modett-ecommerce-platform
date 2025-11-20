import { PrismaClient } from "@prisma/client";

// User Management imports
import { UserRepository } from "../../../modules/user-management/infra/persistence/repositories/user.repository";
import { AddressRepository } from "../../../modules/user-management/infra/persistence/repositories/address.repository";
import { UserProfileRepository } from "../../../modules/user-management/infra/persistence/repositories/user-profile.repository";
import { PaymentMethodRepository } from "../../../modules/user-management/infra/persistence/repositories/payment-method.repository";
import { AuthenticationService } from "../../../modules/user-management/application/services/authentication.service";
import { AddressManagementService } from "../../../modules/user-management/application/services/address-management.service";
import { UserProfileService } from "../../../modules/user-management/application/services/user-profile.service";
import { PaymentMethodService } from "../../../modules/user-management/application/services/payment-method.service";
import { PasswordHasherService } from "../../../modules/user-management/application/services/password-hasher.service";

// Product Catalog imports
import {
  ProductRepository,
  ProductVariantRepository,
  CategoryRepository,
  MediaAssetRepository,
  ProductTagRepository,
  SizeGuideRepository,
  EditorialLookRepository,
  ProductMediaRepository,
} from "../../../modules/product-catalog/infra/persistence/repositories";
import {
  ProductManagementService,
  CategoryManagementService,
  MediaManagementService,
  VariantManagementService,
  ProductSearchService,
  SlugGeneratorService,
  ProductTagManagementService,
  SizeGuideManagementService,
  EditorialLookManagementService,
  ProductMediaManagementService,
} from "../../../modules/product-catalog/application/services";

// Cart imports
import {
  CartRepositoryImpl,
  ReservationRepositoryImpl,
} from "../../../modules/cart/infra/persistence/repositories";
import { CheckoutRepositoryImpl } from "../../../modules/cart/infra/persistence/repositories/checkout.repository.impl";
import {
  CartManagementService,
  ReservationService,
} from "../../../modules/cart/application/services";
import { CheckoutService } from "../../../modules/cart/application/services/checkout.service";
import { CheckoutOrderService } from "../../../modules/cart/application/services/checkout-order.service";

// Order Management imports
import { OrderRepositoryImpl } from "../../../modules/order-management/infra/persistence/repositories/order.repository.impl";
import { OrderAddressRepositoryImpl } from "../../../modules/order-management/infra/persistence/repositories/order-address.repository.impl";
import { OrderItemRepositoryImpl } from "../../../modules/order-management/infra/persistence/repositories/order-item.repository.impl";
import { OrderShipmentRepositoryImpl } from "../../../modules/order-management/infra/persistence/repositories/order-shipment.repository.impl";
import { OrderStatusHistoryRepositoryImpl } from "../../../modules/order-management/infra/persistence/repositories/order-status-history.repository.impl";
import { OrderEventRepositoryImpl } from "../../../modules/order-management/infra/persistence/repositories/order-event.repository.impl";
import { PreorderRepositoryImpl } from "../../../modules/order-management/infra/persistence/repositories/preorder.repository.impl";
import { BackorderRepositoryImpl } from "../../../modules/order-management/infra/persistence/repositories/backorder.repository.impl";
import { OrderManagementService } from "../../../modules/order-management/application/services/order-management.service";
import { OrderEventService } from "../../../modules/order-management/application/services/order-event.service";
import { PreorderManagementService } from "../../../modules/order-management/application/services/preorder-management.service";
import { BackorderManagementService } from "../../../modules/order-management/application/services/backorder-management.service";

// Inventory Management imports
import { StockRepositoryImpl } from "../../../modules/inventory-management/infra/persistence/repositories/stock.repository.impl";
import { LocationRepositoryImpl } from "../../../modules/inventory-management/infra/persistence/repositories/location.repository.impl";
import { SupplierRepositoryImpl } from "../../../modules/inventory-management/infra/persistence/repositories/supplier.repository.impl";
import { PurchaseOrderRepositoryImpl } from "../../../modules/inventory-management/infra/persistence/repositories/purchase-order.repository.impl";
import { PurchaseOrderItemRepositoryImpl } from "../../../modules/inventory-management/infra/persistence/repositories/purchase-order-item.repository.impl";
import { StockAlertRepositoryImpl } from "../../../modules/inventory-management/infra/persistence/repositories/stock-alert.repository.impl";
import { PickupReservationRepositoryImpl } from "../../../modules/inventory-management/infra/persistence/repositories/pickup-reservation.repository.impl";
import { InventoryTransactionRepositoryImpl } from "../../../modules/inventory-management/infra/persistence/repositories/inventory-transaction.repository.impl";
import { StockManagementService } from "../../../modules/inventory-management/application/services/stock-management.service";
import { LocationManagementService } from "../../../modules/inventory-management/application/services/location-management.service";
import { SupplierManagementService } from "../../../modules/inventory-management/application/services/supplier-management.service";
import { PurchaseOrderManagementService } from "../../../modules/inventory-management/application/services/purchase-order-management.service";
import { StockAlertService } from "../../../modules/inventory-management/application/services/stock-alert.service";
import { PickupReservationService } from "../../../modules/inventory-management/application/services/pickup-reservation.service";

// Fulfillment imports
import { ShipmentRepositoryImpl } from "../../../modules/fulfillment/infra/persistence/repositories/shipment.repository.impl";
import { ShipmentItemRepositoryImpl } from "../../../modules/fulfillment/infra/persistence/repositories/shipment-item.repository.impl";
import { ShipmentService } from "../../../modules/fulfillment/application/services/shipment.service";
import { ShipmentItemService } from "../../../modules/fulfillment/application/services/shipment-item.service";

// Payment & Loyalty imports
import {
  BnplTransactionRepository,
  GiftCardRepository,
  GiftCardTransactionRepository,
  LoyaltyAccountRepository,
  LoyaltyProgramRepository,
  LoyaltyTransactionRepository,
  PaymentIntentRepository,
  PaymentTransactionRepository,
  PaymentWebhookEventRepository,
  PromotionRepository,
  PromotionUsageRepository,
} from "../../../modules/payment-loyalty/infra/persistence/repositories";
import {
  PaymentService,
  BnplTransactionService,
  GiftCardService,
  PromotionService,
  PaymentWebhookService,
} from "../../../modules/payment-loyalty/application/services";
import { LoyaltyService } from "../../../modules/payment-loyalty/application/services/loyalty.service";
import { LoyaltyTransactionService } from "../../../modules/payment-loyalty/application/services/loyalty-transaction.service";

// Customer Care imports
import {
  SupportTicketRepositoryImpl,
  TicketMessageRepositoryImpl,
  SupportAgentRepositoryImpl,
  ChatSessionRepositoryImpl,
  ChatMessageRepositoryImpl,
  ReturnRequestRepositoryImpl,
  ReturnItemRepositoryImpl,
  RepairRepositoryImpl,
  GoodwillRecordRepositoryImpl,
  CustomerFeedbackRepositoryImpl,
} from "../../../modules/customer-care/infra/persistence/repositories";
import {
  SupportTicketService,
  TicketMessageService,
  SupportAgentService,
  ChatSessionService,
  ChatMessageService,
  ReturnRequestService,
  ReturnItemService,
  RepairService,
  GoodwillRecordService,
  CustomerFeedbackService,
} from "../../../modules/customer-care/application/services";

// Engagement imports
import {
  WishlistRepositoryImpl,
  WishlistItemRepositoryImpl,
  ReminderRepositoryImpl,
  NotificationRepositoryImpl,
  AppointmentRepositoryImpl,
  ProductReviewRepositoryImpl,
  NewsletterSubscriptionRepositoryImpl,
} from "../../../modules/engagement/infra/persistence/repositories";
import {
  WishlistManagementService,
  ReminderManagementService,
  NotificationService,
  AppointmentService,
  ProductReviewService,
  NewsletterService,
} from "../../../modules/engagement/application/services";

export interface ServiceContainer {
  // Infrastructure
  prisma: PrismaClient;

  // User Management Repositories
  userRepository: UserRepository;
  addressRepository: AddressRepository;
  userProfileRepository: UserProfileRepository;
  paymentMethodRepository: PaymentMethodRepository;

  // Product Catalog Repositories
  productRepository: ProductRepository;
  productVariantRepository: ProductVariantRepository;
  categoryRepository: CategoryRepository;
  mediaAssetRepository: MediaAssetRepository;
  productTagRepository: ProductTagRepository;
  sizeGuideRepository: SizeGuideRepository;
  editorialLookRepository: EditorialLookRepository;
  productMediaRepository: ProductMediaRepository;

  // Cart Repositories
  cartRepository: CartRepositoryImpl;
  reservationRepository: ReservationRepositoryImpl;

  // Order Management Repositories
  orderRepository: OrderRepositoryImpl;
  orderAddressRepository: OrderAddressRepositoryImpl;
  orderItemRepository: OrderItemRepositoryImpl;
  orderShipmentRepository: OrderShipmentRepositoryImpl;
  orderStatusHistoryRepository: OrderStatusHistoryRepositoryImpl;
  orderEventRepository: OrderEventRepositoryImpl;
  preorderRepository: PreorderRepositoryImpl;
  backorderRepository: BackorderRepositoryImpl;

  // Inventory Management Repositories
  stockRepository: StockRepositoryImpl;
  locationRepository: LocationRepositoryImpl;
  supplierRepository: SupplierRepositoryImpl;
  purchaseOrderRepository: PurchaseOrderRepositoryImpl;
  purchaseOrderItemRepository: PurchaseOrderItemRepositoryImpl;
  stockAlertRepository: StockAlertRepositoryImpl;
  pickupReservationRepository: PickupReservationRepositoryImpl;
  inventoryTransactionRepository: InventoryTransactionRepositoryImpl;

  // User Management Services
  authService: AuthenticationService;
  userProfileService: UserProfileService;
  addressService: AddressManagementService;
  paymentMethodService: PaymentMethodService;
  passwordHasher: PasswordHasherService;

  // Product Catalog Services
  slugGeneratorService: SlugGeneratorService;
  productManagementService: ProductManagementService;
  categoryManagementService: CategoryManagementService;
  mediaManagementService: MediaManagementService;
  variantManagementService: VariantManagementService;
  productSearchService: ProductSearchService;
  productTagManagementService: ProductTagManagementService;
  sizeGuideManagementService: SizeGuideManagementService;
  editorialLookManagementService: EditorialLookManagementService;
  productMediaManagementService: ProductMediaManagementService;

  // Cart Services
  cartManagementService: CartManagementService;
  reservationService: ReservationService;
  checkoutService: CheckoutService;
  checkoutOrderService: CheckoutOrderService;

  // Order Management Services
  orderManagementService: OrderManagementService;
  orderEventService: OrderEventService;
  preorderManagementService: PreorderManagementService;
  backorderManagementService: BackorderManagementService;

  // Inventory Management Services
  stockManagementService: StockManagementService;
  locationManagementService: LocationManagementService;
  supplierManagementService: SupplierManagementService;
  purchaseOrderManagementService: PurchaseOrderManagementService;
  stockAlertService: StockAlertService;
  pickupReservationService: PickupReservationService;

  // Fulfillment Services
  shipmentService: ShipmentService;
  shipmentItemService: ShipmentItemService;

  // Payment & Loyalty Repositories
  paymentIntentRepository: PaymentIntentRepository;
  paymentTransactionRepository: PaymentTransactionRepository;
  bnplTransactionRepository: BnplTransactionRepository;
  giftCardRepository: GiftCardRepository;
  giftCardTransactionRepository: GiftCardTransactionRepository;
  promotionRepository: PromotionRepository;
  promotionUsageRepository: PromotionUsageRepository;
  loyaltyProgramRepository: LoyaltyProgramRepository;
  loyaltyAccountRepository: LoyaltyAccountRepository;
  loyaltyTransactionRepository: LoyaltyTransactionRepository;
  paymentWebhookEventRepository: PaymentWebhookEventRepository;

  // Payment & Loyalty Services
  paymentService: PaymentService;
  bnplTransactionService: BnplTransactionService;
  giftCardService: GiftCardService;
  promotionService: PromotionService;
  paymentWebhookService: PaymentWebhookService;
  loyaltyService: LoyaltyService;
  loyaltyTransactionService: LoyaltyTransactionService;

  // Customer Care Repositories
  supportTicketRepository: SupportTicketRepositoryImpl;
  ticketMessageRepository: TicketMessageRepositoryImpl;
  supportAgentRepository: SupportAgentRepositoryImpl;
  chatSessionRepository: ChatSessionRepositoryImpl;
  chatMessageRepository: ChatMessageRepositoryImpl;
  returnRequestRepository: ReturnRequestRepositoryImpl;
  returnItemRepository: ReturnItemRepositoryImpl;
  repairRepository: RepairRepositoryImpl;
  goodwillRecordRepository: GoodwillRecordRepositoryImpl;
  customerFeedbackRepository: CustomerFeedbackRepositoryImpl;

  // Customer Care Services
  supportTicketService: SupportTicketService;
  ticketMessageService: TicketMessageService;
  supportAgentService: SupportAgentService;
  chatSessionService: ChatSessionService;
  chatMessageService: ChatMessageService;
  returnRequestService: ReturnRequestService;
  returnItemService: ReturnItemService;
  repairService: RepairService;
  goodwillRecordService: GoodwillRecordService;
  customerFeedbackService: CustomerFeedbackService;

  // Engagement Repositories
  wishlistRepository: WishlistRepositoryImpl;
  wishlistItemRepository: WishlistItemRepositoryImpl;
  reminderRepository: ReminderRepositoryImpl;
  notificationRepository: NotificationRepositoryImpl;
  appointmentRepository: AppointmentRepositoryImpl;
  productReviewRepository: ProductReviewRepositoryImpl;
  newsletterSubscriptionRepository: NewsletterSubscriptionRepositoryImpl;

  // Engagement Services
  wishlistManagementService: WishlistManagementService;
  reminderManagementService: ReminderManagementService;
  notificationService: NotificationService;
  appointmentService: AppointmentService;
  productReviewService: ProductReviewService;
  newsletterService: NewsletterService;
}

export function createServiceContainer(): ServiceContainer {
  // Initialize Prisma client
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? process.env.PRISMA_LOG_QUERIES === "true"
          ? ["query", "info", "warn", "error"]
          : ["info", "warn", "error"]
        : ["warn", "error"],
  });

  // Initialize User Management repositories
  const userRepository = new UserRepository(prisma);
  const addressRepository = new AddressRepository(prisma);
  const userProfileRepository = new UserProfileRepository(prisma);
  const paymentMethodRepository = new PaymentMethodRepository(prisma);
  // Initialize Product Catalog repositories
  const productRepository = new ProductRepository(prisma);
  const productVariantRepository = new ProductVariantRepository(prisma);
  const categoryRepository = new CategoryRepository(prisma);
  const mediaAssetRepository = new MediaAssetRepository(prisma);
  const productTagRepository = new ProductTagRepository(prisma);
  const sizeGuideRepository = new SizeGuideRepository(prisma);
  const editorialLookRepository = new EditorialLookRepository(prisma);
  const productMediaRepository = new ProductMediaRepository(prisma);

  // Initialize Cart repositories (reservationRepository moved after stockManagementService is created)
  const cartRepository = new CartRepositoryImpl(prisma);

  // Initialize Order Management repositories
  const orderRepository = new OrderRepositoryImpl(prisma);
  const orderAddressRepository = new OrderAddressRepositoryImpl(prisma);
  const orderItemRepository = new OrderItemRepositoryImpl(prisma);
  const orderShipmentRepository = new OrderShipmentRepositoryImpl(prisma);
  const orderStatusHistoryRepository = new OrderStatusHistoryRepositoryImpl(
    prisma
  );
  const orderEventRepository = new OrderEventRepositoryImpl(prisma);
  const preorderRepository = new PreorderRepositoryImpl(prisma);
  const backorderRepository = new BackorderRepositoryImpl(prisma);

  // Initialize Inventory Management repositories
  const stockRepository = new StockRepositoryImpl(prisma);
  const locationRepository = new LocationRepositoryImpl(prisma);
  const supplierRepository = new SupplierRepositoryImpl(prisma);
  const purchaseOrderRepository = new PurchaseOrderRepositoryImpl(prisma);
  const purchaseOrderItemRepository = new PurchaseOrderItemRepositoryImpl(
    prisma
  );
  const stockAlertRepository = new StockAlertRepositoryImpl(prisma);
  const pickupReservationRepository = new PickupReservationRepositoryImpl(
    prisma
  );
  const inventoryTransactionRepository = new InventoryTransactionRepositoryImpl(
    prisma
  );

  // Initialize Fulfillment repositories
  const shipmentRepository = new ShipmentRepositoryImpl(prisma);
  const shipmentItemRepository = new ShipmentItemRepositoryImpl(prisma);

  // Initialize Payment & Loyalty repositories
  const paymentIntentRepository = new PaymentIntentRepository(prisma);
  const paymentTransactionRepository = new PaymentTransactionRepository(prisma);
  const bnplTransactionRepository = new BnplTransactionRepository(prisma);
  const giftCardRepository = new GiftCardRepository(prisma);
  const giftCardTransactionRepository = new GiftCardTransactionRepository(
    prisma
  );
  const promotionRepository = new PromotionRepository(prisma);
  const promotionUsageRepository = new PromotionUsageRepository(prisma);
  const loyaltyProgramRepository = new LoyaltyProgramRepository(prisma);
  const loyaltyAccountRepository = new LoyaltyAccountRepository(prisma);
  const loyaltyTransactionRepository = new LoyaltyTransactionRepository(prisma);
  const paymentWebhookEventRepository = new PaymentWebhookEventRepository(
    prisma
  );

  // Initialize core services
  const passwordHasher = new PasswordHasherService();
  const slugGeneratorService = new SlugGeneratorService();

  // Initialize authentication service
  const authService = new AuthenticationService(
    userRepository,
    passwordHasher,
    {
      accessTokenSecret:
        process.env.JWT_SECRET || "fallback-secret-change-in-production",
      refreshTokenSecret:
        process.env.JWT_SECRET || "fallback-secret-change-in-production",
      accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || "6h",
      refreshTokenExpiresIn: "7d",
    }
  );

  // Initialize address service
  const addressService = new AddressManagementService(addressRepository);

  // Initialize User Profile and Payment Method services
  const userProfileService = new UserProfileService(
    userRepository,
    userProfileRepository,
    addressRepository,
    paymentMethodRepository
  );
  const paymentMethodService = new PaymentMethodService(
    paymentMethodRepository,
    userRepository,
    addressRepository
  );

  // Initialize Product Catalog services
  const productManagementService = new ProductManagementService(
    productRepository
  );
  const categoryManagementService = new CategoryManagementService(
    categoryRepository,
    slugGeneratorService
  );
  const mediaManagementService = new MediaManagementService(
    mediaAssetRepository
  );
  const variantManagementService = new VariantManagementService(
    productVariantRepository,
    productRepository
  );
  const productSearchService = new ProductSearchService(
    productRepository,
    categoryRepository
  );
  const productTagManagementService = new ProductTagManagementService(
    productTagRepository
  );
  const sizeGuideManagementService = new SizeGuideManagementService(
    sizeGuideRepository
  );
  const editorialLookManagementService = new EditorialLookManagementService(
    editorialLookRepository,
    mediaAssetRepository,
    productRepository
  );
  const productMediaManagementService = new ProductMediaManagementService(
    productMediaRepository,
    mediaAssetRepository,
    productRepository
  );

  // Initialize Inventory Management services first (needed by dependencies)
  const stockManagementService = new StockManagementService(
    stockRepository,
    inventoryTransactionRepository
  );

  // Initialize Cart repositories that depend on inventory service
  const reservationRepository = new ReservationRepositoryImpl(
    prisma,
    stockManagementService
  );

  // Initialize Cart services
  const cartManagementService = new CartManagementService(
    cartRepository,
    reservationRepository,
    productVariantRepository
  );
  const reservationService = new ReservationService(
    reservationRepository,
    cartRepository
  );
  const checkoutRepository = new CheckoutRepositoryImpl(prisma);
  const checkoutService = new CheckoutService(
    checkoutRepository,
    cartRepository
  );
  const checkoutOrderService = new CheckoutOrderService(
    prisma,
    checkoutRepository,
    cartRepository
  );

  // Initialize Order Management services
  const orderEventService = new OrderEventService(orderEventRepository);
  const preorderManagementService = new PreorderManagementService(
    preorderRepository
  );
  const backorderManagementService = new BackorderManagementService(
    backorderRepository
  );

  const orderManagementService = new OrderManagementService(
    orderRepository,
    orderAddressRepository,
    orderItemRepository,
    orderShipmentRepository,
    orderStatusHistoryRepository,
    variantManagementService,
    productManagementService,
    stockManagementService,
    orderEventService
  );

  // Continue with other Inventory Management services
  const locationManagementService = new LocationManagementService(
    locationRepository
  );
  const supplierManagementService = new SupplierManagementService(
    supplierRepository
  );
  const purchaseOrderManagementService = new PurchaseOrderManagementService(
    purchaseOrderRepository,
    purchaseOrderItemRepository,
    stockManagementService
  );
  const stockAlertService = new StockAlertService(
    stockAlertRepository,
    stockRepository
  );
  const pickupReservationService = new PickupReservationService(
    pickupReservationRepository,
    stockManagementService
  );

  // Initialize Fulfillment services
  const shipmentService = new ShipmentService(
    shipmentRepository,
    shipmentItemRepository
  );
  const shipmentItemService = new ShipmentItemService(shipmentItemRepository);

  // Initialize Payment & Loyalty services
  const paymentService = new PaymentService(
    prisma,
    paymentIntentRepository,
    paymentTransactionRepository
  );
  const bnplTransactionService = new BnplTransactionService(
    prisma,
    bnplTransactionRepository
  );
  const giftCardService = new GiftCardService(
    prisma,
    giftCardRepository,
    giftCardTransactionRepository
  );
  const promotionService = new PromotionService(
    prisma,
    promotionRepository,
    promotionUsageRepository
  );
  const paymentWebhookService = new PaymentWebhookService(
    paymentWebhookEventRepository
  );
  const loyaltyService = new LoyaltyService(
    prisma,
    loyaltyAccountRepository,
    loyaltyProgramRepository,
    loyaltyTransactionRepository
  );
  const loyaltyTransactionService = new LoyaltyTransactionService(
    loyaltyTransactionRepository
  );

  // Initialize Customer Care repositories
  const supportTicketRepository = new SupportTicketRepositoryImpl(prisma);
  const ticketMessageRepository = new TicketMessageRepositoryImpl(prisma);
  const supportAgentRepository = new SupportAgentRepositoryImpl(prisma);
  const chatSessionRepository = new ChatSessionRepositoryImpl(prisma);
  const chatMessageRepository = new ChatMessageRepositoryImpl(prisma);
  const returnRequestRepository = new ReturnRequestRepositoryImpl(prisma);
  const returnItemRepository = new ReturnItemRepositoryImpl(prisma);
  const repairRepository = new RepairRepositoryImpl(prisma);
  const goodwillRecordRepository = new GoodwillRecordRepositoryImpl(prisma);
  const customerFeedbackRepository = new CustomerFeedbackRepositoryImpl(prisma);

  // Initialize Customer Care services
  const supportTicketService = new SupportTicketService(
    supportTicketRepository
  );
  const ticketMessageService = new TicketMessageService(
    ticketMessageRepository
  );
  const supportAgentService = new SupportAgentService(supportAgentRepository);
  const chatSessionService = new ChatSessionService(chatSessionRepository);
  const chatMessageService = new ChatMessageService(chatMessageRepository);
  const returnRequestService = new ReturnRequestService(
    returnRequestRepository
  );
  const returnItemService = new ReturnItemService(
    returnItemRepository,
    returnRequestRepository,
    orderManagementService
  );
  const repairService = new RepairService(repairRepository);
  const goodwillRecordService = new GoodwillRecordService(
    goodwillRecordRepository
  );
  const customerFeedbackService = new CustomerFeedbackService(
    customerFeedbackRepository,
    supportTicketService,
    orderManagementService
  );

  // Initialize Engagement repositories
  const wishlistRepository = new WishlistRepositoryImpl(prisma);
  const wishlistItemRepository = new WishlistItemRepositoryImpl(prisma);
  const reminderRepository = new ReminderRepositoryImpl(prisma);
  const notificationRepository = new NotificationRepositoryImpl(prisma);
  const appointmentRepository = new AppointmentRepositoryImpl(prisma);
  const productReviewRepository = new ProductReviewRepositoryImpl(prisma);
  const newsletterSubscriptionRepository =
    new NewsletterSubscriptionRepositoryImpl(prisma);

  // Initialize Engagement services
  const wishlistManagementService = new WishlistManagementService(
    wishlistRepository,
    wishlistItemRepository
  );
  const reminderManagementService = new ReminderManagementService(
    reminderRepository
  );
  const notificationService = new NotificationService(notificationRepository);
  const appointmentService = new AppointmentService(appointmentRepository);
  const productReviewService = new ProductReviewService(
    productReviewRepository
  );
  const newsletterService = new NewsletterService(
    newsletterSubscriptionRepository
  );

  return {
    // Infrastructure
    prisma,

    // User Management Repositories
    userRepository,
    addressRepository,
    userProfileRepository,
    paymentMethodRepository,

    // Product Catalog Repositories
    productRepository,
    productVariantRepository,
    categoryRepository,
    mediaAssetRepository,
    productTagRepository,
    sizeGuideRepository,
    editorialLookRepository,
    productMediaRepository,

    // Cart Repositories
    cartRepository,
    reservationRepository,

    // Order Management Repositories
    orderRepository,
    orderAddressRepository,
    orderItemRepository,
    orderShipmentRepository,
    orderStatusHistoryRepository,
    orderEventRepository,
    preorderRepository,
    backorderRepository,

    // Inventory Management Repositories
    stockRepository,
    locationRepository,
    supplierRepository,
    purchaseOrderRepository,
    purchaseOrderItemRepository,
    stockAlertRepository,
    pickupReservationRepository,
    inventoryTransactionRepository,

    // Payment & Loyalty Repositories
    paymentIntentRepository,
    paymentTransactionRepository,
    bnplTransactionRepository,
    giftCardRepository,
    giftCardTransactionRepository,
    promotionRepository,
    promotionUsageRepository,
    loyaltyProgramRepository,
    loyaltyAccountRepository,
    loyaltyTransactionRepository,
    paymentWebhookEventRepository,

    // User Management Services
    authService,
    userProfileService,
    addressService,
    paymentMethodService,
    passwordHasher,

    // Product Catalog Services
    slugGeneratorService,
    productManagementService,
    categoryManagementService,
    mediaManagementService,
    variantManagementService,
    productSearchService,
    productTagManagementService,
    sizeGuideManagementService,
    editorialLookManagementService,
    productMediaManagementService,

    // Cart Services
    cartManagementService,
    reservationService,
    checkoutService,
    checkoutOrderService,

    // Order Management Services
    orderManagementService,
    orderEventService,
    preorderManagementService,
    backorderManagementService,

    // Inventory Management Services
    stockManagementService,
    locationManagementService,
    supplierManagementService,
    purchaseOrderManagementService,
    stockAlertService,
    pickupReservationService,

    // Fulfillment Services
    shipmentService,
    shipmentItemService,

    // Payment & Loyalty Services
    paymentService,
    bnplTransactionService,
    giftCardService,
    promotionService,
    paymentWebhookService,
    loyaltyService,
    loyaltyTransactionService,

    // Customer Care Repositories
    supportTicketRepository,
    ticketMessageRepository,
    supportAgentRepository,
    chatSessionRepository,
    chatMessageRepository,
    returnRequestRepository,
    returnItemRepository,
    repairRepository,
    goodwillRecordRepository,
    customerFeedbackRepository,

    // Customer Care Services
    supportTicketService,
    ticketMessageService,
    supportAgentService,
    chatSessionService,
    chatMessageService,
    returnRequestService,
    returnItemService,
    repairService,
    goodwillRecordService,
    customerFeedbackService,

    // Engagement Repositories
    wishlistRepository,
    wishlistItemRepository,
    reminderRepository,
    notificationRepository,
    appointmentRepository,
    productReviewRepository,
    newsletterSubscriptionRepository,

    // Engagement Services
    wishlistManagementService,
    reminderManagementService,
    notificationService,
    appointmentService,
    productReviewService,
    newsletterService,
  };
}

export async function closeServiceContainer(
  container: ServiceContainer
): Promise<void> {
  await container.prisma.$disconnect();
}
