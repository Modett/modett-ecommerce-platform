import { PrismaClient } from '@prisma/client';

// User Management imports
import { UserRepository } from '../../../modules/user-management/infra/persistence/repositories/user.repository';
import { AuthenticationService } from '../../../modules/user-management/application/services/authentication.service';
import { PasswordHasherService } from '../../../modules/user-management/application/services/password-hasher.service';

export interface ServiceContainer {
  // Infrastructure
  prisma: PrismaClient;

  // Repositories
  userRepository: UserRepository;

  // Services
  authService: AuthenticationService;
  userProfileService: any; // Placeholder for now
  addressService: any; // Placeholder for now
  paymentMethodService: any; // Placeholder for now
  passwordHasher: PasswordHasherService;
}

export function createServiceContainer(): ServiceContainer {
  // Initialize Prisma client
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error']
  });

  // Initialize repositories
  const userRepository = new UserRepository(prisma);

  // Initialize core services
  const passwordHasher = new PasswordHasherService();

  // Initialize authentication service
  const authService = new AuthenticationService(
    userRepository,
    passwordHasher,
    {
      accessTokenSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      refreshTokenSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshTokenExpiresIn: '7d'
    }
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

  const addressService = {
    getCurrentUserAddresses: async () => [],
    getUserAddresses: async () => [],
    addAddress: async () => ({ success: true }),
    updateAddress: async () => ({ success: true }),
    deleteAddress: async () => ({ success: true })
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

    // Repositories
    userRepository,

    // Services
    authService,
    userProfileService,
    addressService,
    paymentMethodService,
    passwordHasher
  };
}

export async function closeServiceContainer(container: ServiceContainer): Promise<void> {
  await container.prisma.$disconnect();
}