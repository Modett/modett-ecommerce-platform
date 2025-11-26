import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateProductCommand,
  CreateProductHandler,
  UpdateProductCommand,
  UpdateProductHandler,
  DeleteProductCommand,
  DeleteProductHandler,
  GetProductQuery,
  GetProductHandler,
  ListProductsQuery,
  ListProductsHandler,
  SearchProductsQuery,
  SearchProductsHandler,
} from "../../../application";
import { ProductManagementService } from "../../../application/services/product-management.service";
import { ProductSearchService } from "../../../application/services/product-search.service";
import { PrismaClient } from "@prisma/client";

interface CreateProductRequest {
  title: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status?: "draft" | "published" | "scheduled";
  publishAt?: string;
  countryOfOrigin?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryIds?: string[];
  tags?: string[];
}

interface UpdateProductRequest extends Partial<CreateProductRequest> {}

interface ProductQueryParams {
  page?: number;
  limit?: number;
  status?: "draft" | "published" | "scheduled";
  brand?: string;
  categoryId?: string;
  search?: string;
  sortBy?: "createdAt" | "title" | "publishAt";
  sortOrder?: "asc" | "desc";
}

export class ProductController {
  private createProductHandler: CreateProductHandler;
  private updateProductHandler: UpdateProductHandler;
  private deleteProductHandler: DeleteProductHandler;
  private getProductHandler: GetProductHandler;
  private listProductsHandler: ListProductsHandler;
  private searchProductsHandler: SearchProductsHandler;

  constructor(
    private readonly productManagementService: ProductManagementService,
    private readonly productSearchService: ProductSearchService,
    private readonly prisma: PrismaClient
  ) {
    // Initialize CQRS handlers
    this.createProductHandler = new CreateProductHandler(
      productManagementService
    );
    this.updateProductHandler = new UpdateProductHandler(
      productManagementService
    );
    this.deleteProductHandler = new DeleteProductHandler(
      productManagementService
    );
    this.getProductHandler = new GetProductHandler(productManagementService);
    this.listProductsHandler = new ListProductsHandler(
      productManagementService
    );
    this.searchProductsHandler = new SearchProductsHandler(
      productSearchService
    );
  }

  async listProducts(
    request: FastifyRequest<{ Querystring: ProductQueryParams }>,
    reply: FastifyReply
  ) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        brand,
        categoryId,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = request.query;

      // Handle search separately
      if (search) {
        const searchQuery: SearchProductsQuery = {
          searchTerm: search,
          page: Math.max(1, page),
          limit: Math.min(100, Math.max(1, limit)),
          categoryId,
          brand,
          status,
          sortBy:
            sortBy === "createdAt" ||
            sortBy === "title" ||
            sortBy === "publishAt"
              ? sortBy
              : "relevance",
          sortOrder,
        };

        const searchResult = await this.searchProductsHandler.handle(searchQuery);
        if (searchResult.success && searchResult.data) {
          return reply.code(200).send({
            success: true,
            data: searchResult.data,
          });
        } else {
          return reply.code(500).send({
            success: false,
            error: searchResult.error || "Search failed",
          });
        }
      }

      // Create list products query
      const query: ListProductsQuery = {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)),
        status,
        brand,
        categoryId,
        sortBy,
        sortOrder,
      };

      // Execute query using handler
      const result = await this.listProductsHandler.handle(query);

      if (result.success && result.data) {
        // Enrich products with variants and media from Prisma
        const productIds = result.data.products.map(p => p.productId);

        const enrichedProducts = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          include: {
            variants: {
              orderBy: { price: 'asc' },
              take: 10,
              include: {
                inventoryStocks: true,
              },
            },
            media: {
              include: {
                asset: true,
              },
              orderBy: { position: 'asc' },
            },
            categories: {
              include: {
                category: true,
              },
            },
          },
        });

        // Map enriched data back to products
        const productsWithDetails = result.data.products.map(product => {
          const enriched = enrichedProducts.find(p => p.id === product.productId);
          return {
            ...product,
            variants: enriched?.variants?.map(v => {
              // Calculate total inventory across all locations
              const totalInventory = v.inventoryStocks?.reduce((sum, stock) => {
                return sum + (stock.onHand - stock.reserved);
              }, 0) || 0;

              return {
                id: v.id,
                sku: v.sku,
                size: v.size,
                color: v.color,
                price: v.price.toString(),
                compareAtPrice: v.compareAtPrice?.toString(),
                inventory: totalInventory,
              };
            }) || [],
            images: enriched?.media?.map(m => ({
              url: m.asset.storageKey,
              alt: m.asset.altText,
              width: m.asset.width,
              height: m.asset.height,
            })) || [],
            categories: enriched?.categories?.map(pc => ({
              id: pc.category.id,
              name: pc.category.name,
              slug: pc.category.slug,
              position: pc.category.position,
            })) || [],
          };
        });

        return reply.code(200).send({
          success: true,
          data: {
            products: productsWithDetails,
            total: result.data.totalCount,
            page: result.data.page,
            limit: result.data.limit,
          },
        });
      } else {
        return reply.code(500).send({
          success: false,
          error: result.error || "Failed to list products",
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to list products");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve products",
      });
    }
  }

  async getProduct(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { productId } = request.params;

      if (!productId || typeof productId !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Product ID is required and must be a valid string",
        });
      }

      // Create query
      const query: GetProductQuery = {
        productId,
      };

      // Execute query using handler
      const result = await this.getProductHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      } else {
        return reply.code(404).send({
          success: false,
          error: result.error || "Product not found",
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to get product");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve product",
      });
    }
  }

  async getProductBySlug(
    request: FastifyRequest<{ Params: { slug: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { slug } = request.params;

      if (!slug || typeof slug !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Product slug is required and must be a valid string",
        });
      }

      // Create query
      const query: GetProductQuery = {
        slug,
      };

      // Execute query using handler
      const result = await this.getProductHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: result.data,
        });
      } else {
        return reply.code(404).send({
          success: false,
          error: result.error || "Product not found",
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to get product by slug");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to retrieve product",
      });
    }
  }

  async createProduct(
    request: FastifyRequest<{ Body: CreateProductRequest }>,
    reply: FastifyReply
  ) {
    try {
      const productData = request.body;

      // Basic HTTP validation
      if (
        !productData.title ||
        typeof productData.title !== "string" ||
        productData.title.trim().length === 0
      ) {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Product title is required and must be a non-empty string",
        });
      }

      // Create command
      const command: CreateProductCommand = {
        title: productData.title,
        brand: productData.brand,
        shortDesc: productData.shortDesc,
        longDescHtml: productData.longDescHtml,
        status: productData.status as any, // Cast string to ProductStatus enum
        publishAt: productData.publishAt
          ? new Date(productData.publishAt)
          : undefined,
        countryOfOrigin: productData.countryOfOrigin,
        seoTitle: productData.seoTitle,
        seoDescription: productData.seoDescription,
        categoryIds: productData.categoryIds,
        tags: productData.tags,
      };

      // Execute command using handler
      const result = await this.createProductHandler.handle(command);

      if (result.success && result.data) {
        const productData = result.data.toData();

        return reply.code(201).send({
          success: true,
          data: {
            productId: productData.id, // Map id to productId for API response
            title: productData.title,
            slug: productData.slug,
            status: productData.status,
            createdAt: new Date().toISOString(),
          },
          message: "Product created successfully",
        });
      } else {
        return reply.code(400).send({
          success: false,
          error: result.error || "Product creation failed",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to create product");
      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to create product",
      });
    }
  }

  async updateProduct(
    request: FastifyRequest<{
      Params: { productId: string };
      Body: UpdateProductRequest;
    }>,
    reply: FastifyReply
  ) {
    try {
      const { productId: id } = request.params;
      const updateData = request.body;

      if (!id || typeof id !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Product ID is required and must be a valid string",
        });
      }

      // Validate title if provided
      if (
        updateData.title !== undefined &&
        (typeof updateData.title !== "string" ||
          updateData.title.trim().length === 0)
      ) {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Product title must be a non-empty string",
        });
      }

      // Validate status if provided
      if (
        updateData.status &&
        !["draft", "published", "scheduled"].includes(updateData.status)
      ) {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Status must be one of: draft, published, scheduled",
        });
      }

      // Validate publishAt if provided
      if (updateData.publishAt) {
        const publishDate = new Date(updateData.publishAt);
        if (isNaN(publishDate.getTime())) {
          return reply.code(400).send({
            success: false,
            error: "Bad Request",
            message: "publishAt must be a valid ISO date string",
          });
        }
      }

      // Create command
      const command: UpdateProductCommand = {
        productId: id,
        title: updateData.title,
        brand: updateData.brand,
        shortDesc: updateData.shortDesc,
        longDescHtml: updateData.longDescHtml,
        status: updateData.status as any, // Cast string to ProductStatus enum
        publishAt: updateData.publishAt
          ? new Date(updateData.publishAt)
          : undefined,
        countryOfOrigin: updateData.countryOfOrigin,
        seoTitle: updateData.seoTitle,
        seoDescription: updateData.seoDescription,
        categoryIds: updateData.categoryIds,
        tags: updateData.tags,
      };

      // Execute command using handler
      const result = await this.updateProductHandler.handle(command);

      if (result.success && result.data) {
        return reply.code(200).send({
          success: true,
          data: {
            productId: id,
            updatedAt: new Date().toISOString(),
          },
          message: "Product updated successfully",
        });
      } else {
        return reply.code(404).send({
          success: false,
          error: result.error || "Product update failed",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to update product");

      if (error instanceof Error && error.message.includes("not found")) {
        return reply.code(404).send({
          success: false,
          error: "Not Found",
          message: "Product not found",
        });
      }

      if (
        error instanceof Error &&
        (error.message.includes("duplicate") ||
          error.message.includes("unique"))
      ) {
        return reply.code(409).send({
          success: false,
          error: "Conflict",
          message: "Product with this title or slug already exists",
        });
      }

      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to update product",
      });
    }
  }

  async deleteProduct(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { productId: id } = request.params;

      if (!id || typeof id !== "string") {
        return reply.code(400).send({
          success: false,
          error: "Bad Request",
          message: "Product ID is required and must be a valid string",
        });
      }

      // Create command
      const command: DeleteProductCommand = {
        productId: id,
      };

      // Execute command using handler
      const result = await this.deleteProductHandler.handle(command);

      if (result.success) {
        return reply.code(200).send({
          success: true,
          message: "Product deleted successfully",
        });
      } else {
        return reply.code(404).send({
          success: false,
          error: result.error || "Product deletion failed",
          errors: result.errors,
        });
      }
    } catch (error) {
      request.log.error(error, "Failed to delete product");

      if (error instanceof Error && error.message.includes("not found")) {
        return reply.code(404).send({
          success: false,
          error: "Not Found",
          message: "Product not found",
        });
      }

      if (
        error instanceof Error &&
        (error.message.includes("constraint") ||
          error.message.includes("foreign key"))
      ) {
        return reply.code(409).send({
          success: false,
          error: "Conflict",
          message:
            "Cannot delete product with existing variants or associations",
        });
      }

      return reply.code(500).send({
        success: false,
        error: "Internal server error",
        message: "Failed to delete product",
      });
    }
  }
}
