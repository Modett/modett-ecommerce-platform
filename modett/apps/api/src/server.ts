import fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
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
    ajv: {
      customOptions: {
        removeAdditional: false,
        useDefaults: true,
        coerceTypes: "array",
        strict: false,
        keywords: [],
      },
    },
  });

  await server.register(import("@fastify/cors"), {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",") || ["https://modett.com"]
        : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Guest-Token",
    ],
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

  await server.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Modett E-commerce API",
        description:
          "Professional e-commerce platform API with user management, product catalog, and authentication services.",
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
              : "http://localhost:3001",
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
          // Standard response schemas
          ErrorResponse: {
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
          SuccessResponse: {
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Operation completed successfully",
              },
              data: { type: "object" },
              timestamp: { type: "string", format: "date-time" },
            },
            required: ["success"],
          },

          // User schemas
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

          // User profile schema
          UserProfile: {
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
              locale: { type: "string", example: "en-US", nullable: true },
              currency: { type: "string", example: "USD", nullable: true },
              preferences: { type: "object", additionalProperties: true },
              stylePreferences: { type: "object", additionalProperties: true },
              preferredSizes: { type: "object", additionalProperties: true },
            },
            required: [
              "userId",
              "preferences",
              "stylePreferences",
              "preferredSizes",
            ],
          },

          // Address schema
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
              state: { type: "string", nullable: true, example: "NY" },
              postalCode: { type: "string", nullable: true, example: "10001" },
              country: { type: "string", example: "US" },
              phone: { type: "string", nullable: true, example: "+1234567890" },
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

          // Payment method schema
          PaymentMethod: {
            type: "object",
            properties: {
              paymentMethodId: { type: "string", format: "uuid" },
              userId: { type: "string", format: "uuid" },
              type: {
                type: "string",
                enum: ["card", "wallet", "bank", "cod", "gift_card"],
                example: "card",
              },
              brand: { type: "string", nullable: true, example: "visa" },
              last4: {
                type: "string",
                nullable: true,
                pattern: "^[0-9]{4}$",
                example: "4242",
              },
              expMonth: {
                type: "number",
                nullable: true,
                minimum: 1,
                maximum: 12,
                example: 12,
              },
              expYear: {
                type: "number",
                nullable: true,
                minimum: 2024,
                example: 2025,
              },
              isDefault: { type: "boolean", example: true },
              billingAddressId: {
                type: "string",
                format: "uuid",
                nullable: true,
              },
              providerRef: {
                type: "string",
                nullable: true,
                example: "pm_1234567890",
              },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: ["paymentMethodId", "userId", "type", "isDefault"],
          },

          // Social account schema
          SocialAccount: {
            type: "object",
            properties: {
              socialId: { type: "string", format: "uuid" },
              userId: { type: "string", format: "uuid" },
              provider: {
                type: "string",
                enum: ["google", "facebook", "apple", "twitter", "github"],
                example: "google",
              },
              providerUserId: { type: "string", example: "1234567890" },
              email: { type: "string", format: "email", nullable: true },
              linkedAt: { type: "string", format: "date-time" },
            },
            required: [
              "socialId",
              "userId",
              "provider",
              "providerUserId",
              "linkedAt",
            ],
          },

          // Auth token schema
          AuthTokens: {
            type: "object",
            properties: {
              accessToken: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
              refreshToken: {
                type: "string",
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
            "User authentication, registration, and security operations",
        },
        {
          name: "Users",
          description: "User account information and management",
        },
        {
          name: "Profiles",
          description: "User profile, preferences, and settings management",
        },
        {
          name: "Addresses",
          description: "User address management for billing and shipping",
        },
        {
          name: "Payment Methods",
          description: "Payment method management and processing",
        },
        {
          name: "Social Login",
          description: "OAuth 2.0 integration and social authentication",
        },
        {
          name: "Cart",
          description: "Shopping cart management for user and guest carts",
        },
        {
          name: "Cart Admin",
          description: "Administrative cart operations and statistics",
        },
        {
          name: "Reservations",
          description: "Inventory reservation management for cart items",
        },
        {
          name: "Reservations Admin",
          description: "Administrative reservation operations and statistics",
        },
        {
          name: "Orders",
          description: "Order creation, management, and tracking",
        },
        {
          name: "Order Addresses",
          description: "Order billing and shipping address management",
        },
        {
          name: "Order Items",
          description:
            "Order item management - add, update, remove items from orders",
        },
        {
          name: "Order Shipments",
          description:
            "Order shipment tracking, carrier management, and delivery status",
        },
        {
          name: "Order Status History",
          description: "Order status change audit trail and history tracking",
        },
        {
          name: "Order Events",
          description:
            "Order event log, audit, and domain event tracking for orders",
        },
        {
          name: "Preorders",
          description:
            "Preorder management for future releases and seasonal collections",
        },
        {
          name: "Backorders",
          description:
            "Backorder management for temporarily out-of-stock items",
        },
        {
          name: "Stock Management",
          description:
            "Inventory stock operations - add, adjust, transfer, reserve stock",
        },
        {
          name: "Locations",
          description: "Warehouse, store, and vendor location management",
        },
        {
          name: "Suppliers",
          description: "Supplier management and contact information",
        },
        {
          name: "Purchase Orders",
          description: "Purchase order creation, receiving, and management",
        },
        {
          name: "Stock Alerts",
          description:
            "Stock alert management for low stock, out of stock, and overstock",
        },
        {
          name: "Pickup Reservations",
          description:
            "Store pickup reservation management for buy online pickup in store",
        },
        {
          name: "Inventory Transactions",
          description: "Inventory transaction history and audit trail",
        },
        {
          name: "Customer Care - Tickets",
          description: "Support ticket management, creation, and tracking",
        },
        {
          name: "Customer Care - Agents",
          description: "Support agent management and assignment",
        },
        {
          name: "Customer Care - Chat",
          description: "Live chat session and message management",
        },
        {
          name: "Customer Care - Returns",
          description: "Return/RMA request and item management",
        },
        {
          name: "Customer Care - Repairs",
          description: "Product repair request and tracking",
        },
        {
          name: "Customer Care - Goodwill",
          description: "Goodwill records for refunds, discounts, and credits",
        },
        {
          name: "Customer Care - Feedback",
          description: "Customer feedback collection and NPS/CSAT tracking",
        },
        {
          name: "Engagement - Wishlists",
          description:
            "Wishlist management - create, share, and manage product wishlists",
        },
        {
          name: "Engagement - Reminders",
          description:
            "Product reminders for back-in-stock, price drops, and low stock alerts",
        },
        {
          name: "Engagement - Notifications",
          description:
            "Notification scheduling and delivery across multiple channels",
        },
        {
          name: "Engagement - Appointments",
          description:
            "In-store appointment booking for consultations, fittings, and styling",
        },
        {
          name: "Engagement - Reviews",
          description: "Product review and rating management with moderation",
        },
        {
          name: "Engagement - Newsletter",
          description: "Newsletter subscription management",
        },
        {
          name: "System",
          description:
            "System health, monitoring, and information endpoints",
        },
      ],
      // Note: Don't set global security here, let individual routes define their own security
      // security: [],
    },
  });

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

  // System endpoints
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

  // Graceful shutdown
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

  // Proper async handling for process events
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

  // Initialize service container once
  const { createServiceContainer } = await import("./container");
  const serviceContainer = createServiceContainer();

  // Register user management routes
  try {
    const { registerUserManagementRoutes } = await import(
      "../../../modules/user-management/infra/http/routes"
    );

    const services = {
      authService: serviceContainer.authService,
      userProfileService: serviceContainer.userProfileService,
      addressService: serviceContainer.addressService,
      paymentMethodService: serviceContainer.paymentMethodService,
      userRepository: serviceContainer.userRepository,
      addressRepository: serviceContainer.addressRepository,
    };

    // Register routes with services
    await server.register(
      async function (fastify) {
        return await registerUserManagementRoutes(fastify, services);
      },
      { prefix: "/api/v1" }
    );

    server.log.info("User management routes registered successfully");
  } catch (error) {
    server.log.error(error as Error, "Failed to register user routes:");
    server.log.info("Continuing with basic endpoints only");
  }

  // Register product catalog routes
  try {
    const { registerProductCatalogRoutes } = await import(
      "../../../modules/product-catalog/infra/http/routes"
    );

    const productCatalogServices = {
      productService: serviceContainer.productManagementService,
      productSearchService: serviceContainer.productSearchService,
      categoryService: serviceContainer.categoryManagementService,
      variantService: serviceContainer.variantManagementService,
      mediaService: serviceContainer.mediaManagementService,
      productTagService: serviceContainer.productTagManagementService,
      sizeGuideService: serviceContainer.sizeGuideManagementService,
      editorialLookService: serviceContainer.editorialLookManagementService,
      productMediaService: serviceContainer.productMediaManagementService,
    };

    // Register product catalog routes with services
    await server.register(
      async function (fastify) {
        await registerProductCatalogRoutes(fastify, productCatalogServices);
      },
      { prefix: "/api/v1/catalog" }
    );

    server.log.info("Product catalog routes registered successfully");
  } catch (error) {
    server.log.error(
      error as Error,
      "Failed to register product catalog routes:"
    );
    server.log.info("Continuing with user management endpoints only");
  }

  // Register cart routes
  try {
    const { registerCartRoutes } = await import(
      "../../../modules/cart/infra/http/routes"
    );

    const cartServices = {
      cartManagementService: serviceContainer.cartManagementService,
      reservationService: serviceContainer.reservationService,
      checkoutService: serviceContainer.checkoutService,
      checkoutOrderService: serviceContainer.checkoutOrderService,
    };

    // Register cart routes with services
    await server.register(
      async function (fastify) {
        await registerCartRoutes(fastify, cartServices);
      },
      { prefix: "/api/v1/cart" }
    );

    server.log.info("Cart routes registered successfully");
  } catch (error) {
    server.log.error(error as Error, "Failed to register cart routes:");
    server.log.info("Continuing with other endpoints");
  }

  // Register order management routes
  try {
    const { registerOrderManagementRoutes } = await import(
      "../../../modules/order-management/infra/http/routes"
    );

    const orderServices = {
      orderService: serviceContainer.orderManagementService,
      orderEventService: serviceContainer.orderEventService,
      preorderService: serviceContainer.preorderManagementService,
      backorderService: serviceContainer.backorderManagementService,
    };

    // Register order management routes with services
    await server.register(
      async function (fastify) {
        await registerOrderManagementRoutes(fastify, orderServices);
      },
      { prefix: "/api/v1" }
    );

    server.log.info("Order management routes registered successfully");
  } catch (error) {
    server.log.error(
      error as Error,
      "Failed to register order management routes:"
    );
    server.log.info("Continuing with other endpoints");
  }

  // Register inventory management routes
  try {
    const { registerInventoryManagementRoutes } = await import(
      "../../../modules/inventory-management/infra/http/routes"
    );

    const inventoryServices = {
      stockService: serviceContainer.stockManagementService,
      locationService: serviceContainer.locationManagementService,
      supplierService: serviceContainer.supplierManagementService,
      poService: serviceContainer.purchaseOrderManagementService,
      alertService: serviceContainer.stockAlertService,
      reservationService: serviceContainer.pickupReservationService,
    };

    // Register inventory management routes with services
    await server.register(
      async function (fastify) {
        await registerInventoryManagementRoutes(fastify, inventoryServices);
      },
      { prefix: "/api/v1/inventory" }
    );

    server.log.info("Inventory management routes registered successfully");
  } catch (error) {
    server.log.error(
      error as Error,
      "Failed to register inventory management routes:"
    );
    server.log.info("Continuing with other endpoints");
  }

  // Register fulfillment routes
  try {
    const { registerFulfillmentRoutes } = await import(
      "../../../modules/fulfillment/infra/http/routes"
    );

    const fulfillmentServices = {
      shipmentService: serviceContainer.shipmentService,
      shipmentItemService: serviceContainer.shipmentItemService,
    };

    await server.register(
      async function (fastify) {
        await registerFulfillmentRoutes(fastify, fulfillmentServices);
      },
      { prefix: "/api/v1/fulfillment" }
    );

    server.log.info("Fulfillment routes registered successfully");
  } catch (error) {
    server.log.error(error as Error, "Failed to register fulfillment routes:");
    server.log.info("Continuing without fulfillment endpoints");
  }

  // Register payment & loyalty routes
  try {
    const { registerPaymentLoyaltyRoutes } = await import(
      "../../../modules/payment-loyalty/infra/http/routes"
    );

    const paymentLoyaltyServices = {
      paymentService: serviceContainer.paymentService,
      bnplService: serviceContainer.bnplTransactionService,
      giftCardService: serviceContainer.giftCardService,
      promotionService: serviceContainer.promotionService,
      webhookService: serviceContainer.paymentWebhookService,
      loyaltyService: serviceContainer.loyaltyService,
      loyaltyTxnService: serviceContainer.loyaltyTransactionService,
    };

    await server.register(
      async function (fastify) {
        await registerPaymentLoyaltyRoutes(fastify, paymentLoyaltyServices);
      },
      { prefix: "/api/v1" }
    );

    server.log.info("Payment & Loyalty routes registered successfully");
  } catch (error) {
    server.log.error(
      error as Error,
      "Failed to register payment & loyalty routes:"
    );
    server.log.info("Continuing without payment & loyalty endpoints");
  }

  // Register customer care routes
  try {
    const { registerCustomerCareRoutes } = await import(
      "../../../modules/customer-care/infra/http/routes"
    );

    const customerCareServices = {
      supportTicketService: serviceContainer.supportTicketService,
      ticketMessageService: serviceContainer.ticketMessageService,
      supportAgentService: serviceContainer.supportAgentService,
      chatSessionService: serviceContainer.chatSessionService,
      chatMessageService: serviceContainer.chatMessageService,
      returnRequestService: serviceContainer.returnRequestService,
      returnItemService: serviceContainer.returnItemService,
      repairService: serviceContainer.repairService,
      goodwillRecordService: serviceContainer.goodwillRecordService,
      customerFeedbackService: serviceContainer.customerFeedbackService,
    };

    await server.register(
      async function (fastify) {
        await registerCustomerCareRoutes(fastify, customerCareServices);
      },
      { prefix: "/api/v1" }
    );

    server.log.info("Customer Care routes registered successfully");
  } catch (error) {
    server.log.error(
      error as Error,
      "Failed to register customer care routes:"
    );
    server.log.info("Continuing without customer care endpoints");
  }

  // Register engagement routes
  try {
    const { registerEngagementRoutes } = await import(
      "../../../modules/engagement/infra/http/routes"
    );

    const engagementServices = {
      wishlistService: serviceContainer.wishlistManagementService,
      reminderService: serviceContainer.reminderManagementService,
      notificationService: serviceContainer.notificationService,
      appointmentService: serviceContainer.appointmentService,
      productReviewService: serviceContainer.productReviewService,
      newsletterService: serviceContainer.newsletterService,
    };

    await server.register(
      async function (fastify) {
        await registerEngagementRoutes(fastify, engagementServices);
      },
      { prefix: "/api/v1" }
    );

    server.log.info("Engagement routes registered successfully");
  } catch (error) {
    server.log.error(error as Error, "Failed to register engagement routes:");
    server.log.info("Continuing without engagement endpoints");
  }

  return server;
}
