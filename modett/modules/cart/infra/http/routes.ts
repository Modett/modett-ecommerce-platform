import { FastifyInstance } from "fastify";
import { CartController } from "./controllers/cart.controller";
import { ReservationController } from "./controllers/reservation.controller";
import { CartManagementService } from "../../application/services/cart-management.service";
import { ReservationService } from "../../application/services/reservation.service";
import { optionalAuth } from "../../../user-management/infra/http/middleware/auth.middleware";
import {
  extractGuestToken,
  requireCartAuth
} from "./middleware/cart-auth.middleware";

// Standard authentication error responses for Swagger
const authErrorResponses = {
  401: {
    description: "Unauthorized - authentication required",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Authentication required" },
      code: { type: "string", example: "AUTHENTICATION_ERROR" },
    },
  },
  403: {
    description: "Forbidden - insufficient permissions",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Insufficient permissions" },
      code: { type: "string", example: "INSUFFICIENT_PERMISSIONS" },
    },
  },
};

// Route registration function
export async function registerCartRoutes(
  fastify: FastifyInstance,
  services: {
    cartManagementService: CartManagementService;
    reservationService: ReservationService;
  }
) {
  // Initialize controllers
  const cartController = new CartController(services.cartManagementService);
  const reservationController = new ReservationController(services.reservationService);

  // =============================================================================
  // CART ROUTES
  // =============================================================================

  // Generate guest token
  fastify.get(
    "/generate-guest-token",
    {
      schema: {
        description: "Generate a guest token for creating a guest cart",
        tags: ["Cart"],
        summary: "Generate Guest Token",
        response: {
          200: {
            description: "Guest token generated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  guestToken: { type: "string", example: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456" },
                },
              },
              message: { type: "string", example: "Guest token generated successfully" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.generateGuestToken(request, reply)
  );

  // Get cart by ID
  fastify.get(
    "/carts/:cartId",
    {
      preHandler: [optionalAuth, extractGuestToken],
      schema: {
        description: "Get cart details by cart ID. Requires authentication - provide either Bearer token (for user carts) or X-Guest-Token header (for guest carts).",
        tags: ["Cart"],
        summary: "Get Cart",
        security: [
          { bearerAuth: [] }
        ],
        params: {
          type: "object",
          required: ["cartId"],
          properties: {
            cartId: { type: "string", format: "uuid", description: "Cart ID" },
          },
        },
        response: {
          200: {
            description: "Cart retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  cartId: { type: "string", format: "uuid" },
                  userId: { type: "string", format: "uuid", nullable: true },
                  guestToken: { type: "string", nullable: true },
                  currency: { type: "string", example: "USD" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        cartItemId: { type: "string", format: "uuid" },
                        variantId: { type: "string", format: "uuid" },
                        quantity: { type: "integer", example: 2 },
                        unitPrice: { type: "number", example: 29.99 },
                        isGift: { type: "boolean", example: false },
                        giftMessage: { type: "string", nullable: true },
                      },
                    },
                  },
                  summary: {
                    type: "object",
                    properties: {
                      itemCount: { type: "integer", example: 5 },
                      subtotal: { type: "number", example: 149.95 },
                      discount: { type: "number", example: 10.00 },
                      total: { type: "number", example: 139.95 },
                    },
                  },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          404: {
            description: "Cart not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Cart not found" },
            },
          },
          403: authErrorResponses[403],
        },
      },
    },
    async (request: any, reply: any) => cartController.getCart(request, reply)
  );

  // Get active cart by user ID
  fastify.get(
    "/users/:userId/cart",
    {
      schema: {
        description: "Get active cart for a user",
        tags: ["Cart"],
        summary: "Get User Cart",
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", format: "uuid", description: "User ID" },
          },
        },
        response: {
          200: {
            description: "Cart retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          404: {
            description: "No active cart found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "No active cart found for this user" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.getActiveCartByUser(request, reply)
  );

  // Get active cart by guest token
  fastify.get(
    "/guests/:guestToken/cart",
    {
      preHandler: [optionalAuth, extractGuestToken],
      schema: {
        description: "Get active cart for a guest. WARNING: Do NOT provide Authorization header - this endpoint is for guest users only. If you are logged in (have a bearer token), you must logout first.",
        tags: ["Cart"],
        summary: "Get Guest Cart",
        security: [{ bearerAuth: [] }, {}], // Optional authentication - will be rejected if provided
        params: {
          type: "object",
          required: ["guestToken"],
          properties: {
            guestToken: { type: "string", description: "Guest token" },
          },
        },
        response: {
          200: {
            description: "Cart retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          400: {
            description: "Bad request - Authenticated user cannot access guest cart",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Bad Request" },
              message: { type: "string", example: "Authenticated users cannot access guest carts. Use the user cart endpoint instead." },
              code: { type: "string", example: "AUTHENTICATED_USER_CANNOT_ACCESS_GUEST_CART" },
            },
          },
          404: {
            description: "No active cart found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "No active cart found for this guest" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.getActiveCartByGuestToken(request, reply)
  );

  // Create user cart
  fastify.post(
    "/users/:userId/cart",
    {
      schema: {
        description: "Create a new cart for a user",
        tags: ["Cart"],
        summary: "Create User Cart",
        params: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", format: "uuid", description: "User ID" },
          },
        },
        body: {
          type: "object",
          properties: {
            currency: { type: "string", default: "USD", example: "USD" },
            createReservation: { type: "boolean", default: false },
            reservationDurationMinutes: { type: "integer", example: 30 },
          },
        },
        response: {
          201: {
            description: "Cart created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
              message: { type: "string", example: "Cart created successfully" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.createUserCart(request, reply)
  );

  // Create guest cart
  fastify.post(
    "/guests/:guestToken/cart",
    {
      preHandler: [optionalAuth, extractGuestToken],
      schema: {
        description: "Create a new cart for a guest. WARNING: Do NOT provide Authorization header - this endpoint is for guest users only. If you are logged in (have a bearer token), you must logout first.",
        tags: ["Cart"],
        summary: "Create Guest Cart",
        security: [{ bearerAuth: [] }, {}], // Optional authentication - will be rejected if provided
        params: {
          type: "object",
          required: ["guestToken"],
          properties: {
            guestToken: { type: "string", description: "Guest token" },
          },
        },
        body: {
          type: "object",
          properties: {
            currency: { type: "string", default: "USD", example: "USD" },
            createReservation: { type: "boolean", default: false },
            reservationDurationMinutes: { type: "integer", example: 30 },
          },
        },
        response: {
          201: {
            description: "Cart created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
              message: { type: "string", example: "Cart created successfully" },
            },
          },
          400: {
            description: "Bad request - Authenticated user cannot create guest cart",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Bad Request" },
              message: { type: "string", example: "Authenticated users cannot create guest carts. Use the user cart endpoint instead." },
              code: { type: "string", example: "AUTHENTICATED_USER_CANNOT_CREATE_GUEST_CART" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.createGuestCart(request, reply)
  );

  // Add item to cart
  fastify.post(
    "/cart/items",
    {
      preHandler: [optionalAuth, extractGuestToken, requireCartAuth],
      schema: {
        description: "Add an item to cart. Cart will be automatically created if it doesn't exist. Requires either Bearer token authentication (for registered users) or X-Guest-Token header (for guest users).",
        tags: ["Cart"],
        summary: "Add to Cart",
        security: [
          { bearerAuth: [] }
        ],
        headers: {
          type: "object",
          properties: {
            "authorization": {
              type: "string",
              description: "Bearer token for registered users"
            },
            "x-guest-token": {
              type: "string",
              description: "Guest token (64-char hex). Get from /generate-guest-token endpoint.",
              pattern: "^[a-f0-9]{64}$"
            }
          },
          additionalProperties: true
        },
        body: {
          type: "object",
          required: ["variantId", "quantity"],
          properties: {
            cartId: { type: "string", format: "uuid", description: "Cart ID (optional for guest users)" },
            variantId: { type: "string", format: "uuid", description: "Product variant ID" },
            quantity: { type: "integer", minimum: 1, example: 2 },
            appliedPromos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  code: { type: "string" },
                  type: { type: "string", enum: ["percentage", "fixed_amount", "free_shipping", "buy_x_get_y"] },
                  value: { type: "number" },
                  description: { type: "string" },
                  appliedAt: { type: "string", format: "date-time" },
                },
              },
            },
            isGift: { type: "boolean", default: false },
            giftMessage: { type: "string" },
            createReservation: { type: "boolean", default: false },
          },
        },
        response: {
          200: {
            description: "Item added to cart successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
              message: { type: "string", example: "Item added to cart successfully" },
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
          401: authErrorResponses[401],
          403: authErrorResponses[403],
        },
      },
    },
    async (request: any, reply: any) => cartController.addToCart(request, reply)
  );

  // Update cart item
  fastify.put(
    "/carts/:cartId/items/:variantId",
    {
      preHandler: [optionalAuth, extractGuestToken],
      schema: {
        description: "Update cart item quantity. Requires authentication.",
        tags: ["Cart"],
        summary: "Update Cart Item",
        security: [
          { bearerAuth: [] }
        ],
        params: {
          type: "object",
          required: ["cartId", "variantId"],
          properties: {
            cartId: { type: "string", format: "uuid" },
            variantId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: { type: "integer", minimum: 0, example: 3 },
          },
        },
        response: {
          200: {
            description: "Cart item updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.updateCartItem(request, reply)
  );

  // Remove item from cart
  fastify.delete(
    "/carts/:cartId/items/:variantId",
    {
      preHandler: [optionalAuth, extractGuestToken],
      schema: {
        description: "Remove item from cart. Requires authentication.",
        tags: ["Cart"],
        summary: "Remove from Cart",
        security: [
          { bearerAuth: [] }
        ],
        params: {
          type: "object",
          required: ["cartId", "variantId"],
          properties: {
            cartId: { type: "string", format: "uuid" },
            variantId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Item removed from cart successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
              message: { type: "string", example: "Item removed from cart successfully" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.removeFromCart(request, reply)
  );

  // Clear cart
  fastify.delete(
    "/carts/:cartId",
    {
      preHandler: [optionalAuth, extractGuestToken],
      schema: {
        description: "Clear all items from cart. Requires authentication.",
        tags: ["Cart"],
        summary: "Clear Cart",
        security: [
          { bearerAuth: [] }
        ],
        params: {
          type: "object",
          required: ["cartId"],
          properties: {
            cartId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Cart cleared successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
              message: { type: "string", example: "Cart cleared successfully" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.clearCart(request, reply)
  );

  // Transfer guest cart to user
  fastify.post(
    "/guests/:guestToken/cart/transfer",
    {
      preHandler: [optionalAuth, extractGuestToken],
      schema: {
        description: "Transfer guest cart to authenticated user. This endpoint can optionally use Bearer token to verify the user.",
        tags: ["Cart"],
        summary: "Transfer Cart",
        security: [{ bearerAuth: [] }], // Optional authentication
        params: {
          type: "object",
          required: ["guestToken"],
          properties: {
            guestToken: { type: "string" },
          },
        },
        body: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "string", format: "uuid" },
            mergeWithExisting: { type: "boolean", default: false },
          },
        },
        response: {
          200: {
            description: "Cart transferred successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
              message: { type: "string", example: "Cart transferred successfully" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.transferGuestCartToUser(request, reply)
  );

  // Get cart statistics (admin)
  fastify.get(
    "/admin/carts/statistics",
    {
      schema: {
        description: "Get cart statistics (admin only)",
        tags: ["Cart Admin"],
        summary: "Cart Statistics",
        response: {
          200: {
            description: "Statistics retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.getCartStatistics(request, reply)
  );

  // Cleanup expired carts (admin)
  fastify.post(
    "/admin/carts/cleanup",
    {
      schema: {
        description: "Cleanup expired carts (admin only)",
        tags: ["Cart Admin"],
        summary: "Cleanup Expired Carts",
        response: {
          200: {
            description: "Cleanup completed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  deletedCount: { type: "integer" },
                },
              },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => cartController.cleanupExpiredCarts(request, reply)
  );

  // =============================================================================
  // RESERVATION ROUTES
  // =============================================================================

  // Create reservation
  fastify.post(
    "/reservations",
    {
      schema: {
        description: "Create a new reservation",
        tags: ["Reservations"],
        summary: "Create Reservation",
        body: {
          type: "object",
          required: ["cartId", "variantId", "quantity"],
          properties: {
            cartId: { type: "string", format: "uuid" },
            variantId: { type: "string", format: "uuid" },
            quantity: { type: "integer", minimum: 1, example: 2 },
            durationMinutes: { type: "integer", example: 30 },
          },
        },
        response: {
          201: {
            description: "Reservation created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  reservationId: { type: "string", format: "uuid" },
                  cartId: { type: "string", format: "uuid" },
                  variantId: { type: "string", format: "uuid" },
                  quantity: { type: "integer" },
                  expiresAt: { type: "string", format: "date-time" },
                  status: { type: "string", enum: ["active", "expiring_soon", "expired"] },
                },
              },
              message: { type: "string", example: "Reservation created successfully" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => reservationController.createReservation(request, reply)
  );

  // Get reservation by ID
  fastify.get(
    "/reservations/:reservationId",
    {
      schema: {
        description: "Get reservation details",
        tags: ["Reservations"],
        summary: "Get Reservation",
        params: {
          type: "object",
          required: ["reservationId"],
          properties: {
            reservationId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Reservation retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
          404: {
            description: "Reservation not found",
            type: "object",
            properties: {
              success: { type: "boolean", example: false },
              error: { type: "string", example: "Reservation not found" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => reservationController.getReservation(request, reply)
  );

  // Get cart reservations
  fastify.get(
    "/carts/:cartId/reservations",
    {
      schema: {
        description: "Get all reservations for a cart",
        tags: ["Reservations"],
        summary: "Get Cart Reservations",
        params: {
          type: "object",
          required: ["cartId"],
          properties: {
            cartId: { type: "string", format: "uuid" },
          },
        },
        querystring: {
          type: "object",
          properties: {
            activeOnly: { type: "boolean", default: false },
          },
        },
        response: {
          200: {
            description: "Reservations retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object" },
              },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => reservationController.getCartReservations(request, reply)
  );

  // Get variant reservations
  fastify.get(
    "/variants/:variantId/reservations",
    {
      schema: {
        description: "Get all reservations for a variant",
        tags: ["Reservations"],
        summary: "Get Variant Reservations",
        params: {
          type: "object",
          required: ["variantId"],
          properties: {
            variantId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Reservations retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: { type: "object" },
              },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => reservationController.getVariantReservations(request, reply)
  );

  // Extend reservation
  fastify.post(
    "/reservations/:reservationId/extend",
    {
      schema: {
        description: "Extend reservation duration",
        tags: ["Reservations"],
        summary: "Extend Reservation",
        params: {
          type: "object",
          required: ["reservationId"],
          properties: {
            reservationId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["additionalMinutes"],
          properties: {
            additionalMinutes: { type: "integer", minimum: 1, example: 15 },
          },
        },
        response: {
          200: {
            description: "Reservation extended successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
              message: { type: "string", example: "Reservation extended successfully" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => reservationController.extendReservation(request, reply)
  );

  // Release reservation
  fastify.delete(
    "/reservations/:reservationId",
    {
      schema: {
        description: "Release a reservation",
        tags: ["Reservations"],
        summary: "Release Reservation",
        params: {
          type: "object",
          required: ["reservationId"],
          properties: {
            reservationId: { type: "string", format: "uuid" },
          },
        },
        response: {
          200: {
            description: "Reservation released successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Reservation released successfully" },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => reservationController.releaseReservation(request, reply)
  );

  // Check availability
  fastify.get(
    "/availability",
    {
      schema: {
        description: "Check variant availability",
        tags: ["Reservations"],
        summary: "Check Availability",
        querystring: {
          type: "object",
          required: ["variantId", "requestedQuantity"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            requestedQuantity: { type: "integer", minimum: 1 },
          },
        },
        response: {
          200: {
            description: "Availability checked successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  available: { type: "boolean" },
                  totalReserved: { type: "integer" },
                  activeReserved: { type: "integer" },
                  availableForReservation: { type: "integer" },
                },
              },
            },
          },
        },
      },
    },
    async (request: any, reply: any) => reservationController.checkAvailability(request, reply)
  );

  // Cleanup expired reservations (admin)
  fastify.post(
    "/admin/reservations/cleanup",
    {
      schema: {
        description: "Cleanup expired reservations (admin only)",
        tags: ["Reservations Admin"],
        summary: "Cleanup Expired Reservations",
        response: {
          200: {
            description: "Cleanup completed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  deletedCount: { type: "integer" },
                },
              },
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => reservationController.cleanupExpiredReservations(request, reply)
  );

  // Get reservation statistics (admin)
  fastify.get(
    "/admin/reservations/statistics",
    {
      schema: {
        description: "Get reservation statistics (admin only)",
        tags: ["Reservations Admin"],
        summary: "Reservation Statistics",
        response: {
          200: {
            description: "Statistics retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: { type: "object", additionalProperties: true },
            },
          },
        },
      },
    },
    async (request, reply) => reservationController.getReservationStatistics(request, reply)
  );
}