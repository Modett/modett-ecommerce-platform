import { FastifyInstance } from 'fastify';
import {
  AuthController,
  ProfileController,
  AddressesController,
  UsersController,
  PaymentMethodsController,
  SocialLoginController
} from './controllers';
import {
  AuthenticationService,
  UserProfileService,
  AddressManagementService,
  PaymentMethodService
} from '../../application';
import {
  authenticateUser,
  optionalAuth,
  authenticateVerifiedUser
} from './middleware/auth.middleware';

// Route registration function
export async function registerUserManagementRoutes(
  fastify: FastifyInstance,
  services: {
    authService: AuthenticationService;
    userProfileService: UserProfileService;
    addressService: AddressManagementService;
    paymentMethodService?: PaymentMethodService;
  }
) {
  // Initialize controllers
  const authController = new AuthController(services.authService);
  const profileController = new ProfileController(services.userProfileService);
  const addressesController = new AddressesController(services.addressService);
  const usersController = new UsersController(services.userProfileService);
  const paymentMethodsController = new PaymentMethodsController(services.paymentMethodService);
  const socialLoginController = new SocialLoginController();

  // Auth Routes (Public)
  fastify.post('/auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          phone: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' }
        }
      }
    }
  }, authController.register.bind(authController));

  fastify.post('/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          rememberMe: { type: 'boolean' }
        }
      }
    }
  }, authController.login.bind(authController));

  fastify.post('/auth/logout', {
    preHandler: authenticateUser
  }, authController.logout.bind(authController));

  fastify.post('/auth/refresh-token', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      }
    }
  }, authController.refreshToken.bind(authController));

  fastify.post('/auth/forgot-password', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' }
        }
      }
    }
  }, authController.forgotPassword.bind(authController));

  fastify.post('/auth/reset-password', {
    schema: {
      body: {
        type: 'object',
        required: ['token', 'newPassword', 'confirmPassword'],
        properties: {
          token: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
          confirmPassword: { type: 'string', minLength: 8 }
        }
      }
    }
  }, authController.resetPassword.bind(authController));

  fastify.post('/auth/verify-email', {
    schema: {
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' }
        }
      }
    }
  }, authController.verifyEmail.bind(authController));

  fastify.post('/auth/resend-verification', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' }
        }
      }
    }
  }, authController.resendVerification.bind(authController));

  fastify.post('/auth/change-password', {
    preHandler: authenticateUser,
    schema: {
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword', 'confirmPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
          confirmPassword: { type: 'string', minLength: 8 }
        }
      }
    }
  }, authController.changePassword.bind(authController) as any);

  // User Routes (Protected)
  fastify.get('/users/me', {
    preHandler: authenticateUser
  }, usersController.getCurrentUser.bind(usersController));

  fastify.get('/users/:userId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
        },
        required: ['userId']
      }
    }
  }, usersController.getUser.bind(usersController));

  // Profile Routes (Protected)
  fastify.get('/profile/me', {
    preHandler: authenticateUser
  }, profileController.getCurrentUserProfile.bind(profileController));

  fastify.put('/profile/me', {
    preHandler: authenticateUser,
    schema: {
      body: {
        type: 'object',
        properties: {
          defaultAddressId: { type: 'string', format: 'uuid' },
          defaultPaymentMethodId: { type: 'string', format: 'uuid' },
          preferences: { type: 'object' },
          locale: { type: 'string' },
          currency: { type: 'string' },
          stylePreferences: { type: 'object' },
          preferredSizes: { type: 'object' }
        }
      }
    }
  }, profileController.updateCurrentUserProfile.bind(profileController) as any);

  fastify.get('/users/:userId/profile', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
        },
        required: ['userId']
      }
    }
  }, profileController.getProfile.bind(profileController));

  fastify.put('/users/:userId/profile', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
        },
        required: ['userId']
      },
      body: {
        type: 'object',
        properties: {
          defaultAddressId: { type: 'string', format: 'uuid' },
          defaultPaymentMethodId: { type: 'string', format: 'uuid' },
          preferences: { type: 'object' },
          locale: { type: 'string' },
          currency: { type: 'string' },
          stylePreferences: { type: 'object' },
          preferredSizes: { type: 'object' }
        }
      }
    }
  }, profileController.updateProfile.bind(profileController));

  // Address Routes (Protected)
  fastify.get('/addresses/me', {
    preHandler: authenticateUser,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['billing', 'shipping'] }
        }
      }
    }
  }, addressesController.getCurrentUserAddresses.bind(addressesController) as any);

  fastify.post('/addresses/me', {
    preHandler: authenticateUser,
    schema: {
      body: {
        type: 'object',
        required: ['type', 'addressLine1', 'city', 'country'],
        properties: {
          type: { type: 'string', enum: ['billing', 'shipping'] },
          isDefault: { type: 'boolean' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          company: { type: 'string' },
          addressLine1: { type: 'string' },
          addressLine2: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' }
        }
      }
    }
  }, addressesController.addCurrentUserAddress.bind(addressesController) as any);

  fastify.get('/users/:userId/addresses', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
        },
        required: ['userId']
      },
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['billing', 'shipping'] }
        }
      }
    }
  }, addressesController.listAddresses.bind(addressesController));

  fastify.post('/users/:userId/addresses', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
        },
        required: ['userId']
      },
      body: {
        type: 'object',
        required: ['type', 'addressLine1', 'city', 'country'],
        properties: {
          type: { type: 'string', enum: ['billing', 'shipping'] },
          isDefault: { type: 'boolean' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          company: { type: 'string' },
          addressLine1: { type: 'string' },
          addressLine2: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' }
        }
      }
    }
  }, addressesController.addAddress.bind(addressesController));

  // Update and Delete Address Routes (Protected)
  fastify.put('/addresses/me/:addressId', {
    preHandler: authenticateUser,
    schema: {
      params: {
        type: 'object',
        properties: {
          addressId: { type: 'string', format: 'uuid' }
        },
        required: ['addressId']
      },
      body: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['billing', 'shipping'] },
          isDefault: { type: 'boolean' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          company: { type: 'string' },
          addressLine1: { type: 'string' },
          addressLine2: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' }
        }
      }
    }
  }, addressesController.updateCurrentUserAddress.bind(addressesController) as any);

  fastify.delete('/addresses/me/:addressId', {
    preHandler: authenticateUser,
    schema: {
      params: {
        type: 'object',
        properties: {
          addressId: { type: 'string', format: 'uuid' }
        },
        required: ['addressId']
      }
    }
  }, addressesController.deleteCurrentUserAddress.bind(addressesController) as any);

  fastify.put('/users/:userId/addresses/:addressId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          addressId: { type: 'string', format: 'uuid' }
        },
        required: ['userId', 'addressId']
      },
      body: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['billing', 'shipping'] },
          isDefault: { type: 'boolean' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          company: { type: 'string' },
          addressLine1: { type: 'string' },
          addressLine2: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' },
          postalCode: { type: 'string' },
          country: { type: 'string' },
          phone: { type: 'string' }
        }
      }
    }
  }, addressesController.updateAddress.bind(addressesController));

  fastify.delete('/users/:userId/addresses/:addressId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          addressId: { type: 'string', format: 'uuid' }
        },
        required: ['userId', 'addressId']
      }
    }
  }, addressesController.deleteAddress.bind(addressesController));

  // Payment Methods Routes (Protected)
  fastify.get('/payment-methods/me', {
    preHandler: authenticateUser
  }, paymentMethodsController.getCurrentUserPaymentMethods.bind(paymentMethodsController));

  fastify.post('/payment-methods/me', {
    preHandler: authenticateUser,
    schema: {
      body: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { type: 'string', enum: ['card', 'wallet', 'bank', 'cod', 'gift_card'] },
          brand: { type: 'string' },
          last4: { type: 'string', pattern: '^[0-9]{4}$' },
          expMonth: { type: 'number', minimum: 1, maximum: 12 },
          expYear: { type: 'number', minimum: 2024 },
          billingAddressId: { type: 'string', format: 'uuid' },
          providerRef: { type: 'string' },
          isDefault: { type: 'boolean' }
        }
      }
    }
  }, paymentMethodsController.addCurrentUserPaymentMethod.bind(paymentMethodsController) as any);

  fastify.put('/payment-methods/me/:paymentMethodId', {
    preHandler: authenticateUser,
    schema: {
      params: {
        type: 'object',
        properties: {
          paymentMethodId: { type: 'string', format: 'uuid' }
        },
        required: ['paymentMethodId']
      },
      body: {
        type: 'object',
        properties: {
          billingAddressId: { type: 'string', format: 'uuid' },
          isDefault: { type: 'boolean' }
        }
      }
    }
  }, paymentMethodsController.updateCurrentUserPaymentMethod.bind(paymentMethodsController) as any);

  fastify.delete('/payment-methods/me/:paymentMethodId', {
    preHandler: authenticateUser,
    schema: {
      params: {
        type: 'object',
        properties: {
          paymentMethodId: { type: 'string', format: 'uuid' }
        },
        required: ['paymentMethodId']
      }
    }
  }, paymentMethodsController.deleteCurrentUserPaymentMethod.bind(paymentMethodsController) as any);

  fastify.get('/users/:userId/payment-methods', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
        },
        required: ['userId']
      }
    }
  }, paymentMethodsController.listPaymentMethods.bind(paymentMethodsController));

  fastify.post('/users/:userId/payment-methods', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
        },
        required: ['userId']
      },
      body: {
        type: 'object',
        required: ['type'],
        properties: {
          type: { type: 'string', enum: ['card', 'wallet', 'bank', 'cod', 'gift_card'] },
          brand: { type: 'string' },
          last4: { type: 'string', pattern: '^[0-9]{4}$' },
          expMonth: { type: 'number', minimum: 1, maximum: 12 },
          expYear: { type: 'number', minimum: 2024 },
          billingAddressId: { type: 'string', format: 'uuid' },
          providerRef: { type: 'string' },
          isDefault: { type: 'boolean' }
        }
      }
    }
  }, paymentMethodsController.addPaymentMethod.bind(paymentMethodsController));

  fastify.put('/users/:userId/payment-methods/:paymentMethodId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          paymentMethodId: { type: 'string', format: 'uuid' }
        },
        required: ['userId', 'paymentMethodId']
      },
      body: {
        type: 'object',
        properties: {
          billingAddressId: { type: 'string', format: 'uuid' },
          isDefault: { type: 'boolean' }
        }
      }
    }
  }, paymentMethodsController.updatePaymentMethod.bind(paymentMethodsController));

  fastify.delete('/users/:userId/payment-methods/:paymentMethodId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' },
          paymentMethodId: { type: 'string', format: 'uuid' }
        },
        required: ['userId', 'paymentMethodId']
      }
    }
  }, paymentMethodsController.deletePaymentMethod.bind(paymentMethodsController));

  // Social Login Routes
  fastify.post('/auth/social/login', {
    schema: {
      body: {
        type: 'object',
        required: ['provider', 'providerUserId', 'accessToken'],
        properties: {
          provider: { type: 'string', enum: ['google', 'facebook', 'apple', 'twitter', 'github'] },
          providerUserId: { type: 'string' },
          accessToken: { type: 'string' },
          email: { type: 'string', format: 'email' },
          firstName: { type: 'string' },
          lastName: { type: 'string' }
        }
      }
    }
  }, socialLoginController.socialLogin.bind(socialLoginController));

  fastify.get('/auth/social/:provider', {
    schema: {
      params: {
        type: 'object',
        properties: {
          provider: { type: 'string', enum: ['google', 'facebook', 'apple', 'twitter', 'github'] }
        },
        required: ['provider']
      },
      querystring: {
        type: 'object',
        properties: {
          redirectUrl: { type: 'string' }
        }
      }
    }
  }, socialLoginController.initiateOAuthFlow.bind(socialLoginController));

  fastify.get('/auth/social/:provider/callback', {
    schema: {
      params: {
        type: 'object',
        properties: {
          provider: { type: 'string', enum: ['google', 'facebook', 'apple', 'twitter', 'github'] }
        },
        required: ['provider']
      },
      querystring: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          state: { type: 'string' },
          error: { type: 'string' }
        }
      }
    }
  }, socialLoginController.handleOAuthCallback.bind(socialLoginController));

  fastify.post('/social-accounts/me/link', {
    preHandler: authenticateUser,
    schema: {
      body: {
        type: 'object',
        required: ['provider', 'providerUserId', 'accessToken'],
        properties: {
          provider: { type: 'string', enum: ['google', 'facebook', 'apple', 'twitter', 'github'] },
          providerUserId: { type: 'string' },
          accessToken: { type: 'string' }
        }
      }
    }
  }, socialLoginController.linkSocialAccount.bind(socialLoginController) as any);

  fastify.get('/social-accounts/me', {
    preHandler: authenticateUser
  }, socialLoginController.getCurrentUserSocialAccounts.bind(socialLoginController));

  fastify.delete('/social-accounts/me/:socialId', {
    preHandler: authenticateUser,
    schema: {
      params: {
        type: 'object',
        properties: {
          socialId: { type: 'string', format: 'uuid' }
        },
        required: ['socialId']
      }
    }
  }, socialLoginController.unlinkSocialAccount.bind(socialLoginController) as any);

  fastify.get('/users/:userId/social-accounts', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', format: 'uuid' }
        },
        required: ['userId']
      }
    }
  }, socialLoginController.getUserSocialAccounts.bind(socialLoginController));
}