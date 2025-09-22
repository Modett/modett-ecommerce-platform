import fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

// Inline logger configuration
const loggerConfig = {
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
};

export async function createServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: loggerConfig,
    trustProxy: true,
    // ✅ FIXED: Add AJV configuration for schema validation
    ajv: {
      customOptions: {
        removeAdditional: "all",
        useDefaults: true,
        coerceTypes: "array",
        strict: false, // ✅ disables strict unknown keyword errors
        keywords: [],
      },
    },
  });

  // ✅ REGISTER CORE PLUGINS
  await server.register(import("@fastify/cors"), {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",") || ["https://modett.com"]
        : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  await server.register(import("@fastify/helmet"), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  });

  await server.register(import("@fastify/rate-limit"), {
    max: process.env.NODE_ENV === "production" ? 100 : 1000,
    timeWindow: "1 minute",
    skipOnError: true,
    addHeaders: {
      "x-ratelimit-limit": true,
      "x-ratelimit-remaining": true,
      "x-ratelimit-reset": true,
    },
  });

  // ✅ ENHANCED SWAGGER CONFIGURATION
  await server.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Modett E-commerce User Management API",
        description: `
🚀 **Professional E-commerce User Management System**

## Overview
Complete enterprise-grade user management API with authentication, profiles, addresses, and payment methods.

## Features
- 🔐 **JWT Authentication & Authorization**
- 👤 **Complete User Profile Management**
- 🏠 **Multi-Address Management (Billing/Shipping)**
- 💳 **Payment Method Management**
- 🔗 **Social Login Integration (OAuth 2.0)**
- 🛡️ **Enterprise Security Features**
- 📧 **Email/SMS Verification**
- 🌍 **International Support (Currency/Locale)**

## Authentication
Most endpoints require Bearer token authentication. Click **Authorize** below to set your JWT token.

## Rate Limiting
- **${process.env.NODE_ENV === "production" ? "100" : "1000"} requests per minute** per IP
- **5 login attempts per hour** per user

## Error Handling
All errors follow a consistent format with success flags, error messages, and error codes.
        `,
        version: "1.0.0",
        contact: {
          name: "Modett API Support",
          email: "api@modett.com",
          url: "https://modett.com/support",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
        termsOfService: "https://modett.com/terms",
      },
      servers: [
        {
          url:
            process.env.NODE_ENV === "production"
              ? "https://api.modett.com"
              : "http://localhost:3000",
          description:
            process.env.NODE_ENV === "production"
              ? "Production server"
              : "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: 'Enter your Bearer token (without "Bearer" prefix)',
          },
        },
        schemas: {
          // ✅ STANDARD RESPONSE SCHEMAS
          ErrorResponse: {
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: {
                type: "string",
                description: "Human-readable error message",
                example: "Validation failed",
              },
              errors: {
                type: "array",
                items: { type: "string" },
                description: "Array of specific validation errors",
                example: [
                  "email is required",
                  "password must be at least 8 characters",
                ],
              },
              code: {
                type: "string",
                description: "Error code for programmatic handling",
                example: "VALIDATION_ERROR",
              },
              timestamp: {
                type: "string",
                format: "date-time",
                description: "Error timestamp",
              },
            },
            required: ["success", "error", "code"],
          },
          SuccessResponse: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                description: "Success message",
                example: "Operation completed successfully",
              },
              data: {
                type: "object",
                description: "Response data object",
              },
              timestamp: {
                type: "string",
                format: "date-time",
                description: "Response timestamp",
              },
            },
            required: ["success"],
          },

          // ✅ USER SCHEMAS
          User: {
            type: "object",
            properties: {
              userId: {
                type: "string",
                format: "uuid",
                description: "Unique user identifier",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              email: {
                type: "string",
                format: "email",
                description: "User email address",
                example: "john.doe@example.com",
              },
              phone: {
                type: "string",
                description: "User phone number",
                nullable: true,
                example: "+1234567890",
              },
              firstName: {
                type: "string",
                description: "User first name",
                nullable: true,
                example: "John",
              },
              lastName: {
                type: "string",
                description: "User last name",
                nullable: true,
                example: "Doe",
              },
              status: {
                type: "string",
                enum: ["active", "inactive", "blocked"],
                description: "User account status",
                example: "active",
              },
              emailVerified: {
                type: "boolean",
                description: "Whether email is verified",
                example: true,
              },
              phoneVerified: {
                type: "boolean",
                description: "Whether phone is verified",
                example: false,
              },
              isGuest: {
                type: "boolean",
                description: "Whether user is a guest",
                example: false,
              },
              createdAt: {
                type: "string",
                format: "date-time",
                description: "Account creation timestamp",
              },
              updatedAt: {
                type: "string",
                format: "date-time",
                description: "Last update timestamp",
              },
            },
            required: [
              "userId",
              "email",
              "status",
              "emailVerified",
              "phoneVerified",
              "isGuest",
            ],
          },

          // ✅ USER PROFILE SCHEMA
          UserProfile: {
            type: "object",
            properties: {
              userId: { type: "string", format: "uuid" },
              defaultAddressId: {
                type: "string",
                format: "uuid",
                nullable: true,
                description: "Default address ID for the user",
              },
              defaultPaymentMethodId: {
                type: "string",
                format: "uuid",
                nullable: true,
                description: "Default payment method ID",
              },
              locale: {
                type: "string",
                description: "User locale preference",
                example: "en-US",
                nullable: true,
              },
              currency: {
                type: "string",
                description: "Preferred currency",
                example: "USD",
                nullable: true,
              },
              preferences: {
                type: "object",
                description: "User preferences as key-value pairs",
                example: {
                  newsletter: true,
                  notifications: false,
                  theme: "light",
                },
                additionalProperties: true,
              },
              stylePreferences: {
                type: "object",
                description: "Style and fashion preferences",
                example: {
                  favoriteColors: ["black", "white"],
                  preferredBrands: ["Nike", "Adidas"],
                },
                additionalProperties: true,
              },
              preferredSizes: {
                type: "object",
                description: "Preferred sizes for different categories",
                example: {
                  shirts: "M",
                  pants: "32/34",
                  shoes: "10",
                },
                additionalProperties: true,
              },
            },
            required: [
              "userId",
              "preferences",
              "stylePreferences",
              "preferredSizes",
            ],
          },

          // ✅ ADDRESS SCHEMA
          Address: {
            type: "object",
            properties: {
              addressId: { type: "string", format: "uuid" },
              userId: { type: "string", format: "uuid" },
              type: {
                type: "string",
                enum: ["billing", "shipping"],
                description: "Address type",
                example: "shipping",
              },
              isDefault: {
                type: "boolean",
                description: "Whether this is the default address",
                example: true,
              },
              firstName: {
                type: "string",
                nullable: true,
                example: "John",
              },
              lastName: {
                type: "string",
                nullable: true,
                example: "Doe",
              },
              company: {
                type: "string",
                nullable: true,
                example: "Acme Corp",
              },
              addressLine1: {
                type: "string",
                description: "Primary address line",
                example: "123 Main Street",
              },
              addressLine2: {
                type: "string",
                nullable: true,
                description: "Secondary address line",
                example: "Apt 4B",
              },
              city: {
                type: "string",
                description: "City name",
                example: "New York",
              },
              state: {
                type: "string",
                nullable: true,
                description: "State or province",
                example: "NY",
              },
              postalCode: {
                type: "string",
                nullable: true,
                description: "Postal or ZIP code",
                example: "10001",
              },
              country: {
                type: "string",
                description: "Country code (ISO 3166-1 alpha-2)",
                example: "US",
              },
              phone: {
                type: "string",
                nullable: true,
                description: "Contact phone number",
                example: "+1234567890",
              },
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

          // ✅ PAYMENT METHOD SCHEMA
          PaymentMethod: {
            type: "object",
            properties: {
              paymentMethodId: { type: "string", format: "uuid" },
              userId: { type: "string", format: "uuid" },
              type: {
                type: "string",
                enum: ["card", "wallet", "bank", "cod", "gift_card"],
                description: "Payment method type",
                example: "card",
              },
              brand: {
                type: "string",
                nullable: true,
                description: "Card brand (e.g., Visa, Mastercard)",
                example: "visa",
              },
              last4: {
                type: "string",
                nullable: true,
                description: "Last 4 digits of card number",
                pattern: "^[0-9]{4}$",
                example: "4242",
              },
              expMonth: {
                type: "number",
                nullable: true,
                minimum: 1,
                maximum: 12,
                description: "Card expiration month",
                example: 12,
              },
              expYear: {
                type: "number",
                nullable: true,
                minimum: 2024,
                description: "Card expiration year",
                example: 2025,
              },
              isDefault: {
                type: "boolean",
                description: "Whether this is the default payment method",
                example: true,
              },
              billingAddressId: {
                type: "string",
                format: "uuid",
                nullable: true,
                description: "Associated billing address ID",
              },
              providerRef: {
                type: "string",
                nullable: true,
                description: "Payment provider reference",
                example: "pm_1234567890",
              },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: ["paymentMethodId", "userId", "type", "isDefault"],
          },

          // ✅ SOCIAL ACCOUNT SCHEMA
          SocialAccount: {
            type: "object",
            properties: {
              socialId: { type: "string", format: "uuid" },
              userId: { type: "string", format: "uuid" },
              provider: {
                type: "string",
                enum: ["google", "facebook", "apple", "twitter", "github"],
                description: "Social login provider",
                example: "google",
              },
              providerUserId: {
                type: "string",
                description: "User ID from the social provider",
                example: "1234567890",
              },
              email: {
                type: "string",
                format: "email",
                nullable: true,
                description: "Email from social provider",
              },
              linkedAt: {
                type: "string",
                format: "date-time",
                description: "When the account was linked",
              },
            },
            required: [
              "socialId",
              "userId",
              "provider",
              "providerUserId",
              "linkedAt",
            ],
          },

          // ✅ AUTH TOKEN SCHEMA
          AuthTokens: {
            type: "object",
            properties: {
              accessToken: {
                type: "string",
                description: "JWT access token (expires in 15 minutes)",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
              refreshToken: {
                type: "string",
                description: "Refresh token (expires in 7 days)",
                example: "rt_1234567890abcdef...",
              },
              expiresIn: {
                type: "number",
                description: "Token expiry in seconds",
                example: 900,
              },
              tokenType: {
                type: "string",
                example: "Bearer",
                description: "Token type",
              },
            },
            required: ["accessToken", "refreshToken", "expiresIn", "tokenType"],
          },
        },
      },
      tags: [
        {
          name: "Authentication",
          description:
            "🔐 User authentication, registration, and security operations",
        },
        {
          name: "Users",
          description: "👤 User account information and management",
        },
        {
          name: "Profiles",
          description: "📋 User profile, preferences, and settings management",
        },
        {
          name: "Addresses",
          description: "🏠 User address management for billing and shipping",
        },
        {
          name: "Payment Methods",
          description: "💳 Payment method management and processing",
        },
        {
          name: "Social Login",
          description: "🔗 OAuth 2.0 integration and social authentication",
        },
        {
          name: "System",
          description:
            "⚙️ System health, monitoring, and information endpoints",
        },
      ],
    },
  });

  // ✅ CORRECTED SWAGGER UI CONFIGURATION
  await server.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      requestSnippets: {
        generators: {
          curl_bash: {
            title: "cURL (bash)",
            syntax: "bash",
          },
          curl_powershell: {
            title: "cURL (PowerShell)",
            syntax: "powershell",
          },
          curl_cmd: {
            title: "cURL (CMD)",
            syntax: "bash",
          },
        },
        defaultExpanded: true,
        languagesMask: ["curl_bash", "curl_powershell", "curl_cmd"],
      },
      persistAuthorization: true,
      layout: "BaseLayout",
      defaultModelRendering: "example",
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => swaggerObject,
    transformSpecificationClone: true,
  });

  // ✅ SYSTEM ENDPOINTS
  server.get(
    "/health",
    {
      schema: {
        description:
          "API health check endpoint for monitoring and load balancers",
        tags: ["System"],
        summary: "Health Check",
        response: {
          200: {
            description: "API is healthy and operational",
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["ok", "degraded", "down"],
                example: "ok",
              },
              timestamp: {
                type: "string",
                format: "date-time",
              },
              uptime: {
                type: "number",
                description: "Server uptime in seconds",
                example: 123.45,
              },
              version: {
                type: "string",
                example: "1.0.0",
              },
              environment: {
                type: "string",
                example: "development",
              },
            },
          },
        },
      },
    },
    async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
      };
    }
  );

  server.get(
    "/",
    {
      schema: {
        description: "API information and navigation endpoints",
        tags: ["System"],
        summary: "API Information",
        response: {
          200: {
            description: "API information and links",
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              version: { type: "string" },
              documentation: { type: "string" },
              health: { type: "string" },
              environment: { type: "string" },
              timestamp: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
    async (request) => {
      const protocol = request.headers["x-forwarded-proto"] || request.protocol;
      const host = request.headers["x-forwarded-host"] || request.headers.host;
      const baseUrl = `${protocol}://${host}`;

      return {
        name: "Modett E-commerce User Management API",
        description: "Professional Apparel E-commerce Platform API",
        version: process.env.npm_package_version || "1.0.0",
        documentation: `${baseUrl}/docs`,
        health: `${baseUrl}/health`,
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      };
    }
  );

  // ✅ PLACEHOLDER ROUTES (Remove when implementing actual routes)
  server.register(
    async function (fastify) {
      // Test endpoint to verify API is working
      fastify.get(
        "/test",
        {
          schema: {
            description: "Test endpoint to verify API functionality",
            tags: ["System"],
            summary: "API Test",
            response: {
              200: {
                description: "Test successful",
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "API is working perfectly!",
                  },
                  timestamp: { type: "string", format: "date-time" },
                  endpoints: {
                    type: "object",
                    properties: {
                      documentation: { type: "string" },
                      health: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        async (request) => {
          const protocol =
            request.headers["x-forwarded-proto"] || request.protocol;
          const host =
            request.headers["x-forwarded-host"] || request.headers.host;
          const baseUrl = `${protocol}://${host}`;

          return {
            success: true,
            message: "API is working perfectly!",
            timestamp: new Date().toISOString(),
            endpoints: {
              documentation: `${baseUrl}/docs`,
              health: `${baseUrl}/health`,
            },
          };
        }
      );
    },
    { prefix: "/api/v1" }
  );

  // ✅ COMPREHENSIVE ERROR HANDLER
  server.setErrorHandler(async (error, request, reply) => {
    server.log.error(
      {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        headers: request.headers,
      },
      "Request error"
    );

    const timestamp = new Date().toISOString();

    // Handle validation errors (from schema validation)
    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: "Request validation failed",
        errors: error.validation.map(
          (err: any) =>
            `${err.instancePath || err.dataPath || "field"} ${err.message}`
        ),
        code: "VALIDATION_ERROR",
        timestamp,
      });
    }

    // Handle authentication errors
    if (error.statusCode === 401) {
      return reply.status(401).send({
        success: false,
        error: "Authentication required",
        code: "AUTHENTICATION_ERROR",
        timestamp,
      });
    }

    // Handle authorization errors
    if (error.statusCode === 403) {
      return reply.status(403).send({
        success: false,
        error: "Access forbidden - insufficient permissions",
        code: "AUTHORIZATION_ERROR",
        timestamp,
      });
    }

    // Handle not found errors
    if (error.statusCode === 404) {
      return reply.status(404).send({
        success: false,
        error: "Resource not found",
        code: "NOT_FOUND_ERROR",
        timestamp,
      });
    }

    // Handle rate limiting
    if (error.statusCode === 429) {
      return reply.status(429).send({
        success: false,
        error: "Too many requests - please try again later",
        code: "RATE_LIMIT_ERROR",
        timestamp,
        retryAfter: reply.getHeader("retry-after"),
      });
    }

    // Handle payload too large
    if (error.statusCode === 413) {
      return reply.status(413).send({
        success: false,
        error: "Request payload too large",
        code: "PAYLOAD_TOO_LARGE",
        timestamp,
      });
    }

    // Generic error response
    const statusCode = error.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === "development";

    return reply.status(statusCode).send({
      success: false,
      error: isDevelopment ? error.message : "An unexpected error occurred",
      code: statusCode === 500 ? "INTERNAL_SERVER_ERROR" : "UNKNOWN_ERROR",
      timestamp,
      ...(isDevelopment && { stack: error.stack }),
    });
  });

  // ✅ CORRECTED GRACEFUL SHUTDOWN
  const gracefulShutdown = async (signal: string) => {
    server.log.info(`Received ${signal}, starting graceful shutdown...`);

    try {
      await server.close();
      server.log.info("Server closed successfully");
      process.exit(0);
    } catch (error) {
      server.log.error(error as Error, "Error during shutdown");
      process.exit(1);
    }
  };

  // ✅ FIXED: Proper async handling for process events
  process.on("SIGTERM", () => {
    gracefulShutdown("SIGTERM").catch((error) => {
      console.error("Error during graceful shutdown:", error);
      process.exit(1);
    });
  });

  process.on("SIGINT", () => {
    gracefulShutdown("SIGINT").catch((error) => {
      console.error("Error during graceful shutdown:", error);
      process.exit(1);
    });
  });

  // Register user management routes
  try {
    // ✅ Import route registration and services
    const { registerUserManagementRoutes } = await import(
      "../../../modules/user-management/infra/http/routes"
    );
    const { createServiceContainer } = await import("./container");

    // ✅ Initialize real services with database repositories
    const serviceContainer = createServiceContainer();

    // Extract services for route registration
    const services = {
      authService: serviceContainer.authService,
      userProfileService: serviceContainer.userProfileService,
      addressService: serviceContainer.addressService,
      paymentMethodService: serviceContainer.paymentMethodService,
    };

    server.log.info("✅ Real services initialized with database repositories");

    // Register routes with services
    await server.register(
      async function (fastify) {
        await registerUserManagementRoutes(fastify, services);
      },
      { prefix: "/api/v1" }
    );

    server.log.info("✅ User management routes registered successfully");
  } catch (error) {
    server.log.error(error as Error, "❌ Failed to register user routes:"); // ✅ FIXED: Add error parameter
    server.log.info("⚠️ Continuing with basic endpoints only");
  }

  return server; // ✅ This should be the last line
}
