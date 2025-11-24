import { FastifyInstance } from "fastify";
import { OrderController } from "./controllers/order.controller";
import { OrderAddressController } from "./controllers/order-address.controller";
import { OrderItemController } from "./controllers/order-item.controller";
import { OrderShipmentController } from "./controllers/order-shipment.controller";
import { OrderStatusHistoryController } from "./controllers/order-status-history.controller";
import { OrderEventController } from "./controllers/order-event.controller";
import { PreorderController } from "./controllers/preorder.controller";
import { BackorderController } from "./controllers/backorder.controller";
import { OrderManagementService } from "../../application/services/order-management.service";
import { OrderEventService } from "../../application/services/order-event.service";
import { PreorderManagementService } from "../../application/services/preorder-management.service";
import { BackorderManagementService } from "../../application/services/backorder-management.service";
import {
  optionalAuth,
  authenticateUser,
} from "../../../user-management/infra/http/middleware/auth.middleware";

// Standard error responses for Swagger
const errorResponses = {
  400: {
    description: "Bad request - validation failed",
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
  404: {
    description: "Not found",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Resource not found" },
    },
  },
  500: {
    description: "Internal server error",
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: { type: "string", example: "Internal server error" },
    },
  },
};

// Route registration function
export async function registerOrderManagementRoutes(
  fastify: FastifyInstance,
  services: {
    orderService: OrderManagementService;
    orderEventService: OrderEventService;
    preorderService: PreorderManagementService;
    backorderService: BackorderManagementService;
  }
) {
  // Initialize controllers
  const orderController = new OrderController(services.orderService);
  const orderAddressController = new OrderAddressController(
    services.orderService
  );
  const orderItemController = new OrderItemController(services.orderService);
  const orderShipmentController = new OrderShipmentController(
    services.orderService
  );
  const orderStatusHistoryController = new OrderStatusHistoryController(
    services.orderService
  );
  const orderEventController = new OrderEventController(
    services.orderEventService
  );
  const preorderController = new PreorderController(services.preorderService);
  const backorderController = new BackorderController(
    services.backorderService
  );

  // =============================================================================
  // ORDER ROUTES
  // =============================================================================

  // Create new order
  fastify.post(
    "/orders",
    {
      preHandler: optionalAuth, // Optional authentication - allows both authenticated users and guests
      schema: {
        description:
          "Create a new order. For authenticated users, userId is extracted from the auth token. For guest checkout, provide guestToken. Product details (name, price, SKU, etc.) are automatically fetched from the database using variantId for security and consistency.",
        tags: ["Orders"],
        summary: "Create Order",
        security: [{ bearerAuth: [] }], // Add security scheme for Swagger UI
        body: {
          type: "object",
          properties: {
            guestToken: {
              type: "string",
              description:
                "Guest token for guest checkout (only required if not authenticated)",
            },
            items: {
              type: "array",
              minItems: 1,
              description:
                "Order items (at least one item required). Product details will be fetched from database.",
              items: {
                type: "object",
                required: ["variantId", "quantity"],
                properties: {
                  variantId: {
                    type: "string",
                    format: "uuid",
                    description:
                      "Product variant ID (product details will be fetched from database)",
                  },
                  quantity: {
                    type: "integer",
                    minimum: 1,
                    description: "Quantity of items",
                  },
                  isGift: {
                    type: "boolean",
                    default: false,
                    description: "Whether this item is a gift",
                  },
                  giftMessage: {
                    type: "string",
                    maxLength: 500,
                    description: "Gift message (if isGift is true)",
                  },
                },
              },
            },
            source: {
              type: "string",
              enum: ["web", "mobile"],
              default: "web",
              description: "Order source",
            },
            currency: {
              type: "string",
              default: "USD",
              description: "Currency code (e.g., USD, EUR, GBP)",
            },
          },
          required: ["items"],
        },
        response: {
          201: {
            description: "Order created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  orderNumber: { type: "string" },
                  status: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
              message: {
                type: "string",
                example: "Order created successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderController.createOrder.bind(orderController) as any
  );

  // Get order by order number (must be before /orders/:orderId to avoid route conflict)
  fastify.get(
    "/orders/number/:orderNumber",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get order by order number",
        tags: ["Orders"],
        summary: "Get Order by Number",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderNumber: { type: "string" },
          },
          required: ["orderNumber"],
        },
        response: {
          200: {
            description: "Order details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  orderNumber: { type: "string" },
                  userId: { type: "string", format: "uuid", nullable: true },
                  guestToken: { type: "string", nullable: true },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        orderItemId: { type: "string", format: "uuid" },
                        variantId: { type: "string", format: "uuid" },
                        quantity: { type: "integer", minimum: 1 },
                        productSnapshot: {
                          type: "object",
                          properties: {
                            productId: { type: "string", format: "uuid" },
                            variantId: { type: "string", format: "uuid" },
                            sku: { type: "string" },
                            name: { type: "string" },
                            variantName: { type: "string" },
                            price: { type: "number" },
                            imageUrl: { type: "string" },
                            weight: { type: "number" },
                            dimensions: { type: "object" },
                            attributes: { type: "object" },
                          },
                        },
                        isGift: { type: "boolean" },
                        giftMessage: { type: "string", nullable: true },
                      },
                    },
                  },
                  totals: {
                    type: "object",
                    properties: {
                      subtotal: { type: "number" },
                      tax: { type: "number" },
                      shipping: { type: "number" },
                      discount: { type: "number" },
                      total: { type: "number" },
                    },
                  },
                  status: { type: "string" },
                  source: { type: "string" },
                  currency: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderController.getOrderByOrderNumber.bind(orderController) as any
  );

  // Get order by ID
  fastify.get(
    "/orders/:orderId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get order by ID",
        tags: ["Orders"],
        summary: "Get Order by ID",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        response: {
          200: {
            description: "Order details",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  orderNumber: { type: "string" },
                  userId: { type: "string", format: "uuid", nullable: true },
                  guestToken: { type: "string", nullable: true },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        orderItemId: { type: "string", format: "uuid" },
                        variantId: { type: "string", format: "uuid" },
                        quantity: { type: "integer", minimum: 1 },
                        productSnapshot: {
                          type: "object",
                          properties: {
                            productId: { type: "string", format: "uuid" },
                            variantId: { type: "string", format: "uuid" },
                            sku: { type: "string" },
                            name: { type: "string" },
                            variantName: { type: "string" },
                            price: { type: "number" },
                            imageUrl: { type: "string" },
                            weight: { type: "number" },
                            dimensions: { type: "object" },
                            attributes: { type: "object" },
                          },
                        },
                        isGift: { type: "boolean" },
                        giftMessage: { type: "string", nullable: true },
                      },
                    },
                  },
                  totals: {
                    type: "object",
                    properties: {
                      subtotal: { type: "number" },
                      tax: { type: "number" },
                      shipping: { type: "number" },
                      discount: { type: "number" },
                      total: { type: "number" },
                    },
                  },
                  status: { type: "string" },
                  source: { type: "string" },
                  currency: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderController.getOrder.bind(orderController) as any
  );

  // List orders with pagination and filters
  fastify.get(
    "/orders",
    {
      preHandler: authenticateUser, // Require authentication to list orders
      schema: {
        description: "Get paginated list of orders with filtering options",
        tags: ["Orders"],
        summary: "List Orders",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            status: {
              type: "string",
              enum: [
                "created",
                "paid",
                "fulfilled",
                "partially_returned",
                "refunded",
                "cancelled",
              ],
              description: "Filter by order status",
            },
            startDate: {
              type: "string",
              format: "date-time",
              description: "Filter orders created after this date",
            },
            endDate: {
              type: "string",
              format: "date-time",
              description: "Filter orders created before this date",
            },
            sortBy: {
              type: "string",
              enum: ["createdAt", "updatedAt", "orderNumber"],
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
            description: "List of orders with pagination",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orders: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        orderId: { type: "string", format: "uuid" },
                        orderNumber: { type: "string" },
                        userId: {
                          type: "string",
                          format: "uuid",
                          nullable: true,
                        },
                        guestToken: { type: "string", nullable: true },
                        items: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              orderItemId: { type: "string", format: "uuid" },
                              variantId: { type: "string", format: "uuid" },
                              quantity: { type: "integer", minimum: 1 },
                              productSnapshot: {
                                type: "object",
                                properties: {
                                  productId: { type: "string", format: "uuid" },
                                  variantId: { type: "string", format: "uuid" },
                                  sku: { type: "string" },
                                  name: { type: "string" },
                                  variantName: { type: "string" },
                                  price: { type: "number" },
                                  imageUrl: { type: "string" },
                                  weight: { type: "number" },
                                  dimensions: { type: "object" },
                                  attributes: { type: "object" },
                                },
                              },
                              isGift: { type: "boolean" },
                              giftMessage: { type: "string", nullable: true },
                            },
                          },
                        },
                        totals: {
                          type: "object",
                          properties: {
                            subtotal: { type: "number" },
                            tax: { type: "number" },
                            shipping: { type: "number" },
                            discount: { type: "number" },
                            total: { type: "number" },
                          },
                        },
                        status: { type: "string" },
                        source: { type: "string" },
                        currency: { type: "string" },
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
          ...errorResponses,
        },
      },
    },
    orderController.listOrders.bind(orderController) as any
  );

  // Update order status
  fastify.patch(
    "/orders/:orderId/status",
    {
      preHandler: authenticateUser, // Require authentication to update order status
      schema: {
        description: "Update order status",
        tags: ["Orders"],
        summary: "Update Order Status",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: [
                "created",
                "paid",
                "fulfilled",
                "partially_returned",
                "refunded",
                "cancelled",
              ],
              description: "New order status",
            },
          },
        },
        response: {
          200: {
            description: "Order status updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  status: { type: "string" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              message: {
                type: "string",
                example: "Order status updated successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderController.updateOrderStatus.bind(orderController) as any
  );

  // Update order totals
  fastify.patch(
    "/orders/:orderId/totals",
    {
      preHandler: authenticateUser, // Require authentication to update order totals
      schema: {
        description:
          "Update order totals. Subtotal is auto-calculated from order items. Total is auto-calculated as: subtotal + tax + shipping - discount.",
        tags: ["Orders"],
        summary: "Update Order Totals",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        body: {
          type: "object",
          required: ["totals"],
          properties: {
            totals: {
              type: "object",
              required: ["tax", "shipping", "discount"],
              properties: {
                tax: {
                  type: "number",
                  minimum: 0,
                  description: "Sales tax amount",
                },
                shipping: {
                  type: "number",
                  minimum: 0,
                  description: "Shipping/delivery fee",
                },
                discount: {
                  type: "number",
                  minimum: 0,
                  description: "Discount amount (from coupon/promo)",
                },
              },
              description: "Subtotal and total are auto-calculated from items",
            },
          },
        },
        response: {
          200: {
            description: "Order totals updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  totals: {
                    type: "object",
                    properties: {
                      subtotal: { type: "number" },
                      discount: { type: "number" },
                      tax: { type: "number" },
                      shipping: { type: "number" },
                      total: { type: "number" },
                    },
                  },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              message: {
                type: "string",
                example: "Order totals updated successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderController.updateOrderTotals.bind(orderController) as any
  );

  // Mark order as paid
  fastify.post(
    "/orders/:orderId/mark-paid",
    {
      preHandler: authenticateUser, // Require authentication to mark order as paid
      schema: {
        description: "Mark order as paid",
        tags: ["Orders"],
        summary: "Mark Order as Paid",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        response: {
          200: {
            description: "Order marked as paid successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  status: { type: "string", example: "paid" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              message: {
                type: "string",
                example: "Order marked as paid successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderController.markOrderAsPaid.bind(orderController) as any
  );

  // Mark order as fulfilled
  fastify.post(
    "/orders/:orderId/mark-fulfilled",
    {
      preHandler: authenticateUser, // Require authentication to mark order as fulfilled
      schema: {
        description: "Mark order as fulfilled",
        tags: ["Orders"],
        summary: "Mark Order as Fulfilled",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        response: {
          200: {
            description: "Order marked as fulfilled successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  status: { type: "string", example: "fulfilled" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              message: {
                type: "string",
                example: "Order marked as fulfilled successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderController.markOrderAsFulfilled.bind(orderController) as any
  );

  // Cancel order
  fastify.post(
    "/orders/:orderId/cancel",
    {
      preHandler: authenticateUser, // Require authentication to cancel order
      schema: {
        description: "Cancel an order",
        tags: ["Orders"],
        summary: "Cancel Order",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        response: {
          200: {
            description: "Order cancelled successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  status: { type: "string", example: "cancelled" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              message: {
                type: "string",
                example: "Order cancelled successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderController.cancelOrder.bind(orderController) as any
  );

  // Delete order
  fastify.delete(
    "/orders/:orderId",
    {
      preHandler: authenticateUser, // Require authentication to delete order
      schema: {
        description: "Delete an order",
        tags: ["Orders"],
        summary: "Delete Order",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        response: {
          200: {
            description: "Order deleted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Order deleted successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderController.deleteOrder.bind(orderController) as any
  );

  // =============================================================================
  // ORDER ADDRESS ROUTES
  // =============================================================================

  // Set order addresses (billing & shipping)
  fastify.post(
    "/orders/:orderId/addresses",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Set billing and shipping addresses for an order. Order must be in 'created' status.",
        tags: ["Order Addresses"],
        summary: "Set Order Addresses",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        body: {
          type: "object",
          required: ["billingAddress", "shippingAddress"],
          properties: {
            billingAddress: {
              type: "object",
              required: [
                "firstName",
                "lastName",
                "addressLine1",
                "city",
                "state",
                "postalCode",
                "country",
              ],
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                addressLine1: { type: "string" },
                addressLine2: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                postalCode: { type: "string" },
                country: { type: "string" },
                phone: { type: "string" },
                email: { type: "string", format: "email" },
              },
            },
            shippingAddress: {
              type: "object",
              required: [
                "firstName",
                "lastName",
                "addressLine1",
                "city",
                "state",
                "postalCode",
                "country",
              ],
              properties: {
                firstName: { type: "string" },
                lastName: { type: "string" },
                addressLine1: { type: "string" },
                addressLine2: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                postalCode: { type: "string" },
                country: { type: "string" },
                phone: { type: "string" },
                email: { type: "string", format: "email" },
              },
            },
          },
        },
        response: {
          201: {
            description: "Order addresses set successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  billingAddress: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      addressLine1: { type: "string" },
                      addressLine2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      postalCode: { type: "string" },
                      country: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string", format: "email" },
                    },
                  },
                  shippingAddress: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      addressLine1: { type: "string" },
                      addressLine2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      postalCode: { type: "string" },
                      country: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string", format: "email" },
                    },
                  },
                  isSameAddress: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Order addresses set successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderAddressController.setAddresses.bind(orderAddressController) as any
  );

  // Get order addresses
  fastify.get(
    "/orders/:orderId/addresses",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get billing and shipping addresses for an order",
        tags: ["Order Addresses"],
        summary: "Get Order Addresses",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        response: {
          200: {
            description: "Order addresses retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  billingAddress: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      addressLine1: { type: "string" },
                      addressLine2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      postalCode: { type: "string" },
                      country: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string", format: "email" },
                    },
                  },
                  shippingAddress: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      addressLine1: { type: "string" },
                      addressLine2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      postalCode: { type: "string" },
                      country: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string", format: "email" },
                    },
                  },
                  isSameAddress: { type: "boolean" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderAddressController.getAddresses.bind(orderAddressController) as any
  );

  // Update billing address
  fastify.patch(
    "/orders/:orderId/addresses/billing",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update billing address for an order",
        tags: ["Order Addresses"],
        summary: "Update Billing Address",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        body: {
          type: "object",
          required: [
            "firstName",
            "lastName",
            "addressLine1",
            "city",
            "state",
            "postalCode",
            "country",
          ],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            addressLine1: { type: "string" },
            addressLine2: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            postalCode: { type: "string" },
            country: { type: "string" },
            phone: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
        response: {
          200: {
            description: "Billing address updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  billingAddress: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      addressLine1: { type: "string" },
                      addressLine2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      postalCode: { type: "string" },
                      country: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string", format: "email" },
                    },
                  },
                  shippingAddress: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      addressLine1: { type: "string" },
                      addressLine2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      postalCode: { type: "string" },
                      country: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string", format: "email" },
                    },
                  },
                  isSameAddress: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Billing address updated successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderAddressController.updateBillingAddress.bind(
      orderAddressController
    ) as any
  );

  // Update shipping address
  fastify.patch(
    "/orders/:orderId/addresses/shipping",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update shipping address for an order",
        tags: ["Order Addresses"],
        summary: "Update Shipping Address",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        body: {
          type: "object",
          required: [
            "firstName",
            "lastName",
            "addressLine1",
            "city",
            "state",
            "postalCode",
            "country",
          ],
          properties: {
            firstName: { type: "string" },
            lastName: { type: "string" },
            addressLine1: { type: "string" },
            addressLine2: { type: "string" },
            city: { type: "string" },
            state: { type: "string" },
            postalCode: { type: "string" },
            country: { type: "string" },
            phone: { type: "string" },
            email: { type: "string", format: "email" },
          },
        },
        response: {
          200: {
            description: "Shipping address updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderId: { type: "string", format: "uuid" },
                  billingAddress: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      addressLine1: { type: "string" },
                      addressLine2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      postalCode: { type: "string" },
                      country: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string", format: "email" },
                    },
                  },
                  shippingAddress: {
                    type: "object",
                    properties: {
                      firstName: { type: "string" },
                      lastName: { type: "string" },
                      addressLine1: { type: "string" },
                      addressLine2: { type: "string" },
                      city: { type: "string" },
                      state: { type: "string" },
                      postalCode: { type: "string" },
                      country: { type: "string" },
                      phone: { type: "string" },
                      email: { type: "string", format: "email" },
                    },
                  },
                  isSameAddress: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Shipping address updated successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderAddressController.updateShippingAddress.bind(
      orderAddressController
    ) as any
  );

  // =============================================================================
  // ORDER ITEM ROUTES
  // =============================================================================

  // Add item to order
  fastify.post(
    "/orders/:orderId/items",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Add an item to an existing order. Order must be in 'created' status. Product details are automatically fetched from the database.",
        tags: ["Order Items"],
        summary: "Add Order Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        body: {
          type: "object",
          required: ["variantId", "quantity"],
          properties: {
            variantId: {
              type: "string",
              format: "uuid",
              description: "Product variant ID",
            },
            quantity: {
              type: "integer",
              minimum: 1,
              description: "Quantity of items",
            },
            isGift: {
              type: "boolean",
              default: false,
              description: "Whether this item is a gift",
            },
            giftMessage: {
              type: "string",
              maxLength: 500,
              description: "Gift message (if isGift is true)",
            },
          },
        },
        response: {
          201: {
            description: "Item added successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Item added successfully" },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderItemController.addItem.bind(orderItemController) as any
  );

  // Get all items for an order
  fastify.get(
    "/orders/:orderId/items",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get all items for a specific order",
        tags: ["Order Items"],
        summary: "Get Order Items",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        response: {
          200: {
            description: "Order items retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    orderItemId: { type: "string", format: "uuid" },
                    orderId: { type: "string", format: "uuid" },
                    variantId: { type: "string", format: "uuid" },
                    quantity: { type: "integer", minimum: 1 },
                    productSnapshot: {
                      type: "object",
                      properties: {
                        productId: { type: "string", format: "uuid" },
                        variantId: { type: "string", format: "uuid" },
                        sku: { type: "string" },
                        name: { type: "string" },
                        variantName: { type: "string" },
                        price: { type: "number" },
                        imageUrl: { type: "string" },
                        weight: { type: "number" },
                        dimensions: { type: "object" },
                        attributes: { type: "object" },
                      },
                    },
                    isGift: { type: "boolean" },
                    giftMessage: { type: "string", nullable: true },
                    subtotal: { type: "number" },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderItemController.getItems.bind(orderItemController) as any
  );

  // Get single order item by ID
  fastify.get(
    "/items/:itemId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get a specific order item by its ID",
        tags: ["Order Items"],
        summary: "Get Order Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            itemId: { type: "string", format: "uuid" },
          },
          required: ["itemId"],
        },
        response: {
          200: {
            description: "Order item retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  orderId: { type: "string", format: "uuid" },
                  variantId: { type: "string", format: "uuid" },
                  quantity: { type: "integer", minimum: 1 },
                  productSnapshot: {
                    type: "object",
                    properties: {
                      productId: { type: "string", format: "uuid" },
                      variantId: { type: "string", format: "uuid" },
                      sku: { type: "string" },
                      name: { type: "string" },
                      variantName: { type: "string" },
                      price: { type: "number" },
                      imageUrl: { type: "string" },
                      weight: { type: "number" },
                      dimensions: { type: "object" },
                      attributes: { type: "object" },
                    },
                  },
                  isGift: { type: "boolean" },
                  giftMessage: { type: "string", nullable: true },
                  subtotal: { type: "number" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderItemController.getItem.bind(orderItemController) as any
  );

  // Update order item
  fastify.patch(
    "/orders/:orderId/items/:itemId",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Update an order item. Can update quantity and/or gift status. Order must be in 'created' status.",
        tags: ["Order Items"],
        summary: "Update Order Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            itemId: { type: "string", format: "uuid" },
          },
          required: ["orderId", "itemId"],
        },
        body: {
          type: "object",
          properties: {
            quantity: {
              type: "integer",
              minimum: 1,
              description: "New quantity",
            },
            isGift: {
              type: "boolean",
              description: "Whether this item is a gift",
            },
            giftMessage: {
              type: "string",
              maxLength: 500,
              description: "Gift message",
            },
          },
        },
        response: {
          200: {
            description: "Item updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: { type: "string", example: "Item updated successfully" },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderItemController.updateItem.bind(orderItemController) as any
  );

  // Remove item from order
  fastify.delete(
    "/orders/:orderId/items/:itemId",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Remove an item from an order. Order must be in 'created' status and must have at least one other item.",
        tags: ["Order Items"],
        summary: "Remove Order Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            itemId: { type: "string", format: "uuid" },
          },
          required: ["orderId", "itemId"],
        },
        response: {
          200: {
            description: "Item removed successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Item removed successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderItemController.removeItem.bind(orderItemController) as any
  );

  // =============================================================================
  // ORDER SHIPMENT ROUTES
  // =============================================================================

  // Create shipment for an order
  fastify.post(
    "/orders/:orderId/shipments",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create a new shipment for an order",
        tags: ["Order Shipments"],
        summary: "Create Shipment",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        body: {
          type: "object",
          properties: {
            carrier: {
              type: "string",
              description: "Carrier name (e.g., FedEx, UPS)",
            },
            service: {
              type: "string",
              description: "Service type (e.g., Express, Ground)",
            },
            trackingNumber: { type: "string", description: "Tracking number" },
            giftReceipt: {
              type: "boolean",
              default: false,
              description: "Include gift receipt",
            },
            pickupLocationId: {
              type: "string",
              format: "uuid",
              description: "Pickup location ID",
            },
          },
        },
        response: {
          201: {
            description: "Shipment created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                additionalProperties: true,
                properties: {
                  shipmentId: { type: "string", format: "uuid" },
                  orderId: { type: "string", format: "uuid" },
                  carrier: { type: "string" },
                  service: { type: "string" },
                  trackingNumber: { type: "string" },
                  giftReceipt: { type: "boolean" },
                  pickupLocationId: { type: "string", format: "uuid" },
                  shippedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  deliveredAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  isShipped: { type: "boolean" },
                  isDelivered: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Shipment created successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderShipmentController.createShipment.bind(orderShipmentController) as any
  );

  // Get all shipments for an order
  fastify.get(
    "/orders/:orderId/shipments",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get all shipments for an order",
        tags: ["Order Shipments"],
        summary: "Get Order Shipments",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        response: {
          200: {
            description: "Shipments retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderShipmentController.getShipments.bind(orderShipmentController) as any
  );

  // Get single shipment
  fastify.get(
    "/orders/:orderId/shipments/:shipmentId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get a specific shipment by ID",
        tags: ["Order Shipments"],
        summary: "Get Shipment",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            shipmentId: { type: "string", format: "uuid" },
          },
          required: ["orderId", "shipmentId"],
        },
        response: {
          200: {
            description: "Shipment retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderShipmentController.getShipment.bind(orderShipmentController) as any
  );

  // Mark shipment as shipped
  fastify.post(
    "/orders/:orderId/shipments/:shipmentId/mark-shipped",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Mark a shipment as shipped with carrier and tracking details",
        tags: ["Order Shipments"],
        summary: "Mark Shipment as Shipped",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            shipmentId: { type: "string", format: "uuid" },
          },
          required: ["orderId", "shipmentId"],
        },
        body: {
          type: "object",
          required: ["carrier", "service", "trackingNumber"],
          properties: {
            carrier: { type: "string", description: "Carrier name" },
            service: { type: "string", description: "Service type" },
            trackingNumber: { type: "string", description: "Tracking number" },
          },
        },
        response: {
          200: {
            description: "Shipment marked as shipped successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                additionalProperties: true,
              },
              message: {
                type: "string",
                example: "Shipment marked as shipped successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderShipmentController.markShipped.bind(orderShipmentController) as any
  );

  // Update shipment tracking
  fastify.patch(
    "/orders/:orderId/shipments/:shipmentId/tracking",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update shipment tracking information",
        tags: ["Order Shipments"],
        summary: "Update Shipment Tracking",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            shipmentId: { type: "string", format: "uuid" },
          },
          required: ["orderId", "shipmentId"],
        },
        body: {
          type: "object",
          required: ["trackingNumber"],
          properties: {
            trackingNumber: {
              type: "string",
              description: "New tracking number",
            },
            carrier: { type: "string", description: "Carrier name" },
            service: { type: "string", description: "Service type" },
          },
        },
        response: {
          200: {
            description: "Tracking information updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                additionalProperties: true,
              },
              message: {
                type: "string",
                example: "Shipment tracking updated successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderShipmentController.updateTracking.bind(orderShipmentController) as any
  );

  // Mark shipment as delivered
  fastify.post(
    "/orders/:orderId/shipments/:shipmentId/mark-delivered",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Mark a shipment as delivered",
        tags: ["Order Shipments"],
        summary: "Mark Shipment as Delivered",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            shipmentId: { type: "string", format: "uuid" },
          },
          required: ["orderId", "shipmentId"],
        },
        body: {
          type: "object",
          properties: {
            deliveredAt: {
              type: "string",
              format: "date-time",
              description: "Delivery timestamp (defaults to now)",
            },
          },
        },
        response: {
          200: {
            description: "Shipment marked as delivered successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                additionalProperties: true,
              },
              message: {
                type: "string",
                example: "Shipment marked as delivered successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderShipmentController.markDelivered.bind(orderShipmentController) as any
  );

  // =============================================================================
  // ORDER STATUS HISTORY ROUTES
  // =============================================================================

  // Log order status change
  fastify.post(
    "/orders/:orderId/status-history",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Log a status change for an order. Creates an audit trail entry.",
        tags: ["Order Status History"],
        summary: "Log Order Status Change",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        body: {
          type: "object",
          required: ["toStatus"],
          properties: {
            fromStatus: {
              type: "string",
              enum: [
                "created",
                "paid",
                "fulfilled",
                "partially_returned",
                "refunded",
                "cancelled",
              ],
              description: "Previous status (optional for initial status)",
            },
            toStatus: {
              type: "string",
              enum: [
                "created",
                "paid",
                "fulfilled",
                "partially_returned",
                "refunded",
                "cancelled",
              ],
              description: "New status",
            },
            changedBy: {
              type: "string",
              description: "User or system that made the change",
            },
          },
        },
        response: {
          201: {
            description: "Status change logged successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                additionalProperties: true,
                properties: {
                  historyId: { type: "number" },
                  orderId: { type: "string", format: "uuid" },
                  fromStatus: { type: "string", nullable: true },
                  toStatus: { type: "string" },
                  changedAt: { type: "string", format: "date-time" },
                  changedBy: { type: "string", nullable: true },
                  isInitialStatus: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Status change logged successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderStatusHistoryController.logStatusChange.bind(
      orderStatusHistoryController
    ) as any
  );

  // Get order status history
  fastify.get(
    "/orders/:orderId/status-history",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get the complete status change history for an order",
        tags: ["Order Status History"],
        summary: "Get Order Status History",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        querystring: {
          type: "object",
          properties: {
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              description: "Maximum number of records to return",
            },
            offset: {
              type: "integer",
              minimum: 0,
              description: "Number of records to skip",
            },
          },
        },
        response: {
          200: {
            description: "Status history retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    historyId: { type: "number" },
                    orderId: { type: "string", format: "uuid" },
                    fromStatus: { type: "string", nullable: true },
                    toStatus: { type: "string" },
                    changedAt: { type: "string", format: "date-time" },
                    changedBy: { type: "string", nullable: true },
                    isInitialStatus: { type: "boolean" },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderStatusHistoryController.getStatusHistory.bind(
      orderStatusHistoryController
    ) as any
  );

  // =============================================================================
  // ORDER EVENT ROUTES
  // =============================================================================

  // Log an event for an order
  fastify.post(
    "/orders/:orderId/events",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Log a custom event for an order. Creates an audit trail entry with event type and payload.",
        tags: ["Order Events"],
        summary: "Log Order Event",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        body: {
          type: "object",
          required: ["eventType"],
          properties: {
            eventType: {
              type: "string",
              description:
                "Event type (e.g., 'order.created', 'order.paid', 'payment.received')",
            },
            payload: {
              type: "object",
              description: "Event payload - custom data related to the event",
              additionalProperties: true,
            },
          },
        },
        response: {
          201: {
            description: "Event logged successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  eventId: { type: "number" },
                  orderId: { type: "string", format: "uuid" },
                  eventType: { type: "string" },
                  payload: { type: "object", additionalProperties: true },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
              message: { type: "string", example: "Event logged successfully" },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderEventController.logEvent.bind(orderEventController) as any
  );

  // Get all events for an order
  fastify.get(
    "/orders/:orderId/events",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Get all events for an order with optional filtering and pagination",
        tags: ["Order Events"],
        summary: "Get Order Events",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
          },
          required: ["orderId"],
        },
        querystring: {
          type: "object",
          properties: {
            eventType: {
              type: "string",
              description: "Filter by event type",
            },
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              description: "Maximum number of events to return",
            },
            offset: {
              type: "integer",
              minimum: 0,
              description: "Number of events to skip",
            },
            sortBy: {
              type: "string",
              enum: ["createdAt", "eventId"],
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
            description: "Events retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    eventId: { type: "number" },
                    orderId: { type: "string", format: "uuid" },
                    eventType: { type: "string" },
                    payload: { type: "object", additionalProperties: true },
                    createdAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderEventController.getEvents.bind(orderEventController) as any
  );

  // Get single event by ID
  fastify.get(
    "/orders/:orderId/events/:eventId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get a specific event by its ID",
        tags: ["Order Events"],
        summary: "Get Order Event",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            eventId: { type: "string" },
          },
          required: ["orderId", "eventId"],
        },
        response: {
          200: {
            description: "Event retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  eventId: { type: "number" },
                  orderId: { type: "string", format: "uuid" },
                  eventType: { type: "string" },
                  payload: { type: "object", additionalProperties: true },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    orderEventController.getEvent.bind(orderEventController) as any
  );

  // =============================================================================
  // PREORDER ROUTES
  // =============================================================================

  // Create preorder for an order item
  fastify.post(
    "/preorders",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Create a new preorder for an order item. Used for items that will be available in the future (e.g., seasonal collections, upcoming releases).",
        tags: ["Preorders"],
        summary: "Create Preorder",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["orderItemId"],
          properties: {
            orderItemId: {
              type: "string",
              format: "uuid",
              description: "Order item ID",
            },
            releaseDate: {
              type: "string",
              format: "date-time",
              description: "Expected release date (must be in the future)",
            },
          },
        },
        response: {
          201: {
            description: "Preorder created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  releaseDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  notifiedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  hasReleaseDate: { type: "boolean" },
                  isCustomerNotified: { type: "boolean" },
                  isReleased: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Preorder created successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    preorderController.createPreorder.bind(preorderController) as any
  );

  // Get preorder by order item ID
  fastify.get(
    "/preorders/:orderItemId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get preorder details for a specific order item",
        tags: ["Preorders"],
        summary: "Get Preorder",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderItemId: { type: "string", format: "uuid" },
          },
          required: ["orderItemId"],
        },
        response: {
          200: {
            description: "Preorder retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  releaseDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  notifiedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  hasReleaseDate: { type: "boolean" },
                  isCustomerNotified: { type: "boolean" },
                  isReleased: { type: "boolean" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    preorderController.getPreorder.bind(preorderController) as any
  );

  // List preorders with filtering
  fastify.get(
    "/preorders",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Get paginated list of preorders with filtering options (all, notified, unnotified, released)",
        tags: ["Preorders"],
        summary: "List Preorders",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
              description: "Maximum number of preorders to return",
            },
            offset: {
              type: "integer",
              minimum: 0,
              default: 0,
              description: "Number of preorders to skip",
            },
            sortBy: {
              type: "string",
              enum: ["releaseDate", "notifiedAt"],
              default: "releaseDate",
              description: "Sort by field",
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
              description: "Sort order",
            },
            filterType: {
              type: "string",
              enum: ["all", "notified", "unnotified", "released"],
              default: "all",
              description: "Filter preorders by type",
            },
          },
        },
        response: {
          200: {
            description: "Preorders retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        orderItemId: { type: "string", format: "uuid" },
                        releaseDate: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        notifiedAt: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        hasReleaseDate: { type: "boolean" },
                        isCustomerNotified: { type: "boolean" },
                        isReleased: { type: "boolean" },
                      },
                    },
                  },
                  total: { type: "integer" },
                  limit: { type: "integer" },
                  offset: { type: "integer" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    preorderController.listPreorders.bind(preorderController) as any
  );

  // Update preorder release date
  fastify.patch(
    "/preorders/:orderItemId/release-date",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update the expected release date for a preorder",
        tags: ["Preorders"],
        summary: "Update Preorder Release Date",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderItemId: { type: "string", format: "uuid" },
          },
          required: ["orderItemId"],
        },
        body: {
          type: "object",
          required: ["releaseDate"],
          properties: {
            releaseDate: {
              type: "string",
              format: "date-time",
              description: "New release date (must be in the future)",
            },
          },
        },
        response: {
          200: {
            description: "Preorder release date updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  releaseDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  notifiedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  hasReleaseDate: { type: "boolean" },
                  isCustomerNotified: { type: "boolean" },
                  isReleased: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Preorder release date updated successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    preorderController.updateReleaseDate.bind(preorderController) as any
  );

  // Mark preorder customer as notified
  fastify.post(
    "/preorders/:orderItemId/notify",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Mark that the customer has been notified about the preorder availability",
        tags: ["Preorders"],
        summary: "Mark Preorder as Notified",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderItemId: { type: "string", format: "uuid" },
          },
          required: ["orderItemId"],
        },
        response: {
          200: {
            description: "Preorder marked as notified successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  releaseDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  notifiedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  hasReleaseDate: { type: "boolean" },
                  isCustomerNotified: { type: "boolean" },
                  isReleased: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Preorder marked as notified successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    preorderController.markNotified.bind(preorderController) as any
  );

  // Delete preorder
  fastify.delete(
    "/preorders/:orderItemId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Delete a preorder",
        tags: ["Preorders"],
        summary: "Delete Preorder",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderItemId: { type: "string", format: "uuid" },
          },
          required: ["orderItemId"],
        },
        response: {
          200: {
            description: "Preorder deleted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Preorder deleted successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    preorderController.deletePreorder.bind(preorderController) as any
  );

  // =============================================================================
  // BACKORDER ROUTES
  // =============================================================================

  // Create backorder for an order item
  fastify.post(
    "/backorders",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Create a new backorder for an order item. Used for items that are temporarily out of stock but will be restocked soon.",
        tags: ["Backorders"],
        summary: "Create Backorder",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["orderItemId"],
          properties: {
            orderItemId: {
              type: "string",
              format: "uuid",
              description: "Order item ID",
            },
            promisedEta: {
              type: "string",
              format: "date-time",
              description:
                "Promised ETA for restocking (must be in the future)",
            },
          },
        },
        response: {
          201: {
            description: "Backorder created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  promisedEta: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  notifiedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  hasPromisedEta: { type: "boolean" },
                  isCustomerNotified: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Backorder created successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    backorderController.createBackorder.bind(backorderController) as any
  );

  // Get backorder by order item ID
  fastify.get(
    "/backorders/:orderItemId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get backorder details for a specific order item",
        tags: ["Backorders"],
        summary: "Get Backorder",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderItemId: { type: "string", format: "uuid" },
          },
          required: ["orderItemId"],
        },
        response: {
          200: {
            description: "Backorder retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  promisedEta: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  notifiedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  hasPromisedEta: { type: "boolean" },
                  isCustomerNotified: { type: "boolean" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    backorderController.getBackorder.bind(backorderController) as any
  );

  // List backorders with filtering
  fastify.get(
    "/backorders",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Get paginated list of backorders with filtering options (all, notified, unnotified, overdue)",
        tags: ["Backorders"],
        summary: "List Backorders",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 20,
              description: "Maximum number of backorders to return",
            },
            offset: {
              type: "integer",
              minimum: 0,
              default: 0,
              description: "Number of backorders to skip",
            },
            sortBy: {
              type: "string",
              enum: ["promisedEta", "notifiedAt"],
              default: "promisedEta",
              description: "Sort by field",
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
              description: "Sort order",
            },
            filterType: {
              type: "string",
              enum: ["all", "notified", "unnotified", "overdue"],
              default: "all",
              description: "Filter backorders by type",
            },
          },
        },
        response: {
          200: {
            description: "Backorders retrieved successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        orderItemId: { type: "string", format: "uuid" },
                        promisedEta: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        notifiedAt: {
                          type: "string",
                          format: "date-time",
                          nullable: true,
                        },
                        hasPromisedEta: { type: "boolean" },
                        isCustomerNotified: { type: "boolean" },
                      },
                    },
                  },
                  total: { type: "integer" },
                  limit: { type: "integer" },
                  offset: { type: "integer" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    backorderController.listBackorders.bind(backorderController) as any
  );

  // Update backorder promised ETA
  fastify.patch(
    "/backorders/:orderItemId/eta",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update the promised ETA for a backorder",
        tags: ["Backorders"],
        summary: "Update Backorder ETA",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderItemId: { type: "string", format: "uuid" },
          },
          required: ["orderItemId"],
        },
        body: {
          type: "object",
          required: ["promisedEta"],
          properties: {
            promisedEta: {
              type: "string",
              format: "date-time",
              description: "New promised ETA (must be in the future)",
            },
          },
        },
        response: {
          200: {
            description: "Backorder ETA updated successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  promisedEta: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  notifiedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  hasPromisedEta: { type: "boolean" },
                  isCustomerNotified: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Backorder promised ETA updated successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    backorderController.updatePromisedEta.bind(backorderController) as any
  );

  // Mark backorder customer as notified
  fastify.post(
    "/backorders/:orderItemId/notify",
    {
      preHandler: authenticateUser,
      schema: {
        description:
          "Mark that the customer has been notified about the backorder availability",
        tags: ["Backorders"],
        summary: "Mark Backorder as Notified",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderItemId: { type: "string", format: "uuid" },
          },
          required: ["orderItemId"],
        },
        response: {
          200: {
            description: "Backorder marked as notified successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  promisedEta: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  notifiedAt: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  hasPromisedEta: { type: "boolean" },
                  isCustomerNotified: { type: "boolean" },
                },
              },
              message: {
                type: "string",
                example: "Backorder marked as notified successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    backorderController.markNotified.bind(backorderController) as any
  );

  // Delete backorder
  fastify.delete(
    "/backorders/:orderItemId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Delete a backorder",
        tags: ["Backorders"],
        summary: "Delete Backorder",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            orderItemId: { type: "string", format: "uuid" },
          },
          required: ["orderItemId"],
        },
        response: {
          200: {
            description: "Backorder deleted successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              message: {
                type: "string",
                example: "Backorder deleted successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    backorderController.deleteBackorder.bind(backorderController) as any
  );
}
