import { FastifyInstance } from "fastify";
import {
  AuthController,
  ProfileController,
  AddressesController,
  UsersController,
  PaymentMethodsController,
  SocialLoginController,
} from "./controllers";
import {
  AuthenticationService,
  UserProfileService,
  AddressManagementService,
  PaymentMethodService,
} from "../../application";
import {
  authenticateUser,
  optionalAuth,
  authenticateAdmin,
} from "./middleware/auth.middleware";
import { IUserRepository } from "../../domain/repositories/iuser.repository";
import { IAddressRepository } from "../../domain/repositories/iaddress.repository";

// Route registration function
export async function registerUserManagementRoutes(
  fastify: FastifyInstance,
  services: {
    authService: AuthenticationService;
    userProfileService: UserProfileService;
    addressService: AddressManagementService;
    paymentMethodService?: PaymentMethodService;
    userRepository: IUserRepository;
    addressRepository: IAddressRepository;
  },
) {
  // Initialize controllers
  const authController = new AuthController(
    services.authService,
    services.userRepository,
  );
  const profileController = new ProfileController(services.userProfileService);
  const addressesController = new AddressesController(services.addressService);
  const usersController = new UsersController(
    services.userProfileService,
    services.userRepository,
    services.addressRepository,
  );
  const paymentMethodsController = new PaymentMethodsController(
    services.paymentMethodService,
  );
  const socialLoginController = new SocialLoginController();

  // Auth Routes (Public)
  fastify.post(
    "/auth/register",
    {
      schema: {
        description: "Register a new user account with email verification",
        tags: ["Authentication"],
        summary: "Register New User",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Valid email address",
              example: "john.doe@example.com",
            },
            password: {
              type: "string",
              minLength: 8,
              description: "Password (min 8 characters)",
              example: "SecurePass123!",
            },
            phone: {
              type: "string",
              description: "Phone number (optional)",
              example: "+1234567890",
            },
            firstName: {
              type: "string",
              example: "John",
            },
            lastName: {
              type: "string",
              example: "Doe",
            },
            role: {
              type: "string",
              enum: [
                "CUSTOMER",
                "ADMIN",
                "INVENTORY_STAFF",
                "CUSTOMER_SERVICE",
                "ANALYST",
                "VENDOR",
              ],
              description:
                "User role (defaults to CUSTOMER if not provided, backend only)",
              example: "CUSTOMER",
            },
          },
        },
        response: {
          201: {
            description: "User registered successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  accessToken: {
                    type: "string",
                    description: "JWT access token",
                  },
                  refreshToken: {
                    type: "string",
                    description: "JWT refresh token",
                  },
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      email: { type: "string", format: "email" },
                      role: { type: "string", example: "CUSTOMER" },
                      isGuest: { type: "boolean" },
                      emailVerified: { type: "boolean" },
                      phoneVerified: { type: "boolean" },
                      status: { type: "string", example: "active" },
                    },
                  },
                  expiresIn: { type: "number", example: 900 },
                  tokenType: { type: "string", example: "Bearer" },
                  message: {
                    type: "string",
                    example: "Registration successful",
                  },
                  verificationToken: {
                    type: "string",
                    description: "Email verification token (dev only)",
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request - validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Validation failed" },
              errors: {
                type: "array",
                items: { type: "string" },
                example: [
                  "email is required",
                  "password must be at least 8 characters",
                ],
              },
              code: { type: "string", example: "VALIDATION_ERROR" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["success", "error", "code"],
          },
        },
      },
    },
    authController.register.bind(authController),
  );

  fastify.post(
    "/auth/login",
    {
      config: {
        rateLimit: {
          max: 20, // 20 attempts
          timeWindow: "15 minutes", // per 15 minutes
        },
      },
      schema: {
        description: "Authenticate user with email and password",
        tags: ["Authentication"],
        summary: "User Login",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
            rememberMe: { type: "boolean" },
          },
        },
      },
    },
    authController.login.bind(authController),
  );

  fastify.post(
    "/auth/logout",
    {
      preHandler: optionalAuth,
      schema: {
        description: "Logout user and invalidate token",
        tags: ["Authentication"],
        summary: "Logout",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Logout successful",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Logged out successfully",
                  },
                  action: { type: "string", example: "logout_complete" },
                },
              },
            },
          },
        },
      },
    },
    authController.logout.bind(authController),
  );

  fastify.post(
    "/auth/refresh-token",
    {
      schema: {
        description: "Refresh access token using refresh token",
        tags: ["Authentication"],
        summary: "Refresh Token",
        body: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: {
              type: "string",
              description: "Valid refresh token",
            },
          },
        },
      },
    },
    authController.refreshToken.bind(authController),
  );

  // 2FA Routes
  fastify.get(
    "/auth/2fa/generate",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Generate 2FA secret and QR code",
        tags: ["Authentication", "2FA"],
        summary: "Generate 2FA Secret",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "2FA secret generated",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  secret: { type: "string" },
                  otpauthUrl: { type: "string" },
                  qrCode: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    authController.generateTwoFactorSecret.bind(authController) as any,
  );

  fastify.post(
    "/auth/2fa/enable",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Enable 2FA with verification code",
        tags: ["Authentication", "2FA"],
        summary: "Enable 2FA",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["token", "secret"],
          properties: {
            token: {
              type: "string",
              description: "Verification code",
              example: "123456",
            },
            secret: {
              type: "string",
              description: "Secret from generate step",
            },
          },
        },
        response: {
          200: {
            description: "2FA enabled successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  backupCodes: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    authController.enableTwoFactor.bind(authController) as any,
  );

  fastify.post(
    "/auth/2fa/verify",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Verify 2FA code",
        tags: ["Authentication", "2FA"],
        summary: "Verify 2FA",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
              description: "Verification code",
              example: "123456",
            },
          },
        },
        response: {
          200: {
            description: "2FA verified",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "2FA code verified" },
            },
          },
        },
      },
    },
    authController.verifyTwoFactor.bind(authController) as any,
  );

  fastify.post(
    "/auth/login/2fa",
    {
      schema: {
        description: "Complete login with 2FA code",
        tags: ["Authentication", "2FA"],
        summary: "Login with 2FA",
        body: {
          type: "object",
          required: ["tempToken", "token"],
          properties: {
            tempToken: {
              type: "string",
              description: "Temporary token from login step 1",
            },
            token: {
              type: "string",
              description: "Verification code",
              example: "123456",
            },
          },
        },
        response: {
          // Same as login response
          200: {
            description: "Login successful",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string" },
                  refreshToken: { type: "string" },
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      email: { type: "string" },
                      role: { type: "string" },
                      status: { type: "string" },
                    },
                  },
                  expiresIn: { type: "number" },
                  tokenType: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    authController.loginWith2fa.bind(authController) as any,
  );

  fastify.post(
    "/auth/2fa/disable",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Disable 2FA",
        tags: ["Authentication", "2FA"],
        summary: "Disable 2FA",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["password"],
          properties: {
            password: { type: "string" },
          },
        },
        response: {
          200: {
            description: "2FA disabled",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "2FA disabled successfully" },
            },
          },
        },
      },
    },
    authController.disableTwoFactor.bind(authController) as any,
  );

  fastify.post(
    "/auth/forgot-password",
    {
      config: {
        rateLimit: {
          max: 3, // 3 attempts
          timeWindow: "1 hour", // per hour
        },
      },
      schema: {
        description: "Initiate password reset process",
        tags: ["Authentication"],
        summary: "Forgot Password",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
            },
          },
        },
      },
    },
    authController.forgotPassword.bind(authController),
  );

  fastify.post(
    "/auth/reset-password",
    {
      schema: {
        description: "Reset password using reset token",
        tags: ["Authentication"],
        summary: "Reset Password",
        body: {
          type: "object",
          required: ["token", "newPassword", "confirmPassword"],
          properties: {
            token: {
              type: "string",
              description: "Password reset token from email",
            },
            newPassword: {
              type: "string",
              minLength: 8,
              description: "New password (min 8 characters)",
            },
            confirmPassword: {
              type: "string",
              minLength: 8,
              description: "Confirm new password",
            },
          },
        },
      },
    },
    authController.resetPassword.bind(authController),
  );

  fastify.post(
    "/auth/verify-email",
    {
      schema: {
        description: "Verify user email address using verification token",
        tags: ["Authentication"],
        summary: "Verify Email",
        body: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
              description: "Email verification token from email",
            },
          },
        },
      },
    },
    authController.verifyEmail.bind(authController),
  );

  fastify.post(
    "/auth/resend-verification",
    {
      schema: {
        description: "Resend email verification link",
        tags: ["Authentication"],
        summary: "Resend Verification Email",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User's email address",
            },
          },
        },
      },
    },
    authController.resendVerification.bind(authController),
  );

  fastify.post(
    "/auth/change-password",
    {
      preHandler: authenticateUser,
      schema: {
        tags: ["Authentication"],
        summary: "Change Password",
        description: "Change current user's password",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["currentPassword", "newPassword", "confirmPassword"],
          properties: {
            currentPassword: { type: "string" },
            newPassword: { type: "string", minLength: 8 },
            confirmPassword: { type: "string", minLength: 8 },
          },
        },
        response: {
          200: {
            description: "Password changed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Password changed successfully",
              },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
              errors: { type: "array", items: { type: "string" } },
            },
          },
          401: {
            description: "Unauthorized",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Invalid access token" },
            },
          },
        },
      },
    },
    authController.changePassword.bind(authController) as any,
  );

  fastify.post(
    "/auth/change-email",
    {
      preHandler: authenticateUser,
      schema: {
        tags: ["Authentication"],
        summary: "Change Email",
        description: "Change current user's email address",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["newEmail", "password"],
          properties: {
            newEmail: {
              type: "string",
              format: "email",
              description: "New email address",
            },
            password: {
              type: "string",
              description: "Current password for verification",
            },
          },
        },
        response: {
          200: {
            description: "Email changed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example:
                  "Email changed successfully. Please verify your new email address.",
              },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
              errors: { type: "array", items: { type: "string" } },
            },
          },
          401: {
            description: "Unauthorized",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Invalid access token" },
            },
          },
        },
      },
    },
    authController.changeEmail.bind(authController) as any,
  );

  fastify.post(
    "/auth/delete-account",
    {
      preHandler: authenticateUser,
      schema: {
        tags: ["Authentication"],
        summary: "Delete Account",
        description: "Permanently delete the current user's account",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["password"],
          properties: {
            password: {
              type: "string",
              description: "Current password for verification",
            },
          },
        },
        response: {
          200: {
            description: "Account deleted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Account has been deleted successfully.",
              },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
          401: {
            description: "Unauthorized",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Invalid access token" },
            },
          },
        },
      },
    },
    authController.deleteAccount.bind(authController) as any,
  );

  // User Routes (Protected)
  fastify.get(
    "/users/me",
    {
      schema: {
        description: "Get current authenticated user information",
        tags: ["Users"],
        summary: "Get Current User",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Current user information",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string", nullable: true },
                  firstName: {
                    type: "string",
                    nullable: true,
                    description: "From user's default or first address",
                  },
                  lastName: {
                    type: "string",
                    nullable: true,
                    description: "From user's default or first address",
                  },
                  role: {
                    type: "string",
                    enum: ["GUEST", "CUSTOMER", "STAFF", "VENDOR", "ADMIN"],
                  },
                  status: {
                    type: "string",
                    enum: ["active", "inactive", "blocked"],
                  },
                  emailVerified: { type: "boolean" },
                  phoneVerified: { type: "boolean" },
                  isGuest: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
                required: [
                  "userId",
                  "email",
                  "role",
                  "status",
                  "emailVerified",
                  "phoneVerified",
                  "isGuest",
                ],
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Authentication required" },
              code: { type: "string", example: "AUTHENTICATION_ERROR" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["success", "error", "code"],
          },
        },
      },
      preHandler: authenticateUser,
    },
    usersController.getCurrentUser.bind(usersController),
  );

  fastify.get(
    "/admin/users",
    {
      schema: {
        description: "List all users with filters and pagination (Admin only)",
        tags: ["Users"],
        summary: "List Users (Admin)",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            search: {
              type: "string",
              description: "Search by email or phone",
              example: "john@example.com",
            },
            role: {
              type: "string",
              enum: [
                "GUEST",
                "CUSTOMER",
                "ADMIN",
                "INVENTORY_STAFF",
                "CUSTOMER_SERVICE",
                "ANALYST",
                "VENDOR",
              ],
              description: "Filter by user role",
            },
            status: {
              type: "string",
              enum: ["active", "inactive", "blocked"],
              description: "Filter by user status",
            },
            emailVerified: {
              type: "string",
              enum: ["true", "false"],
              description: "Filter by email verification status",
            },
            page: {
              type: "integer",
              minimum: 1,
              default: 1,
              description: "Page number",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
              description: "Items per page",
            },
            sortBy: {
              type: "string",
              enum: ["createdAt", "email"],
              default: "createdAt",
              description: "Sort by field",
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
              description: "Sort order",
            },
          },
        },
        response: {
          200: {
            description: "Users list with pagination",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  users: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        userId: { type: "string", format: "uuid" },
                        email: { type: "string", format: "email" },
                        phone: { type: "string", nullable: true },
                        role: { type: "string" },
                        status: { type: "string" },
                        emailVerified: { type: "boolean" },
                        phoneVerified: { type: "boolean" },
                        isGuest: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                    },
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      total: { type: "integer" },
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      totalPages: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request - validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
              errors: { type: "array", items: { type: "string" } },
            },
          },
          401: {
            description: "Unauthorized - admin access required",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Admin access required" },
            },
          },
        },
      },
      preHandler: authenticateAdmin as any,
    },
    usersController.listUsers.bind(usersController),
  );

  fastify.get(
    "/users/:userId",
    {
      schema: {
        description: "Get user details by ID (Admin/Staff/Self)",
        tags: ["Users"],
        summary: "Get User Details",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "User details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string", nullable: true },
                  firstName: { type: "string", nullable: true },
                  lastName: { type: "string", nullable: true },
                  role: { type: "string" },
                  status: { type: "string" },
                  emailVerified: { type: "boolean" },
                  phoneVerified: { type: "boolean" },
                  isGuest: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            description: "User not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
        },
      },
      // Detailed permission check is inside service/handler if needed,
      // but standard rule: Admin/Staff can view anyone, User can view self.
      // For now, let's allow authenticated users and assume controller handles ownership logic if necessary.
      // But creating a 'getUser' usually implies admin/owner access.
      preHandler: authenticateUser,
    },
    usersController.getUser.bind(usersController) as any,
  );

  fastify.patch(
    "/users/:userId/status",
    {
      schema: {
        description: "Update user status (Admin only)",
        tags: ["Users"],
        summary: "Update User Status",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["active", "inactive", "blocked"],
              description: "New status",
            },
            notes: {
              type: "string",
              description: "Reason for status change",
            },
          },
        },
        response: {
          200: {
            description: "Status updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  status: { type: "string" },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin as any,
    },
    usersController.updateStatus.bind(usersController) as any,
  );

  fastify.patch(
    "/users/:userId/role",
    {
      schema: {
        description: "Update user role (Admin only)",
        tags: ["Users"],
        summary: "Update User Role",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["role"],
          properties: {
            role: {
              type: "string",
              enum: [
                "GUEST",
                "CUSTOMER",
                "ADMIN",
                "INVENTORY_STAFF",
                "CUSTOMER_SERVICE",
                "ANALYST",
                "VENDOR",
              ],
              description: "New user role",
            },
            reason: {
              type: "string",
              description: "Reason for role change",
            },
          },
        },
        response: {
          200: {
            description: "Role updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  role: { type: "string" },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin as any,
    },
    usersController.updateRole.bind(usersController) as any,
  );

  fastify.patch(
    "/users/:userId/email-verification",
    {
      schema: {
        description: "Toggle user email verification status",
        tags: ["User Management"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["isVerified"],
          properties: {
            isVerified: {
              type: "boolean",
              description: "New email verification status",
            },
            reason: {
              type: "string",
              description: "Reason for change",
            },
          },
        },
        response: {
          200: {
            description: "Email verification status updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  isVerified: { type: "boolean" },
                },
              },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin as any,
    },
    usersController.toggleEmailVerification.bind(usersController) as any,
  );

  fastify.delete(
    "/users/:userId",
    {
      schema: {
        description: "Delete user (Admin only)",
        tags: ["Users"],
        summary: "Delete User",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "User deleted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "User deleted successfully" },
            },
          },
          400: {
            description: "Bad request",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string" },
            },
          },
        },
      },
      preHandler: authenticateAdmin as any,
    },
    usersController.deleteUser.bind(usersController) as any,
  );

  // Profile Routes (Protected)
  fastify.get(
    "/profile/me",
    {
      schema: {
        description: "Get current authenticated user's profile information",
        tags: ["Profiles"],
        summary: "Get Current User Profile",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Current user profile information",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  defaultAddressId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                  },
                  defaultPaymentMethodId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                  },
                  preferences: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  locale: { type: "string", nullable: true, example: "en-US" },
                  currency: { type: "string", nullable: true, example: "USD" },
                  stylePreferences: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  preferredSizes: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
                required: ["userId"],
              },
            },
          },
          401: {
            description: "Unauthorized - authentication required",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Authentication required" },
              code: { type: "string", example: "AUTHENTICATION_ERROR" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["success", "error", "code"],
          },
        },
      },
      preHandler: authenticateUser,
    },
    profileController.getCurrentUserProfile.bind(profileController),
  );

  fastify.put(
    "/profile/me",
    {
      schema: {
        description: "Update current authenticated user's profile information",
        tags: ["Profiles"],
        summary: "Update Current User Profile",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            defaultAddressId: {
              type: "string",
              format: "uuid",
              description: "Default address ID for the user",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            defaultPaymentMethodId: {
              type: "string",
              format: "uuid",
              description: "Default payment method ID for the user",
              example: "550e8400-e29b-41d4-a716-446655440001",
            },
            preferences: {
              type: "object",
              description: "User preferences object",
              example: { notifications: true, marketing: false },
            },
            locale: {
              type: "string",
              description: "User's preferred locale",
              example: "en-US",
            },
            currency: {
              type: "string",
              description: "User's preferred currency",
              example: "USD",
            },
            stylePreferences: {
              type: "object",
              description: "User's style preferences",
              example: { theme: "dark", layout: "compact" },
            },
            preferredSizes: {
              type: "object",
              description: "User's preferred sizes for different categories",
              example: { clothing: "M", shoes: "9" },
            },
            firstName: {
              type: "string",
              description: "User's first name",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User's last name",
              example: "Doe",
            },
            phone: {
              type: "string",
              description: "User's phone number",
              example: "+1234567890",
            },
            title: {
              type: "string",
              description: "User's title (Mr./Mrs./Ms./Dr.)",
              example: "Mr.",
            },
            dateOfBirth: {
              type: "string",
              format: "date",
              description: "User's date of birth (YYYY-MM-DD)",
              example: "1990-01-15",
            },
            residentOf: {
              type: "string",
              description: "User's country of residence",
              example: "United States",
            },
            nationality: {
              type: "string",
              description: "User's nationality/passport country",
              example: "United States",
            },
          },
        },
        response: {
          200: {
            description: "Profile updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  defaultAddressId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                  },
                  defaultPaymentMethodId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                  },
                  preferences: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  locale: { type: "string", nullable: true },
                  currency: { type: "string", nullable: true },
                  stylePreferences: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  preferredSizes: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  updatedAt: { type: "string", format: "date-time" },
                },
                required: ["userId", "updatedAt"],
              },
            },
          },
          400: {
            description: "Bad request - validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Validation failed" },
              errors: {
                type: "array",
                items: { type: "string" },
                example: ["defaultAddressId must be a valid UUID"],
              },
              code: { type: "string", example: "VALIDATION_ERROR" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["success", "error", "code"],
          },
          401: {
            description: "Unauthorized - authentication required",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Authentication required" },
              code: { type: "string", example: "AUTHENTICATION_ERROR" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["success", "error", "code"],
          },
        },
      },
      preHandler: authenticateUser,
    },
    profileController.updateCurrentUserProfile.bind(profileController) as any,
  );

  fastify.get(
    "/users/:userId/profile",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Get profile information for a specific user (Admin only)",
        tags: ["Profiles"],
        summary: "Get User Profile by ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the user",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
          },
          required: ["userId"],
        },
        response: {
          200: {
            description: "User profile information",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  defaultAddressId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                  },
                  defaultPaymentMethodId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                  },
                  preferences: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  locale: { type: "string", nullable: true },
                  currency: { type: "string", nullable: true },
                  stylePreferences: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  preferredSizes: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
                required: ["userId"],
              },
            },
          },
          404: {
            description: "User not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "User not found" },
              code: { type: "string", example: "USER_NOT_FOUND" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["success", "error", "code"],
          },
        },
      },
    },
    profileController.getProfile.bind(profileController) as any,
  );

  fastify.put(
    "/users/:userId/profile",
    {
      preHandler: authenticateAdmin,
      schema: {
        description:
          "Update profile information for a specific user (Admin only)",
        tags: ["Profiles"],
        summary: "Update User Profile by ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              format: "uuid",
              description: "Unique identifier for the user",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
          },
          required: ["userId"],
        },
        body: {
          type: "object",
          properties: {
            defaultAddressId: {
              type: "string",
              format: "uuid",
              description: "Default address ID for the user",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            defaultPaymentMethodId: {
              type: "string",
              format: "uuid",
              description: "Default payment method ID for the user",
              example: "550e8400-e29b-41d4-a716-446655440001",
            },
            preferences: {
              type: "object",
              description: "User preferences object",
              example: { notifications: true, marketing: false },
            },
            locale: {
              type: "string",
              description: "User's preferred locale",
              example: "en-US",
            },
            currency: {
              type: "string",
              description: "User's preferred currency",
              example: "USD",
            },
            stylePreferences: {
              type: "object",
              description: "User's style preferences",
              example: { theme: "dark", layout: "compact" },
            },
            preferredSizes: {
              type: "object",
              description: "User's preferred sizes for different categories",
              example: { clothing: "M", shoes: "9" },
            },
            firstName: {
              type: "string",
              description: "User's first name",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User's last name",
              example: "Doe",
            },
            phone: {
              type: "string",
              description: "User's phone number",
              example: "+1234567890",
            },
            title: {
              type: "string",
              description: "User's title (Mr./Mrs./Ms./Dr.)",
              example: "Mr.",
            },
            dateOfBirth: {
              type: "string",
              format: "date",
              description: "User's date of birth (YYYY-MM-DD)",
              example: "1990-01-15",
            },
            residentOf: {
              type: "string",
              description: "User's country of residence",
              example: "United States",
            },
            nationality: {
              type: "string",
              description: "User's nationality/passport country",
              example: "United States",
            },
          },
        },
        response: {
          200: {
            description: "Profile updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  defaultAddressId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                  },
                  defaultPaymentMethodId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                  },
                  preferences: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  locale: { type: "string", nullable: true },
                  currency: { type: "string", nullable: true },
                  stylePreferences: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  preferredSizes: {
                    type: "object",
                    nullable: true,
                    additionalProperties: true,
                  },
                  updatedAt: { type: "string", format: "date-time" },
                },
                required: ["userId", "updatedAt"],
              },
            },
          },
          400: {
            description: "Bad request - validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Validation failed" },
              errors: {
                type: "array",
                items: { type: "string" },
                example: ["defaultAddressId must be a valid UUID"],
              },
              code: { type: "string", example: "VALIDATION_ERROR" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["success", "error", "code"],
          },
          404: {
            description: "User not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "User not found" },
              code: { type: "string", example: "USER_NOT_FOUND" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["success", "error", "code"],
          },
        },
      },
    },
    profileController.updateProfile.bind(profileController) as any,
  );

  // Address Routes (Protected)
  fastify.get(
    "/addresses/me",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get user addresses with optional filtering",
        tags: ["Addresses"],
        summary: "List My Addresses",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["billing", "shipping"] },
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            sortBy: {
              type: "string",
              enum: ["createdAt", "updatedAt"],
              default: "createdAt",
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
          },
        },
        response: {
          200: {
            description: "List of user addresses",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    addressId: { type: "string", format: "uuid" },
                    userId: { type: "string", format: "uuid" },
                    type: { type: "string", enum: ["billing", "shipping"] },
                    isDefault: { type: "boolean" },
                    firstName: { type: "string", nullable: true },
                    lastName: { type: "string", nullable: true },
                    company: { type: "string", nullable: true },
                    addressLine1: { type: "string" },
                    addressLine2: { type: "string", nullable: true },
                    city: { type: "string" },
                    state: { type: "string", nullable: true },
                    postalCode: { type: "string", nullable: true },
                    country: { type: "string" },
                    phone: { type: "string", nullable: true },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                  required: [
                    "addressId",
                    "userId",
                    "type",
                    "isDefault",
                    "addressLine1",
                    "city",
                    "country",
                  ],
                },
              },
              meta: {
                type: "object",
                properties: {
                  total: { type: "integer" },
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  totalPages: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
    addressesController.getCurrentUserAddresses.bind(
      addressesController,
    ) as any,
  );

  fastify.post(
    "/addresses/me",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Add a new address for the authenticated user",
        tags: ["Addresses"],
        summary: "Add My Address",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["type", "addressLine1", "city", "country"],
          properties: {
            type: {
              type: "string",
              enum: ["billing", "shipping"],
              description: "Address type",
            },
            isDefault: {
              type: "boolean",
              description: "Set as default address",
              default: false,
            },
            firstName: { type: "string", description: "First name" },
            lastName: { type: "string", description: "Last name" },
            company: { type: "string", description: "Company name" },
            addressLine1: {
              type: "string",
              description: "Primary address line",
            },
            addressLine2: {
              type: "string",
              description: "Secondary address line",
            },
            city: { type: "string", description: "City" },
            state: { type: "string", description: "State/Province" },
            postalCode: { type: "string", description: "Postal/ZIP code" },
            country: { type: "string", description: "Country" },
            phone: { type: "string", description: "Phone number" },
          },
        },
        response: {
          201: {
            description: "Address created successfully",
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  addressId: { type: "string", format: "uuid" },
                  userId: { type: "string", format: "uuid" },
                  action: { type: "string", enum: ["created"] },
                  message: { type: "string" },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
              errors: { type: "array", items: { type: "string" } },
            },
          },
          401: {
            description: "Authentication required",
            type: "object",
            properties: {
              success: { type: "boolean" },
              error: { type: "string" },
            },
          },
        },
      },
    },
    addressesController.addCurrentUserAddress.bind(addressesController) as any,
  );

  fastify.get(
    "/users/:userId/addresses",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Get addresses for a specific user (Admin only)",
        tags: ["Addresses"],
        summary: "List User Addresses",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
          required: ["userId"],
        },
        querystring: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["billing", "shipping"] },
          },
        },
      },
    },
    addressesController.listAddresses.bind(addressesController) as any,
  );

  fastify.post(
    "/users/:userId/addresses",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Add new address for a specific user (Admin only)",
        tags: ["Addresses"],
        summary: "Add User Address (Admin)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
          required: ["userId"],
        },
        body: {
          type: "object",
          required: ["type", "addressLine1", "city", "country"],
          properties: {
            type: { type: "string", enum: ["billing", "shipping"] },
            isDefault: { type: "boolean" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            company: { type: "string" },
            addressLine1: { type: "string" },
            addressLine2: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            postalCode: { type: "string" },
            country: { type: "string" },
            phone: { type: "string" },
          },
        },
      },
    },
    addressesController.addAddress.bind(addressesController) as any,
  );

  // Update and Delete Address Routes (Protected)
  fastify.put(
    "/addresses/me/:addressId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update current user's address",
        tags: ["Addresses"],
        summary: "Update My Address",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            addressId: { type: "string", format: "uuid" },
          },
          required: ["addressId"],
        },
        body: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["billing", "shipping"] },
            isDefault: { type: "boolean" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            company: { type: "string" },
            addressLine1: { type: "string" },
            addressLine2: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            postalCode: { type: "string" },
            country: { type: "string" },
            phone: { type: "string" },
          },
        },
      },
    },
    addressesController.updateCurrentUserAddress.bind(
      addressesController,
    ) as any,
  );

  fastify.delete(
    "/addresses/me/:addressId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Delete current user's address",
        tags: ["Addresses"],
        summary: "Delete My Address",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            addressId: { type: "string", format: "uuid" },
          },
          required: ["addressId"],
        },
      },
    },
    addressesController.deleteCurrentUserAddress.bind(
      addressesController,
    ) as any,
  );

  fastify.put(
    "/users/:userId/addresses/:addressId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Update user's address (Admin)",
        tags: ["Addresses"],
        summary: "Update User Address (Admin)",
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
            addressId: { type: "string", format: "uuid" },
          },
          required: ["userId", "addressId"],
        },
        body: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["billing", "shipping"] },
            isDefault: { type: "boolean" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            company: { type: "string" },
            addressLine1: { type: "string" },
            addressLine2: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            postalCode: { type: "string" },
            country: { type: "string" },
            phone: { type: "string" },
          },
        },
      },
    },
    addressesController.updateAddress.bind(addressesController) as any,
  );

  fastify.delete(
    "/users/:userId/addresses/:addressId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete user's address (Admin)",
        tags: ["Addresses"],
        summary: "Delete User Address (Admin)",
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
            addressId: { type: "string", format: "uuid" },
          },
          required: ["userId", "addressId"],
        },
      },
    },
    addressesController.deleteAddress.bind(addressesController) as any,
  );

  // Payment Methods Routes (Protected)
  fastify.get(
    "/payment-methods/me",
    {
      schema: {
        description: "Get current user's payment methods",
        tags: ["Payment Methods"],
        summary: "List My Payment Methods",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of user payment methods",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  userId: { type: "string", format: "uuid" },
                  paymentMethods: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        paymentMethodId: { type: "string", format: "uuid" },
                        type: {
                          type: "string",
                          enum: ["card", "wallet", "bank", "cod", "gift_card"],
                        },
                        brand: { type: "string", nullable: true },
                        last4: { type: "string", nullable: true },
                        expMonth: { type: "number", nullable: true },
                        expYear: { type: "number", nullable: true },
                        billingAddressId: {
                          type: "string",
                          format: "uuid",
                          nullable: true,
                        },
                        providerRef: { type: "string", nullable: true },
                        isDefault: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                      },
                      required: ["paymentMethodId", "type", "isDefault"],
                    },
                  },
                  totalCount: { type: "number" },
                },
                required: ["userId", "paymentMethods", "totalCount"],
              },
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
        },
      },
      preHandler: authenticateUser,
    },
    paymentMethodsController.getCurrentUserPaymentMethods.bind(
      paymentMethodsController,
    ),
  );

  fastify.post(
    "/payment-methods/me",
    {
      schema: {
        description: "Add a new payment method for the current user",
        tags: ["Payment Methods"],
        summary: "Add Payment Method",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["type"],
          properties: {
            type: {
              type: "string",
              enum: ["card", "wallet", "bank", "cod", "gift_card"],
              description: "Type of payment method",
              example: "card",
            },
            brand: {
              type: "string",
              description: "Card brand (e.g., Visa, Mastercard)",
              example: "Visa",
            },
            last4: {
              type: "string",
              pattern: "^[0-9]{4}$",
              description: "Last 4 digits of card number",
              example: "1234",
            },
            expMonth: {
              type: "number",
              minimum: 1,
              maximum: 12,
              description: "Expiration month",
              example: 12,
            },
            expYear: {
              type: "number",
              minimum: 2024,
              description: "Expiration year",
              example: 2027,
            },
            billingAddressId: {
              type: "string",
              format: "uuid",
              description: "ID of billing address",
              example: "550e8400-e29b-41d4-a716-446655440000",
            },
            providerRef: {
              type: "string",
              description: "Payment provider reference",
              example: "pm_1234567890",
            },
            isDefault: {
              type: "boolean",
              description: "Set as default payment method",
              example: false,
            },
          },
        },
        response: {
          201: {
            description: "Payment method added successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  paymentMethodId: { type: "string", format: "uuid" },
                  type: { type: "string" },
                  brand: { type: "string", nullable: true },
                  last4: { type: "string", nullable: true },
                  isDefault: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          400: {
            description: "Bad request - validation error",
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
        },
      },
      preHandler: authenticateUser,
    },
    paymentMethodsController.addCurrentUserPaymentMethod.bind(
      paymentMethodsController,
    ) as any,
  );

  fastify.put(
    "/payment-methods/me/:paymentMethodId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update current user's payment method",
        tags: ["Payment Methods"],
        summary: "Update My Payment Method",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            paymentMethodId: { type: "string", format: "uuid" },
          },
          required: ["paymentMethodId"],
        },
        body: {
          type: "object",
          properties: {
            billingAddressId: { type: "string", format: "uuid" },
            isDefault: { type: "boolean" },
          },
        },
      },
    },
    paymentMethodsController.updateCurrentUserPaymentMethod.bind(
      paymentMethodsController,
    ) as any,
  );

  fastify.delete(
    "/payment-methods/me/:paymentMethodId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Delete current user's payment method",
        tags: ["Payment Methods"],
        summary: "Delete My Payment Method",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            paymentMethodId: { type: "string", format: "uuid" },
          },
          required: ["paymentMethodId"],
        },
      },
    },
    paymentMethodsController.deleteCurrentUserPaymentMethod.bind(
      paymentMethodsController,
    ) as any,
  );

  fastify.get(
    "/users/:userId/payment-methods",
    {
      preHandler: authenticateAdmin, // Explicitly require Admin
      schema: {
        description: "Get payment methods for a specific user (Admin)",
        tags: ["Payment Methods"],
        summary: "List User Payment Methods (Admin)",
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
          required: ["userId"],
        },
      },
    },
    paymentMethodsController.listPaymentMethods.bind(
      paymentMethodsController,
    ) as any,
  );

  fastify.post(
    "/users/:userId/payment-methods",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Add payment method for a specific user (Admin)",
        tags: ["Payment Methods"],
        summary: "Add User Payment Method (Admin)",
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
          required: ["userId"],
        },
        body: {
          type: "object",
          required: ["type"],
          properties: {
            type: {
              type: "string",
              enum: ["card", "wallet", "bank", "cod", "gift_card"],
            },
            brand: { type: "string" },
            last4: { type: "string", pattern: "^[0-9]{4}$" },
            expMonth: { type: "number", minimum: 1, maximum: 12 },
            expYear: { type: "number", minimum: 2024 },
            billingAddressId: { type: "string", format: "uuid" },
            providerRef: { type: "string" },
            isDefault: { type: "boolean" },
          },
        },
      },
    },
    paymentMethodsController.addPaymentMethod.bind(
      paymentMethodsController,
    ) as any,
  );

  fastify.put(
    "/users/:userId/payment-methods/:paymentMethodId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Update user's payment method (Admin)",
        tags: ["Payment Methods"],
        summary: "Update User Payment Method (Admin)",
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
            paymentMethodId: { type: "string", format: "uuid" },
          },
          required: ["userId", "paymentMethodId"],
        },
        body: {
          type: "object",
          properties: {
            billingAddressId: { type: "string", format: "uuid" },
            isDefault: { type: "boolean" },
          },
        },
      },
    },
    paymentMethodsController.updatePaymentMethod.bind(
      paymentMethodsController,
    ) as any,
  );

  fastify.delete(
    "/users/:userId/payment-methods/:paymentMethodId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete user's payment method (Admin)",
        tags: ["Payment Methods"],
        summary: "Delete User Payment Method (Admin)",
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
            paymentMethodId: { type: "string", format: "uuid" },
          },
          required: ["userId", "paymentMethodId"],
        },
      },
    },
    paymentMethodsController.deletePaymentMethod.bind(
      paymentMethodsController,
    ) as any,
  );

  // Social Login Routes
  fastify.post(
    "/auth/social/login",
    {
      schema: {
        description: "Authenticate user using social media provider",
        tags: ["Social Login"],
        summary: "Social Media Login",
        body: {
          type: "object",
          required: ["provider", "providerUserId", "accessToken"],
          properties: {
            provider: {
              type: "string",
              enum: ["google", "facebook", "apple", "twitter", "github"],
              description: "Social media provider",
              example: "google",
            },
            providerUserId: {
              type: "string",
              description: "User ID from the social provider",
              example: "1234567890",
            },
            accessToken: {
              type: "string",
              description: "Access token from the social provider",
              example: "ya29.a0AfH6SMC...",
            },
            email: {
              type: "string",
              format: "email",
              description: "User's email from social provider",
              example: "user@example.com",
            },
            firstName: {
              type: "string",
              description: "User's first name from social provider",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User's last name from social provider",
              example: "Doe",
            },
          },
        },
        response: {
          200: {
            description: "Social login successful",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  accessToken: { type: "string" },
                  refreshToken: { type: "string" },
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      email: { type: "string", format: "email" },
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      isGuest: { type: "boolean" },
                      emailVerified: { type: "boolean" },
                    },
                  },
                  expiresIn: { type: "number" },
                  tokenType: { type: "string", example: "Bearer" },
                },
              },
            },
          },
          400: {
            description: "Bad request - validation error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: {
                type: "string",
                example: "Invalid social provider data",
              },
            },
          },
          401: {
            description: "Unauthorized - invalid social token",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Invalid access token" },
            },
          },
        },
      },
    },
    socialLoginController.socialLogin.bind(socialLoginController),
  );

  fastify.get(
    "/auth/social/:provider",
    {
      schema: {
        description: "Initiate OAuth flow for social login",
        tags: ["Social Login"],
        summary: "Initiate OAuth Flow",
        params: {
          type: "object",
          properties: {
            provider: {
              type: "string",
              enum: ["google", "facebook", "apple", "twitter", "github"],
              description: "Social media provider for OAuth",
              example: "google",
            },
          },
          required: ["provider"],
        },
        querystring: {
          type: "object",
          properties: {
            redirectUrl: {
              type: "string",
              description: "URL to redirect after successful authentication",
              example: "https://myapp.com/dashboard",
            },
          },
        },
        response: {
          302: {
            description: "Redirect to OAuth provider authorization URL",
          },
          400: {
            description: "Invalid provider or parameters",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Invalid OAuth provider" },
            },
          },
        },
      },
    },
    socialLoginController.initiateOAuthFlow.bind(socialLoginController),
  );

  fastify.get(
    "/auth/social/:provider/callback",
    {
      schema: {
        description: "Handle OAuth callback from social provider",
        tags: ["Social Login"],
        summary: "OAuth Callback Handler",
        params: {
          type: "object",
          properties: {
            provider: {
              type: "string",
              enum: ["google", "facebook", "apple", "twitter", "github"],
              description: "Social media provider",
              example: "google",
            },
          },
          required: ["provider"],
        },
        querystring: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Authorization code from OAuth provider",
              example: "4/0AX4XfWjT...",
            },
            state: {
              type: "string",
              description: "State parameter for CSRF protection",
              example: "random_state_string",
            },
            error: {
              type: "string",
              description: "Error message if OAuth failed",
              example: "access_denied",
            },
          },
        },
        response: {
          302: {
            description: "Redirect to application with authentication result",
          },
          400: {
            description: "OAuth callback error",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "OAuth authorization failed" },
            },
          },
        },
      },
    },
    socialLoginController.handleOAuthCallback.bind(socialLoginController),
  );

  fastify.post(
    "/social-accounts/me/link",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Link social account to current user",
        tags: ["Social Login"],
        summary: "Link Social Account",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["provider", "providerUserId", "accessToken"],
          properties: {
            provider: {
              type: "string",
              enum: ["google", "facebook", "apple", "twitter", "github"],
            },
            providerUserId: { type: "string" },
            accessToken: { type: "string" },
          },
        },
      },
    },
    socialLoginController.linkSocialAccount.bind(socialLoginController) as any,
  );

  fastify.get(
    "/social-accounts/me",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get current user's linked social accounts",
        tags: ["Social Login"],
        summary: "List My Social Accounts",
        security: [{ bearerAuth: [] }],
      },
    },
    socialLoginController.getCurrentUserSocialAccounts.bind(
      socialLoginController,
    ),
  );

  fastify.delete(
    "/social-accounts/me/:socialId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Unlink social account from current user",
        tags: ["Social Login"],
        summary: "Unlink Social Account",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            socialId: { type: "string", format: "uuid" },
          },
          required: ["socialId"],
        },
      },
    },
    socialLoginController.unlinkSocialAccount.bind(
      socialLoginController,
    ) as any,
  );

  fastify.get(
    "/users/:userId/social-accounts",
    {
      schema: {
        description: "Get social accounts for a specific user (Admin only)",
        tags: ["Social Login"],
        summary: "List User Social Accounts (Admin)",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            userId: { type: "string", format: "uuid" },
          },
          required: ["userId"],
        },
      },
      preHandler: authenticateAdmin as any,
    },
    socialLoginController.getUserSocialAccounts.bind(socialLoginController),
  );

  // Development/Testing endpoint
  if (process.env.NODE_ENV !== "production") {
    fastify.post(
      "/auth/generate-test-verification-token",
      {
        schema: {
          description: "Generate test verification token (development only)",
          tags: ["Testing"],
          body: {
            type: "object",
            required: ["email", "userId"],
            properties: {
              email: { type: "string", format: "email" },
              userId: { type: "string", format: "uuid" },
            },
          },
        },
      },
      authController.generateTestVerificationToken.bind(authController),
    );
  }
}
