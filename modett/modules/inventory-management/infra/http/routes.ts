import { FastifyInstance } from "fastify";
import { StockController } from "./controllers/stock.controller";
import { LocationController } from "./controllers/location.controller";
import { SupplierController } from "./controllers/supplier.controller";
import { PurchaseOrderController } from "./controllers/purchase-order.controller";
import { PurchaseOrderItemController } from "./controllers/purchase-order-item.controller";
import { StockAlertController } from "./controllers/stock-alert.controller";
import { PickupReservationController } from "./controllers/pickup-reservation.controller";
import { InventoryTransactionController } from "./controllers/inventory-transaction.controller";
import { StockManagementService } from "../../application/services/stock-management.service";
import { LocationManagementService } from "../../application/services/location-management.service";
import { SupplierManagementService } from "../../application/services/supplier-management.service";
import { PurchaseOrderManagementService } from "../../application/services/purchase-order-management.service";
import { StockAlertService } from "../../application/services/stock-alert.service";
import { PickupReservationService } from "../../application/services/pickup-reservation.service";
import {
  authenticateUser,
  authenticateAdmin,
  authenticateStaff,
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

export async function registerInventoryManagementRoutes(
  fastify: FastifyInstance,
  services: {
    stockService: StockManagementService;
    locationService: LocationManagementService;
    supplierService: SupplierManagementService;
    poService: PurchaseOrderManagementService;
    alertService: StockAlertService;
    reservationService: PickupReservationService;
  }
) {
  const stockController = new StockController(
    services.stockService,
    services.reservationService
  );
  const locationController = new LocationController(services.locationService);
  const supplierController = new SupplierController(services.supplierService);
  const poController = new PurchaseOrderController(services.poService);
  const poItemController = new PurchaseOrderItemController(services.poService);
  const alertController = new StockAlertController(services.alertService);
  const reservationController = new PickupReservationController(
    services.reservationService
  );
  const transactionController = new InventoryTransactionController(
    services.stockService
  );

  // =============================================================================
  // STOCK ROUTES
  // =============================================================================

  // List stocks
  fastify.get(
    "/stocks",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "List all stocks with pagination (Staff/Admin only)",
        tags: ["Stock Management"],
        summary: "List Stocks",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            offset: { type: "integer", minimum: 0, default: 0 },
            search: { type: "string", description: "Search by product name, SKU, or brand" },
            status: {
              type: "string",
              enum: ["low_stock", "out_of_stock", "in_stock"],
              description: "Filter by stock status"
            },
            locationId: { type: "string", description: "Filter by location ID" },
            sortBy: {
              type: "string",
              enum: ["available", "onHand", "location", "product"],
              default: "product",
              description: "Sort by field"
            },
            sortOrder: {
              type: "string",
              enum: ["asc", "desc"],
              default: "asc",
              description: "Sort order"
            },
          },
        },
        response: {
          200: {
            description: "List of stocks",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  stocks: { type: "array" },
                  total: { type: "integer" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    stockController.listStocks.bind(stockController) as any
  );

  // Get stock stats
  fastify.get(
    "/stocks/stats",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Get inventory statistics (Staff/Admin only)",
        tags: ["Stock Management"],
        summary: "Get Stock Stats",
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "Inventory statistics",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  totalItems: { type: "integer" },
                  lowStockCount: { type: "integer" },
                  outOfStockCount: { type: "integer" },
                  totalValue: { type: "number" },
                },
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    stockController.getStats.bind(stockController) as any
  );

  // Get stock by variant and location
  fastify.get(
    "/stocks/:variantId/:locationId",
    {
      preHandler: authenticateStaff,
      schema: {
        description:
          "Get stock for a specific variant at a location (Staff/Admin only)",
        tags: ["Stock Management"],
        summary: "Get Stock",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            variantId: { type: "string", format: "uuid" },
            locationId: { type: "string", format: "uuid" },
          },
          required: ["variantId", "locationId"],
        },
        response: {
          200: { description: "Stock details" },
          ...errorResponses,
        },
      },
    },
    stockController.getStock.bind(stockController) as any
  );

  // Get stock by variant (all locations)
  fastify.get(
    "/stocks/:variantId",
    {
      preHandler: authenticateStaff,
      schema: {
        description:
          "Get stock for a variant across all locations (Staff/Admin only)",
        tags: ["Stock Management"],
        summary: "Get Stock By Variant",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            variantId: { type: "string", format: "uuid" },
          },
          required: ["variantId"],
        },
        response: {
          200: { description: "Stock across all locations" },
          ...errorResponses,
        },
      },
    },
    stockController.getStockByVariant.bind(stockController) as any
  );

  // Get total available stock
  fastify.get(
    "/stocks/:variantId/total",
    {
      preHandler: authenticateStaff,
      schema: {
        description:
          "Get total available stock for a variant (Staff/Admin only)",
        tags: ["Stock Management"],
        summary: "Get Total Available Stock",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            variantId: { type: "string", format: "uuid" },
          },
          required: ["variantId"],
        },
        response: {
          200: { description: "Total available stock" },
          ...errorResponses,
        },
      },
    },
    stockController.getTotalAvailableStock.bind(stockController) as any
  );

  // Add stock
  fastify.post(
    "/stocks/add",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Add stock to inventory",
        tags: ["Stock Management"],
        summary: "Add Stock",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["variantId", "locationId", "quantity", "reason"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            locationId: { type: "string", format: "uuid" },
            quantity: { type: "integer", minimum: 1 },
            reason: {
              type: "string",
              enum: ["return", "adjustment", "po"],
            },
          },
        },
        response: {
          201: { description: "Stock added successfully" },
          ...errorResponses,
        },
      },
    },
    stockController.addStock.bind(stockController) as any
  );

  // Adjust stock
  fastify.post(
    "/stocks/adjust",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Adjust stock quantity (positive or negative)",
        tags: ["Stock Management"],
        summary: "Adjust Stock",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["variantId", "locationId", "quantityDelta", "reason"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            locationId: { type: "string", format: "uuid" },
            quantityDelta: { type: "integer" },
            reason: {
              type: "string",
              minLength: 2,
              maxLength: 64,
              description: "Reason for adjustment (custom text allowed)",
            },
          },
        },
        response: {
          200: { description: "Stock adjusted successfully" },
          ...errorResponses,
        },
      },
    },
    stockController.adjustStock.bind(stockController) as any
  );

  // Transfer stock
  fastify.post(
    "/stocks/transfer",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Transfer stock between locations",
        tags: ["Stock Management"],
        summary: "Transfer Stock",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["variantId", "fromLocationId", "toLocationId", "quantity"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            fromLocationId: { type: "string", format: "uuid" },
            toLocationId: { type: "string", format: "uuid" },
            quantity: { type: "integer", minimum: 1 },
          },
        },
        response: {
          200: { description: "Stock transferred successfully" },
          ...errorResponses,
        },
      },
    },
    stockController.transferStock.bind(stockController) as any
  );

  // Reserve stock
  fastify.post(
    "/stocks/reserve",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Reserve stock for an order",
        tags: ["Stock Management"],
        summary: "Reserve Stock",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["variantId", "locationId", "quantity"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            locationId: { type: "string", format: "uuid" },
            quantity: { type: "integer", minimum: 1 },
          },
        },
        response: {
          200: { description: "Stock reserved successfully" },
          ...errorResponses,
        },
      },
    },
    stockController.reserveStock.bind(stockController) as any
  );

  // Fulfill reservation
  fastify.post(
    "/stocks/fulfill",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Fulfill stock reservation (removes from inventory)",
        tags: ["Stock Management"],
        summary: "Fulfill Reservation",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["variantId", "locationId", "quantity"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            locationId: { type: "string", format: "uuid" },
            quantity: { type: "integer", minimum: 1 },
          },
        },
        response: {
          200: { description: "Reservation fulfilled successfully" },
          ...errorResponses,
        },
      },
    },
    stockController.fulfillReservation.bind(stockController) as any
  );

  // Set stock thresholds
  fastify.put(
    "/stocks/:variantId/:locationId/thresholds",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Set low stock and safety stock thresholds",
        tags: ["Stock Management"],
        summary: "Set Stock Thresholds",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            variantId: { type: "string", format: "uuid" },
            locationId: { type: "string", format: "uuid" },
          },
          required: ["variantId", "locationId"],
        },
        body: {
          type: "object",
          properties: {
            lowStockThreshold: { type: "integer", minimum: 0 },
            safetyStock: { type: "integer", minimum: 0 },
          },
        },
        response: {
          200: { description: "Thresholds updated successfully" },
          ...errorResponses,
        },
      },
    },
    stockController.setStockThresholds.bind(stockController) as any
  );

  // =============================================================================
  // LOCATION ROUTES
  // =============================================================================

  // List locations
  fastify.get(
    "/locations",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "List all locations (Staff/Admin only)",
        tags: ["Locations"],
        summary: "List Locations",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100 },
            offset: { type: "integer", minimum: 0 },
            type: { type: "string", enum: ["warehouse", "store", "vendor"] },
          },
        },
        response: {
          200: {
            description: "List of locations",
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  locations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        locationId: { type: "string" },
                        type: { type: "string" },
                        name: { type: "string" },
                        address: {
                          anyOf: [
                            { type: "null" },
                            {
                              type: "object",
                              properties: {
                                street: { type: "string" },
                                city: { type: "string" },
                                state: { type: "string" },
                                postalCode: { type: "string" },
                                country: { type: "string" },
                              },
                              required: [],
                            },
                          ],
                        },
                      },
                      required: ["locationId", "type", "name"],
                    },
                  },
                  total: { type: "integer" },
                },
                required: ["locations", "total"],
              },
            },
            required: ["success", "data"],
          },
          ...errorResponses,
        },
      },
    },
    locationController.listLocations.bind(locationController) as any
  );

  // Get location
  fastify.get(
    "/locations/:locationId",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Get location by ID (Staff/Admin only)",
        tags: ["Locations"],
        summary: "Get Location",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            locationId: { type: "string", format: "uuid" },
          },
          required: ["locationId"],
        },
        response: {
          200: { description: "Location details" },
          ...errorResponses,
        },
      },
    },
    locationController.getLocation.bind(locationController) as any
  );

  // Create location
  fastify.post(
    "/locations",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Create a new location",
        tags: ["Locations"],
        summary: "Create Location",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["type", "name"],
          properties: {
            type: { type: "string", enum: ["warehouse", "store", "vendor"] },
            name: { type: "string", minLength: 1, maxLength: 255 },
            address: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                postalCode: { type: "string" },
                country: { type: "string" },
              },
            },
          },
        },
        response: {
          201: { description: "Location created successfully" },
          ...errorResponses,
        },
      },
    },
    locationController.createLocation.bind(locationController)
  );

  // Update location
  fastify.put(
    "/locations/:locationId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Update location",
        tags: ["Locations"],
        summary: "Update Location",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            locationId: { type: "string", format: "uuid" },
          },
          required: ["locationId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 255 },
            address: { type: "object" },
          },
        },
        response: {
          200: { description: "Location updated successfully" },
          ...errorResponses,
        },
      },
    },
    locationController.updateLocation.bind(locationController) as any
  );

  // Delete location
  fastify.delete(
    "/locations/:locationId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete location",
        tags: ["Locations"],
        summary: "Delete Location",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            locationId: { type: "string", format: "uuid" },
          },
          required: ["locationId"],
        },
        response: {
          200: { description: "Location deleted successfully" },
          ...errorResponses,
        },
      },
    },
    locationController.deleteLocation.bind(locationController) as any
  );

  // =============================================================================
  // SUPPLIER ROUTES
  // =============================================================================

  // List suppliers
  fastify.get(
    "/suppliers",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "List all suppliers (Staff/Admin only)",
        tags: ["Suppliers"],
        summary: "List Suppliers",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100 },
            offset: { type: "integer", minimum: 0 },
          },
        },
        response: {
          200: { description: "List of suppliers" },
          ...errorResponses,
        },
      },
    },
    supplierController.listSuppliers.bind(supplierController) as any
  );

  // Get supplier
  fastify.get(
    "/suppliers/:supplierId",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Get supplier by ID (Staff/Admin only)",
        tags: ["Suppliers"],
        summary: "Get Supplier",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            supplierId: { type: "string", format: "uuid" },
          },
          required: ["supplierId"],
        },
        response: {
          200: { description: "Supplier details" },
          ...errorResponses,
        },
      },
    },
    supplierController.getSupplier.bind(supplierController) as any
  );

  // Create supplier
  fastify.post(
    "/suppliers",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Create a new supplier",
        tags: ["Suppliers"],
        summary: "Create Supplier",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", minLength: 1, maxLength: 255 },
            leadTimeDays: { type: "integer", minimum: 0 },
            contacts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        response: {
          201: { description: "Supplier created successfully" },
          ...errorResponses,
        },
      },
    },
    supplierController.createSupplier.bind(supplierController)
  );

  // Update supplier
  fastify.put(
    "/suppliers/:supplierId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Update supplier",
        tags: ["Suppliers"],
        summary: "Update Supplier",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            supplierId: { type: "string", format: "uuid" },
          },
          required: ["supplierId"],
        },
        body: {
          type: "object",
          properties: {
            name: { type: "string", minLength: 1, maxLength: 255 },
            leadTimeDays: { type: "integer", minimum: 0 },
            contacts: { type: "array" },
          },
        },
        response: {
          200: { description: "Supplier updated successfully" },
          ...errorResponses,
        },
      },
    },
    supplierController.updateSupplier.bind(supplierController) as any
  );

  // Delete supplier
  fastify.delete(
    "/suppliers/:supplierId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Delete supplier",
        tags: ["Suppliers"],
        summary: "Delete Supplier",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            supplierId: { type: "string", format: "uuid" },
          },
          required: ["supplierId"],
        },
        response: {
          200: { description: "Supplier deleted successfully" },
          ...errorResponses,
        },
      },
    },
    supplierController.deleteSupplier.bind(supplierController) as any
  );

  // =============================================================================
  // PURCHASE ORDER ROUTES
  // =============================================================================

  // List purchase orders
  fastify.get(
    "/purchase-orders",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "List all purchase orders (Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "List Purchase Orders",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100 },
            offset: { type: "integer", minimum: 0 },
            status: {
              type: "string",
              enum: ["draft", "sent", "part_received", "received", "cancelled"],
            },
            supplierId: { type: "string", format: "uuid" },
            sortBy: { type: "string", enum: ["createdAt", "updatedAt", "eta"] },
            sortOrder: { type: "string", enum: ["asc", "desc"] },
          },
        },
        response: {
          200: { description: "List of purchase orders" },
          ...errorResponses,
        },
      },
    },
    poController.listPurchaseOrders.bind(poController)
  );

  // Get purchase order
  fastify.get(
    "/purchase-orders/:poId",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Get purchase order by ID (Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "Get Purchase Order",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            poId: { type: "string", format: "uuid" },
          },
          required: ["poId"],
        },
        response: {
          200: { description: "Purchase order details" },
          ...errorResponses,
        },
      },
    },
    poController.getPurchaseOrder.bind(poController) as any
  );

  // Get PO items
  fastify.get(
    "/purchase-orders/:poId/items",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Get all items for a purchase order (Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "Get PO Items",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            poId: { type: "string", format: "uuid" },
          },
          required: ["poId"],
        },
        response: {
          200: { description: "Purchase order items" },
          ...errorResponses,
        },
      },
    },
    poItemController.getPOItems.bind(poItemController) as any
  );

  // Create purchase order
  // fastify.post(
  //   "/purchase-orders",
  //   {
  //     preHandler: async (request, reply) => {
  //       try {
  //         await authenticateUser(request, reply);
  //         console.log(
  //           "[DEBUG PO CREATE] Authentication successful, user:",
  //           request.user
  //         );
  //       } catch (error) {
  //         console.log("[DEBUG PO CREATE] Authentication error:", error);
  //         throw error;
  //       }
  //     },
  //     schema: {
  //       description: "Create a new purchase order",
  //       tags: ["Purchase Orders"],
  //       summary: "Create Purchase Order",
  //       security: [{ bearerAuth: [] }],
  //       body: {
  //         type: "object",
  //         required: ["supplierId"],
  //         properties: {
  //           supplierId: { type: "string", format: "uuid" },
  //           eta: { type: "string", format: "date-time" },
  //         },
  //       },
  //       response: {
  //         201: { description: "Purchase order created successfully" },
  //         ...errorResponses,
  //       },
  //     },
  //   },
  //   poController.createPurchaseOrder.bind(poController) as any
  // );

  // Create purchase order with items
  fastify.post(
    "/purchase-orders/full",
    {
      preHandler: authenticateStaff,
      schema: {
        description:
          "Create a new purchase order with items (Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "Create Purchase Order With Items",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["supplierId", "items"],
          properties: {
            supplierId: {
              type: "string",
              format: "uuid",
              description: "The supplier ID for this purchase order",
            },
            eta: {
              type: "string",
              format: "date-time",
              description: "Expected delivery date and time",
            },
            items: {
              type: "array",
              minItems: 1,
              maxItems: 100,
              description: "List of items to include in the purchase order",
              items: {
                type: "object",
                required: ["variantId", "orderedQty"],
                properties: {
                  variantId: {
                    type: "string",
                    format: "uuid",
                    description: "Product variant ID",
                  },
                  orderedQty: {
                    type: "integer",
                    minimum: 1,
                    maximum: 10000,
                    description: "Quantity to order",
                  },
                },
              },
            },
          },
        },
        response: {
          201: {
            description: "Purchase order with items created successfully",
            type: "object",
            properties: {
              success: { type: "boolean", example: true },
              data: {
                type: "object",
                properties: {
                  poId: { type: "string", format: "uuid" },
                  supplierId: { type: "string", format: "uuid" },
                  eta: { type: "string", format: "date-time" },
                  status: {
                    type: "string",
                    enum: [
                      "draft",
                      "sent",
                      "part_received",
                      "received",
                      "cancelled",
                    ],
                  },
                  createdAt: { type: "string" },
                  updatedAt: { type: "string" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        variantId: { type: "string", format: "uuid" },
                        orderedQty: { type: "integer" },
                        receivedQty: { type: "integer" },
                      },
                    },
                  },
                },
              },
              message: {
                type: "string",
                example: "Purchase order with items created successfully",
              },
            },
          },
          ...errorResponses,
        },
      },
    },
    poController.createPurchaseOrderWithItems.bind(poController) as any
  );

  // Add item to PO
  fastify.post(
    "/purchase-orders/:poId/items",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Add item to purchase order (Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "Add PO Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            poId: { type: "string", format: "uuid" },
          },
          required: ["poId"],
        },
        body: {
          type: "object",
          required: ["variantId", "orderedQty"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            orderedQty: { type: "integer", minimum: 1 },
          },
        },
        response: {
          201: { description: "Item added successfully" },
          ...errorResponses,
        },
      },
    },
    poItemController.addItem.bind(poItemController) as any
  );

  // Update PO item
  fastify.put(
    "/purchase-orders/:poId/items/:variantId",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Update purchase order item (Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "Update PO Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            poId: { type: "string", format: "uuid" },
            variantId: { type: "string", format: "uuid" },
          },
          required: ["poId", "variantId"],
        },
        body: {
          type: "object",
          required: ["orderedQty"],
          properties: {
            orderedQty: { type: "integer", minimum: 1 },
          },
        },
        response: {
          200: { description: "Item updated successfully" },
          ...errorResponses,
        },
      },
    },
    poItemController.updateItem.bind(poItemController) as any
  );

  // Remove PO item
  fastify.delete(
    "/purchase-orders/:poId/items/:variantId",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Remove item from purchase order (Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "Remove PO Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            poId: { type: "string", format: "uuid" },
            variantId: { type: "string", format: "uuid" },
          },
          required: ["poId", "variantId"],
        },
        response: {
          200: { description: "Item removed successfully" },
          ...errorResponses,
        },
      },
    },
    poItemController.removeItem.bind(poItemController) as any
  );

  // Update PO status
  fastify.put(
    "/purchase-orders/:poId/status",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Update purchase order status (Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "Update PO Status",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            poId: { type: "string", format: "uuid" },
          },
          required: ["poId"],
        },
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["draft", "sent", "part_received", "received", "cancelled"],
            },
          },
        },
        response: {
          200: { description: "Status updated successfully" },
          ...errorResponses,
        },
      },
    },
    poController.updatePOStatus.bind(poController) as any
  );

  // Receive PO items
  fastify.post(
    "/purchase-orders/:poId/receive",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Receive items from purchase order (Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "Receive PO Items",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            poId: { type: "string", format: "uuid" },
          },
          required: ["poId"],
        },
        body: {
          type: "object",
          required: ["locationId", "items"],
          properties: {
            locationId: { type: "string", format: "uuid" },
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["variantId", "receivedQty"],
                properties: {
                  variantId: { type: "string", format: "uuid" },
                  receivedQty: { type: "integer", minimum: 1 },
                },
              },
            },
          },
        },
        response: {
          200: { description: "Items received successfully" },
          ...errorResponses,
        },
      },
    },
    poController.receivePOItems.bind(poController) as any
  );

  // Delete purchase order
  fastify.delete(
    "/purchase-orders/:poId",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Delete purchase order (draft only, Staff/Admin only)",
        tags: ["Purchase Orders"],
        summary: "Delete Purchase Order",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            poId: { type: "string", format: "uuid" },
          },
          required: ["poId"],
        },
        response: {
          200: { description: "Purchase order deleted successfully" },
          ...errorResponses,
        },
      },
    },
    poController.deletePurchaseOrder.bind(poController) as any
  );

  // =============================================================================
  // STOCK ALERT ROUTES
  // =============================================================================

  // List alerts
  fastify.get(
    "/alerts",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "List stock alerts (Staff/Admin only)",
        tags: ["Stock Alerts"],
        summary: "List Alerts",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100 },
            offset: { type: "integer", minimum: 0 },
            includeResolved: { type: "boolean", default: true },
          },
        },
        response: {
          200: { description: "List of alerts" },
          ...errorResponses,
        },
      },
    },
    alertController.listAlerts.bind(alertController)
  );

  // Get active alerts
  fastify.get(
    "/alerts/active",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Get all active stock alerts (Staff/Admin only)",
        tags: ["Stock Alerts"],
        summary: "Get Active Alerts",
        security: [{ bearerAuth: [] }],
        response: {
          200: { description: "Active alerts" },
          ...errorResponses,
        },
      },
    },
    alertController.getActiveAlerts.bind(alertController)
  );

  // Get alert
  fastify.get(
    "/alerts/:alertId",
    {
      preHandler: authenticateStaff,
      schema: {
        description: "Get alert by ID (Staff/Admin only)",
        tags: ["Stock Alerts"],
        summary: "Get Alert",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            alertId: { type: "string", format: "uuid" },
          },
          required: ["alertId"],
        },
        response: {
          200: { description: "Alert details" },
          ...errorResponses,
        },
      },
    },
    alertController.getAlert.bind(alertController) as any
  );

  // Create alert
  fastify.post(
    "/alerts",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Create stock alert",
        tags: ["Stock Alerts"],
        summary: "Create Alert",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["variantId", "type"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            type: { type: "string", enum: ["low_stock", "oos", "overstock"] },
          },
        },
        response: {
          201: { description: "Alert created successfully" },
          ...errorResponses,
        },
      },
    },
    alertController.createAlert.bind(alertController)
  );

  // Resolve alert
  fastify.put(
    "/alerts/:alertId/resolve",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Resolve stock alert",
        tags: ["Stock Alerts"],
        summary: "Resolve Alert",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            alertId: { type: "string", format: "uuid" },
          },
          required: ["alertId"],
        },
        response: {
          200: { description: "Alert resolved successfully" },
          ...errorResponses,
        },
      },
    },
    alertController.resolveAlert.bind(alertController) as any
  );

  // =============================================================================
  // PICKUP RESERVATION ROUTES
  // =============================================================================

  // List reservations
  fastify.get(
    "/reservations",
    {
      preHandler: authenticateUser,
      schema: {
        description: "List pickup reservations",
        tags: ["Pickup Reservations"],
        summary: "List Reservations",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            locationId: { type: "string", format: "uuid" },
            activeOnly: { type: "boolean", default: true },
          },
        },
        response: {
          200: { description: "List of reservations" },
          ...errorResponses,
        },
      },
    },
    reservationController.listReservations.bind(reservationController)
  );

  // Get reservation
  fastify.get(
    "/reservations/:reservationId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get reservation by ID",
        tags: ["Pickup Reservations"],
        summary: "Get Reservation",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            reservationId: { type: "string", format: "uuid" },
          },
          required: ["reservationId"],
        },
        response: {
          200: { description: "Reservation details" },
          ...errorResponses,
        },
      },
    },
    reservationController.getReservation.bind(reservationController) as any
  );

  // Create reservation
  fastify.post(
    "/reservations",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create pickup reservation",
        tags: ["Pickup Reservations"],
        summary: "Create Reservation",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["orderId", "variantId", "locationId", "qty"],
          properties: {
            orderId: { type: "string", format: "uuid" },
            variantId: { type: "string", format: "uuid" },
            locationId: { type: "string", format: "uuid" },
            qty: { type: "integer", minimum: 1 },
            expirationMinutes: { type: "integer", minimum: 1, default: 30 },
          },
        },
        response: {
          201: { description: "Reservation created successfully" },
          ...errorResponses,
        },
      },
    },
    reservationController.createReservation.bind(reservationController)
  );

  // Cancel reservation
  fastify.delete(
    "/reservations/:reservationId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Cancel pickup reservation",
        tags: ["Pickup Reservations"],
        summary: "Cancel Reservation",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            reservationId: { type: "string", format: "uuid" },
          },
          required: ["reservationId"],
        },
        response: {
          200: { description: "Reservation cancelled successfully" },
          ...errorResponses,
        },
      },
    },
    reservationController.cancelReservation.bind(reservationController) as any
  );

  // =============================================================================
  // TRANSACTION ROUTES
  // =============================================================================

  // Get transactions by variant
  fastify.get(
    "/transactions/variant/:variantId",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "Get inventory transactions for a variant",
        tags: ["Inventory Transactions"],
        summary: "Get Transactions By Variant",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            variantId: { type: "string", format: "uuid" },
          },
          required: ["variantId"],
        },
        querystring: {
          type: "object",
          properties: {
            locationId: { type: "string", format: "uuid" },
            limit: { type: "integer", minimum: 1, maximum: 100 },
            offset: { type: "integer", minimum: 0 },
          },
        },
        response: {
          200: { description: "Transaction history" },
          ...errorResponses,
        },
      },
    },
    transactionController.getTransactionsByVariant.bind(
      transactionController
    ) as any
  );

  // List transactions
  fastify.get(
    "/transactions",
    {
      preHandler: authenticateAdmin,
      schema: {
        description: "List all inventory transactions",
        tags: ["Inventory Transactions"],
        summary: "List Transactions",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          required: ["variantId"],
          properties: {
            variantId: { type: "string", format: "uuid" },
            locationId: { type: "string", format: "uuid" },
            limit: { type: "integer", minimum: 1, maximum: 100 },
            offset: { type: "integer", minimum: 0 },
          },
        },
        response: {
          200: { description: "Transaction list" },
          ...errorResponses,
        },
      },
    },
    transactionController.listTransactions.bind(transactionController) as any
  );
}
