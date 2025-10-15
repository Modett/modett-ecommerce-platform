import { FastifyInstance } from "fastify";
import {
  ShipmentController,
  ShipmentItemController,
} from "./controllers";
import { ShipmentService } from "../../application/services/shipment.service";
import { ShipmentItemService } from "../../application/services/shipment-item.service";
import { authenticateUser } from "../../../user-management/infra/http/middleware/auth.middleware";

export interface FulfillmentServices {
  shipmentService: ShipmentService;
  shipmentItemService: ShipmentItemService;
}

export async function registerFulfillmentRoutes(
  fastify: FastifyInstance,
  services: FulfillmentServices
) {
  const shipmentController = new ShipmentController(
    services.shipmentService,
    services.shipmentItemService
  );
  const shipmentItemController = new ShipmentItemController(
    services.shipmentService,
    services.shipmentItemService
  );

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
  } as const;

  // Shipments
  fastify.post(
    "/shipments",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Create a shipment",
        tags: ["Fulfillment"],
        summary: "Create Shipment",
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          required: ["orderId"],
          properties: {
            orderId: { type: "string", format: "uuid" },
            carrier: { type: "string" },
            service: { type: "string" },
            labelUrl: { type: "string" },
            isGift: { type: "boolean" },
            giftMessage: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["orderItemId", "qty"],
                properties: {
                  orderItemId: { type: "string", format: "uuid" },
                  qty: { type: "integer", minimum: 1 },
                },
              },
            },
          },
        },
        response: { 201: { description: "Shipment created" }, ...errorResponses },
      },
    },
    shipmentController.createShipment.bind(shipmentController) as any
  );

  fastify.get(
    "/shipments",
    {
      schema: {
        description: "List shipments",
        tags: ["Fulfillment"],
        summary: "List Shipments",
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            status: { type: "string" },
            carrier: { type: "string" },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 50 },
            offset: { type: "integer", minimum: 0, default: 0 },
            sortBy: {
              type: "string",
              enum: ["createdAt", "updatedAt", "shippedAt", "deliveredAt"],
              default: "createdAt",
            },
            sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        },
        response: { 200: { description: "List of shipments" }, ...errorResponses },
      },
    },
    shipmentController.listShipments.bind(shipmentController) as any
  );

  fastify.get(
    "/shipments/:shipmentId",
    {
      schema: {
        description: "Get a shipment",
        tags: ["Fulfillment"],
        summary: "Get Shipment",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId"],
          properties: { shipmentId: { type: "string", format: "uuid" } },
        },
        response: { 200: { description: "Shipment details" }, ...errorResponses },
      },
    },
    shipmentController.getShipment.bind(shipmentController) as any
  );

  fastify.patch(
    "/shipments/:shipmentId/status",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update shipment status",
        tags: ["Fulfillment"],
        summary: "Update Shipment Status",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId"],
          properties: { shipmentId: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          required: ["status"],
          properties: { status: { type: "string" } },
        },
        response: { 200: { description: "Shipment status updated" }, ...errorResponses },
      },
    },
    shipmentController.updateShipmentStatus.bind(shipmentController) as any
  );

  fastify.patch(
    "/shipments/:shipmentId/carrier",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update shipment carrier",
        tags: ["Fulfillment"],
        summary: "Update Shipment Carrier",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId"],
          properties: { shipmentId: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          required: ["carrier"],
          properties: { carrier: { type: "string", minLength: 1 } },
        },
        response: { 200: { description: "Shipment carrier updated" }, ...errorResponses },
      },
    },
    shipmentController.updateCarrier.bind(shipmentController) as any
  );

  fastify.patch(
    "/shipments/:shipmentId/service",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update shipment service",
        tags: ["Fulfillment"],
        summary: "Update Shipment Service",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId"],
          properties: { shipmentId: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          required: ["service"],
          properties: { service: { type: "string", minLength: 1 } },
        },
        response: { 200: { description: "Shipment service updated" }, ...errorResponses },
      },
    },
    shipmentController.updateService.bind(shipmentController) as any
  );

  fastify.patch(
    "/shipments/:shipmentId/label",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update shipment label URL",
        tags: ["Fulfillment"],
        summary: "Update Shipment Label",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId"],
          properties: { shipmentId: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          required: ["labelUrl"],
          properties: { labelUrl: { type: "string", minLength: 1 } },
        },
        response: { 200: { description: "Shipment label updated" }, ...errorResponses },
      },
    },
    shipmentController.updateLabelUrl.bind(shipmentController) as any
  );

  // Shipment items
  fastify.get(
    "/shipments/:shipmentId/items",
    {
      schema: {
        description: "List items for a shipment",
        tags: ["Fulfillment"],
        summary: "List Shipment Items",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId"],
          properties: { shipmentId: { type: "string", format: "uuid" } },
        },
        response: { 200: { description: "Shipment items" }, ...errorResponses },
      },
    },
    shipmentItemController.getShipmentItems.bind(shipmentItemController) as any
  );

  fastify.post(
    "/shipments/:shipmentId/items",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Add item to shipment",
        tags: ["Fulfillment"],
        summary: "Add Shipment Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId"],
          properties: { shipmentId: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          required: ["orderItemId", "qty"],
          properties: {
            orderItemId: { type: "string", format: "uuid" },
            qty: { type: "integer", minimum: 1 },
          },
        },
        response: { 201: { description: "Shipment item added" }, ...errorResponses },
      },
    },
    shipmentItemController.addShipmentItem.bind(shipmentItemController) as any
  );

  fastify.patch(
    "/shipments/:shipmentId/items/:orderItemId/qty",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update shipment item quantity",
        tags: ["Fulfillment"],
        summary: "Update Shipment Item Quantity",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId", "orderItemId"],
          properties: {
            shipmentId: { type: "string", format: "uuid" },
            orderItemId: { type: "string", format: "uuid" },
          },
        },
        body: {
          type: "object",
          required: ["qty"],
          properties: { qty: { type: "integer", minimum: 1 } },
        },
        response: { 200: { description: "Shipment item quantity updated" }, ...errorResponses },
      },
    },
    shipmentItemController.updateShipmentItemQuantity.bind(
      shipmentItemController
    ) as any
  );

  // Shipment-level gift settings
  fastify.patch(
    "/shipments/:shipmentId/gift",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Update shipment gift options (isGift, giftMessage)",
        tags: ["Fulfillment"],
        summary: "Update Shipment Gift",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId"],
          properties: { shipmentId: { type: "string", format: "uuid" } },
        },
        body: {
          type: "object",
          required: ["isGift"],
          properties: {
            isGift: { type: "boolean" },
            giftMessage: { type: "string" },
          },
        },
        response: { 200: { description: "Shipment gift updated" }, ...errorResponses },
      },
    },
    shipmentController.updateShipmentGift.bind(shipmentController) as any
  );

  fastify.delete(
    "/shipments/:shipmentId/items/:orderItemId",
    {
      preHandler: authenticateUser,
      schema: {
        description: "Delete shipment item",
        tags: ["Fulfillment"],
        summary: "Delete Shipment Item",
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          required: ["shipmentId", "orderItemId"],
          properties: {
            shipmentId: { type: "string", format: "uuid" },
            orderItemId: { type: "string", format: "uuid" },
          },
        },
        response: { 200: { description: "Shipment item deleted" }, ...errorResponses },
      },
    },
    shipmentItemController.deleteShipmentItem.bind(
      shipmentItemController
    ) as any
  );
}
