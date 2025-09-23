import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductManagementService } from '../../../application/services/product-management.service';
import { ProductSearchService } from '../../../application/services/product-search.service';

interface CreateProductRequest {
  title: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status?: 'draft' | 'published' | 'scheduled';
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
  status?: 'draft' | 'published' | 'scheduled';
  brand?: string;
  categoryId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'publishAt';
  sortOrder?: 'asc' | 'desc';
}

export class ProductController {
  constructor(
    private readonly productManagementService: ProductManagementService,
    private readonly productSearchService: ProductSearchService
  ) {}

  async getProducts(request: FastifyRequest<{ Querystring: ProductQueryParams }>, reply: FastifyReply) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        brand,
        categoryId,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = request.query;

      const options = {
        page: Math.max(1, page),
        limit: Math.min(100, Math.max(1, limit)),
        sortBy,
        sortOrder
      };

      let products;

      if (search) {
        products = await this.productSearchService.searchProducts(search, options);
      } else if (status) {
        products = await this.productManagementService.getProductsByStatus(status, options);
      } else if (brand) {
        products = await this.productManagementService.getProductsByBrand(brand, options);
      } else if (categoryId) {
        products = await this.productManagementService.getProductsByCategory(categoryId, options);
      } else {
        products = await this.productManagementService.getAllProducts(options);
      }

      return reply.code(200).send({
        success: true,
        data: products,
        meta: {
          page: options.page,
          limit: options.limit,
          sortBy: options.sortBy,
          sortOrder: options.sortOrder
        }
      });
    } catch (error) {
      request.log.error(error, 'Failed to get products');
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve products'
      });
    }
  }

  async getProduct(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;

      if (!id || typeof id !== 'string') {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Product ID is required and must be a valid string'
        });
      }

      const product = await this.productManagementService.getProductById(id);

      if (!product) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Product not found'
        });
      }

      return reply.code(200).send({
        success: true,
        data: product
      });
    } catch (error) {
      request.log.error(error, 'Failed to get product');
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve product'
      });
    }
  }

  async getProductBySlug(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    try {
      const { slug } = request.params;

      if (!slug || typeof slug !== 'string') {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Product slug is required and must be a valid string'
        });
      }

      const product = await this.productManagementService.getProductBySlug(slug);

      if (!product) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Product not found'
        });
      }

      return reply.code(200).send({
        success: true,
        data: product
      });
    } catch (error) {
      request.log.error(error, 'Failed to get product by slug');
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve product'
      });
    }
  }

  async createProduct(request: FastifyRequest<{ Body: CreateProductRequest }>, reply: FastifyReply) {
    try {
      const productData = request.body;

      // Basic validation
      if (!productData.title || typeof productData.title !== 'string' || productData.title.trim().length === 0) {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Product title is required and must be a non-empty string'
        });
      }

      // Validate status if provided
      if (productData.status && !['draft', 'published', 'scheduled'].includes(productData.status)) {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Status must be one of: draft, published, scheduled'
        });
      }

      // Validate publishAt if provided
      if (productData.publishAt) {
        const publishDate = new Date(productData.publishAt);
        if (isNaN(publishDate.getTime())) {
          return reply.code(400).send({
            success: false,
            error: 'Bad Request',
            message: 'publishAt must be a valid ISO date string'
          });
        }
      }

      const product = await this.productManagementService.createProduct(productData);

      return reply.code(201).send({
        success: true,
        data: product,
        message: 'Product created successfully'
      });
    } catch (error) {
      request.log.error(error, 'Failed to create product');

      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return reply.code(409).send({
          success: false,
          error: 'Conflict',
          message: 'Product with this title or slug already exists'
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to create product'
      });
    }
  }

  async updateProduct(request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductRequest }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const updateData = request.body;

      if (!id || typeof id !== 'string') {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Product ID is required and must be a valid string'
        });
      }

      // Validate title if provided
      if (updateData.title !== undefined && (typeof updateData.title !== 'string' || updateData.title.trim().length === 0)) {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Product title must be a non-empty string'
        });
      }

      // Validate status if provided
      if (updateData.status && !['draft', 'published', 'scheduled'].includes(updateData.status)) {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Status must be one of: draft, published, scheduled'
        });
      }

      // Validate publishAt if provided
      if (updateData.publishAt) {
        const publishDate = new Date(updateData.publishAt);
        if (isNaN(publishDate.getTime())) {
          return reply.code(400).send({
            success: false,
            error: 'Bad Request',
            message: 'publishAt must be a valid ISO date string'
          });
        }
      }

      const product = await this.productManagementService.updateProduct(id, updateData);

      if (!product) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Product not found'
        });
      }

      return reply.code(200).send({
        success: true,
        data: product,
        message: 'Product updated successfully'
      });
    } catch (error) {
      request.log.error(error, 'Failed to update product');

      if (error.message.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Product not found'
        });
      }

      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return reply.code(409).send({
          success: false,
          error: 'Conflict',
          message: 'Product with this title or slug already exists'
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update product'
      });
    }
  }

  async deleteProduct(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;

      if (!id || typeof id !== 'string') {
        return reply.code(400).send({
          success: false,
          error: 'Bad Request',
          message: 'Product ID is required and must be a valid string'
        });
      }

      const deleted = await this.productManagementService.deleteProduct(id);

      if (!deleted) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Product not found'
        });
      }

      return reply.code(200).send({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      request.log.error(error, 'Failed to delete product');

      if (error.message.includes('not found')) {
        return reply.code(404).send({
          success: false,
          error: 'Not Found',
          message: 'Product not found'
        });
      }

      if (error.message.includes('constraint') || error.message.includes('foreign key')) {
        return reply.code(409).send({
          success: false,
          error: 'Conflict',
          message: 'Cannot delete product with existing variants or associations'
        });
      }

      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete product'
      });
    }
  }
}