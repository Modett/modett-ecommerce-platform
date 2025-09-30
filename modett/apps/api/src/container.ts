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
} from "../../../modules/product-catalog/application/services";


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
  };
}

export async function closeServiceContainer(
  container: ServiceContainer
): Promise<void> {
  await container.prisma.$disconnect();
}
