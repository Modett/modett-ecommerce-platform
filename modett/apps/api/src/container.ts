import { PrismaClient } from '@prisma/client';

// User Management imports
import { UserRepository } from '../../../modules/user-management/infra/persistence/repositories/user.repository';
import { AddressRepository } from '../../../modules/user-management/infra/persistence/repositories/address.repository';
import { AuthenticationService } from '../../../modules/user-management/application/services/authentication.service';
import { AddressManagementService } from '../../../modules/user-management/application/services/address-management.service';
import { PasswordHasherService } from '../../../modules/user-management/application/services/password-hasher.service';

// Product Catalog imports
import {
  ProductRepository,
  ProductVariantRepository,
  CategoryRepository,
  MediaAssetRepository,
  ProductTagRepository,
} from '../../../modules/product-catalog/infra/persistence/repositories';
import {
  ProductManagementService,
  CategoryManagementService,
  MediaManagementService,
  VariantManagementService,
  ProductSearchService,
  SlugGeneratorService,
} from '../../../modules/product-catalog/application/services';

export interface ServiceContainer {
  // Infrastructure
  prisma: PrismaClient;

  // User Management Repositories
  userRepository: UserRepository;
  addressRepository: AddressRepository;

  // Product Catalog Repositories
  productRepository: ProductRepository;
  productVariantRepository: ProductVariantRepository;
  categoryRepository: CategoryRepository;
  mediaAssetRepository: MediaAssetRepository;
  productTagRepository: ProductTagRepository;

  // User Management Services
  authService: AuthenticationService;
  userProfileService: any; // Placeholder for now
  addressService: AddressManagementService;
  paymentMethodService: any; // Placeholder for now
  passwordHasher: PasswordHasherService;

  // Product Catalog Services
  slugGeneratorService: SlugGeneratorService;
  productManagementService: ProductManagementService;
  categoryManagementService: CategoryManagementService;
  mediaManagementService: MediaManagementService;
  variantManagementService: VariantManagementService;
  productSearchService: ProductSearchService;
}

export function createServiceContainer(): ServiceContainer {
  // Initialize Prisma client
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error']
  });

  // Initialize User Management repositories
  const userRepository = new UserRepository(prisma);
  const addressRepository = new AddressRepository(prisma);

  // Initialize Product Catalog repositories
  const productRepository = new ProductRepository(prisma);
  const productVariantRepository = new ProductVariantRepository(prisma);
  const categoryRepository = new CategoryRepository(prisma);
  const mediaAssetRepository = new MediaAssetRepository(prisma);
  const productTagRepository = new ProductTagRepository(prisma);

  // Initialize core services
  const passwordHasher = new PasswordHasherService();
  const slugGeneratorService = new SlugGeneratorService();

  // Initialize authentication service
  const authService = new AuthenticationService(
    userRepository,
    passwordHasher,
    {
      accessTokenSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      refreshTokenSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '6h',
      refreshTokenExpiresIn: '7d'
    }
  );

  // Initialize address service
  const addressService = new AddressManagementService(addressRepository);

  // Initialize Product Catalog services
  const productManagementService = new ProductManagementService(
    productRepository,
    productVariantRepository,
    slugGeneratorService
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

  // Create simplified placeholder services for now
  const userProfileService = {
    getCurrentUser: async (userId: string) => {
      const user = await userRepository.findById({ getValue: () => userId } as any);
      if (!user) throw new Error('User not found');
      const userData = user.toData();
      return {
        userId: userData.id,
        email: userData.email,
        phone: userData.phone,
        firstName: null, // Not in current schema
        lastName: null, // Not in current schema
        status: userData.status,
        emailVerified: userData.emailVerified,
        phoneVerified: userData.phoneVerified,
        isGuest: userData.isGuest,
        createdAt: userData.createdAt.toISOString(),
        updatedAt: userData.updatedAt.toISOString()
      };
    },
    getUserProfile: async (userId: string) => ({
      userId,
      defaultAddressId: null,
      defaultPaymentMethodId: null,
      prefs: {},
      locale: null,
      currency: null,
      stylePreferences: {},
      preferredSizes: {},
    }),
    updateUserProfile: async (userId: string, data: any) => ({
      userId,
      ...data,
      updatedAt: new Date().toISOString(),
    })
  };


  const paymentMethodService = {
    getCurrentUserPaymentMethods: async () => [],
    addPaymentMethod: async () => ({ success: true }),
    updatePaymentMethod: async () => ({ success: true }),
    deletePaymentMethod: async () => ({ success: true })
  };

  return {
    // Infrastructure
    prisma,

    // User Management Repositories
    userRepository,
    addressRepository,

    // Product Catalog Repositories
    productRepository,
    productVariantRepository,
    categoryRepository,
    mediaAssetRepository,
    productTagRepository,

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
  };
}

export async function closeServiceContainer(container: ServiceContainer): Promise<void> {
  await container.prisma.$disconnect();
}