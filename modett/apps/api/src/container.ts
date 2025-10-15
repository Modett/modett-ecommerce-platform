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
} from "../../../modules/product-catalog/application/services";

// Cart imports
import {
  CartRepositoryImpl,
  ReservationRepositoryImpl,
} from "../../../modules/cart/infra/persistence/repositories";
import {
  CartManagementService,
  ReservationService,
} from "../../../modules/cart/application/services";

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

  // Cart Services
  cartManagementService: CartManagementService;
  reservationService: ReservationService;

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
}

export function createServiceContainer(): ServiceContainer {
  // Initialize Prisma client
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
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

  // Initialize Cart repositories
  const cartRepository = new CartRepositoryImpl(prisma);
  const reservationRepository = new ReservationRepositoryImpl(prisma);

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
  const purchaseOrderItemRepository = new PurchaseOrderItemRepositoryImpl(prisma);
  const stockAlertRepository = new StockAlertRepositoryImpl(prisma);
  const pickupReservationRepository = new PickupReservationRepositoryImpl(prisma);
  const inventoryTransactionRepository = new InventoryTransactionRepositoryImpl(prisma);

  // Initialize Fulfillment repositories
  const shipmentRepository = new ShipmentRepositoryImpl(prisma);
  const shipmentItemRepository = new ShipmentItemRepositoryImpl(prisma);

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
    orderEventService
  );

  // Initialize Inventory Management services
  const stockManagementService = new StockManagementService(
    stockRepository,
    inventoryTransactionRepository
  );
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
  const shipmentItemService = new ShipmentItemService(
    shipmentItemRepository
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

    // Cart Services
    cartManagementService,
    reservationService,

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
  };
}

export async function closeServiceContainer(
  container: ServiceContainer
): Promise<void> {
  await container.prisma.$disconnect();
}
