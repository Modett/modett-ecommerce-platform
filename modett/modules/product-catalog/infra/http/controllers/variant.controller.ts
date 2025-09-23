import { FastifyRequest, FastifyReply } from "fastify";
import { VariantManagementService } from "../../../application/services/variant-management.service";

interface CreateVariantRequest {
  sku: string;
  size?: string;
  color?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  weightG?: number;
  dims?: Record<string, any>;
  taxClass?: string;
  allowBackorder?: boolean;
  allowPreorder?: boolean;
  restockEta?: string;
}

interface UpdateVariantRequest extends Partial<CreateVariantRequest> {}

interface VariantQueryParams {
  page?: number;
  limit?: number;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: "price" | "sku" | "createdAt" | "size" | "color";
  sortOrder?: "asc" | "desc";
}

export class VariantController {
  constructor(
    private readonly variantManagementService: VariantManagementService
  ) {}

  async getVariants(
    request: FastifyRequest<{
      Params: { productId: string };
      Querystring: VariantQueryParams;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { productId } = request.params;
      const {
        page = 1,
        limit = 20,
        size,
        color,
        minPrice,
        maxPrice,
        inStock,
        sortBy = "price",
        sortOrder = "asc",
      } = request.query;

      if (!productId || typeof productId !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Product ID is required and must be a valid string",
        });
      }

      const options = {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)),
        size,
        color,
        minPrice,
        maxPrice,
        inStock,
        sortBy,
        sortOrder,
      };

      const variants = await this.variantManagementService.getVariantsByProduct(
        productId,
        options
      );

      return reply.code(200).send({
        success: true,
        data: variants,
        meta: {
          productId,
          page: options.page,
          limit: options.limit,
          filters: {
            size,
            color,
            minPrice,
            maxPrice,
            inStock,
          },
        },
      });
    } catch (error) {
      request.log.error(error, "Failed to get variants");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve variants",
      });
    }
  }

  async getVariant(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      if (!id || typeof id !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Variant ID is required and must be a valid string",
        });
      }

      const variant = await this.variantManagementService.getVariantById(id);

      if (!variant) {
        return reply.code(404).send({
          success: false,
          error: "Not Found",
          message: "Variant not found",
        });
      }

      return reply.code(200).send({
        success: true,
        data: variant,
      });
    } catch (error) {
      request.log.error(error, "Failed to get variant");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve variant",
      });
    }
  }

  async createVariant(
    request: FastifyRequest<{
      Params: { productId: string };
      Body: CreateVariantRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { productId } = request.params;
      const variantData = request.body;

      if (!productId || typeof productId !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Product ID is required and must be a valid string",
        });
      }

      // Basic validation
      if (
        !variantData.sku ||
        typeof variantData.sku !== "string" ||
        variantData.sku.trim().length === 0
      ) {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "SKU is required and must be a non-empty string",
        });
      }

      if (typeof variantData.price !== "number" || variantData.price < 0) {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Price is required and must be a non-negative number",
        });
      }

      const createData = {
        ...variantData,
        restockEta: variantData.restockEta ? new Date(variantData.restockEta) : undefined,
      };

      const variant = await this.variantManagementService.createVariant(
        productId,
        createData
      );

      return reply.code(201).send({
        success: true,
        data: variant,
        message: "Variant created successfully",
      });
    } catch (error) {
      request.log.error(error, "Failed to create variant");

      if (
        error instanceof Error &&
        (error.message.includes("duplicate") ||
          error.message.includes("unique"))
      ) {
        return reply.code(409).send({
          success: false,
          error: "Conflict",
          message: "Variant with this SKU already exists",
        });
      }

      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to create variant",
      });
    }
  }

  async updateVariant(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateVariantRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updateData = request.body;

      if (!id || typeof id !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Variant ID is required and must be a valid string",
        });
      }

      const updatePayload = {
        ...updateData,
        restockEta: updateData.restockEta ? new Date(updateData.restockEta) : undefined,
      };

      const variant = await this.variantManagementService.updateVariant(
        id,
        updatePayload
      );

      if (!variant) {
        return reply.code(404).send({
          success: false,
          error: "Not Found",
          message: "Variant not found",
        });
      }

      return reply.code(200).send({
        success: true,
        data: variant,
        message: "Variant updated successfully",
      });
    } catch (error) {
      request.log.error(error, "Failed to update variant");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to update variant",
      });
    }
  }

  async deleteVariant(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      if (!id || typeof id !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Variant ID is required and must be a valid string",
        });
      }

      const deleted = await this.variantManagementService.deleteVariant(id);

      if (!deleted) {
        return reply.code(404).send({
          success: false,
          error: "Not Found",
          message: "Variant not found",
        });
      }

      return reply.code(200).send({
        success: true,
        message: "Variant deleted successfully",
      });
    } catch (error) {
      request.log.error(error, "Failed to delete variant");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to delete variant",
      });
    }
  }
}
