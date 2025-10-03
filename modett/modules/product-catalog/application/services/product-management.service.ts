import {
  IProductRepository,
  ProductQueryOptions,
} from "../../domain/repositories/product.repository";
import {
  Product,
  CreateProductData,
} from "../../domain/entities/product.entity";
import { ProductId } from "../../domain/value-objects/product-id.vo";
import { Slug } from "../../domain/value-objects/slug.vo";

export class ProductManagementService {
  constructor(private readonly productRepository: IProductRepository) {}

  async createProduct(data: CreateProductData): Promise<Product> {
    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Product title is required");
    }

    // Create the product entity
    const product = Product.create(data);

    // Check if slug already exists
    const existingProduct = await this.productRepository.existsBySlug(
      product.getSlug()
    );
    if (existingProduct) {
      throw new Error(
        `Product with slug '${product.getSlug().getValue()}' already exists`
      );
    }

    // Save the product
    await this.productRepository.save(product);

    // Handle categoryIds - create associations
    if (data.categoryIds && data.categoryIds.length > 0) {
      for (const categoryId of data.categoryIds) {
        await this.productRepository.addToCategory(product.getId().getValue(), categoryId);
      }
    }

    // TODO: Handle tags - requires tag association service
    if (data.tags && data.tags.length > 0) {
      // This would require implementing tag association logic
      // For now, we'll log it as a TODO
      console.warn("Tag association not yet implemented for product creation");
    }

    return product;
  }

  async getProductById(id: string): Promise<Product | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Product ID is required");
    }

    try {
      const productId = ProductId.fromString(id);
      return await this.productRepository.findById(productId);
    } catch (error) {
      if (error instanceof Error && error.message.includes("valid UUID")) {
        throw new Error("Invalid product ID format");
      }
      throw error;
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!slug || slug.trim().length === 0) {
      throw new Error("Product slug is required");
    }

    try {
      const productSlug = Slug.fromString(slug.trim());
      return await this.productRepository.findBySlug(productSlug);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("lowercase letters, numbers, and hyphens")
      ) {
        throw new Error("Invalid slug format");
      }
      throw error;
    }
  }

  async getAllProducts(
    options?: ProductQueryOptions & {
      page?: number;
      limit?: number;
      categoryId?: string;
      brand?: string;
      status?: string;
    }
  ): Promise<{ items: Product[]; totalCount: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      includeDrafts = true,
      categoryId,
      brand,
      status,
    } = options || {};

    const offset = (page - 1) * limit;

    let products: Product[];
    let totalCount: number;

    // Handle different filtering scenarios
    if (categoryId) {
      // Filter by category
      const queryOptions: ProductQueryOptions = {
        limit,
        offset,
        sortBy,
        sortOrder,
        includeDrafts: status === "draft" || includeDrafts,
      };

      products = await this.productRepository.findByCategory(
        categoryId,
        queryOptions
      );
      totalCount = await this.productRepository.count({ categoryId });
    } else if (brand) {
      // Filter by brand
      const queryOptions: ProductQueryOptions = {
        limit,
        offset,
        sortBy,
        sortOrder,
        includeDrafts: status === "draft" || includeDrafts,
      };

      products = await this.productRepository.findByBrand(brand, queryOptions);
      totalCount = await this.productRepository.count({ brand });
    } else if (status) {
      // Filter by status
      const queryOptions: ProductQueryOptions = {
        limit,
        offset,
        sortBy,
        sortOrder,
      };

      products = await this.productRepository.findByStatus(
        status,
        queryOptions
      );
      totalCount = await this.productRepository.count({ status });
    } else {
      // No specific filtering - get all products
      const queryOptions: ProductQueryOptions = {
        limit,
        offset,
        sortBy,
        sortOrder,
        includeDrafts,
      };

      products = await this.productRepository.findAll(queryOptions);
      totalCount = await this.productRepository.count({});
    }

    return {
      items: products, // Array of Product entities
      totalCount,
    };
  }

  async getProductsByStatus(
    status: string,
    options?: ProductQueryOptions
  ): Promise<Product[]> {
    if (!status || status.trim().length === 0) {
      throw new Error("Status is required");
    }

    const validStatuses = ["draft", "published", "scheduled"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status must be one of: ${validStatuses.join(", ")}`);
    }

    return await this.productRepository.findByStatus(status, options);
  }

  async getProductsByBrand(
    brand: string,
    options?: ProductQueryOptions
  ): Promise<Product[]> {
    if (!brand || brand.trim().length === 0) {
      throw new Error("Brand is required");
    }

    return await this.productRepository.findByBrand(brand.trim(), options);
  }

  async getProductsByCategory(
    categoryId: string,
    options?: ProductQueryOptions
  ): Promise<Product[]> {
    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error("Category ID is required");
    }

    return await this.productRepository.findByCategory(categoryId, options);
  }

  async updateProduct(
    id: string,
    data: Partial<CreateProductData>
  ): Promise<Product | null> {
    if (!id || id.trim().length === 0) {
      throw new Error("Product ID is required");
    }

    const product = await this.getProductById(id);
    if (!product) {
      return null;
    }

    // Update fields if provided
    if (data.title !== undefined) {
      product.updateTitle(data.title);
    }

    if (data.brand !== undefined) {
      product.updateBrand(data.brand);
    }

    if (data.shortDesc !== undefined) {
      product.updateShortDesc(data.shortDesc);
    }

    if (data.longDescHtml !== undefined) {
      product.updateLongDescHtml(data.longDescHtml);
    }

    if (data.countryOfOrigin !== undefined) {
      product.updateCountryOfOrigin(data.countryOfOrigin);
    }

    if (data.seoTitle !== undefined || data.seoDescription !== undefined) {
      product.updateSeoInfo(data.seoTitle || null, data.seoDescription || null);
    }

    if (data.status !== undefined) {
      switch (data.status) {
        case "published":
          product.publish();
          break;
        case "draft":
          product.unpublish();
          break;
        case "scheduled":
          if (data.publishAt) {
            product.schedulePublication(data.publishAt);
          }
          break;
      }
    }

    // TODO: Handle categoryIds - requires category association service
    if (data.categoryIds !== undefined) {
      // This would require implementing category association logic
      // For now, we'll log it as a TODO
      console.warn(
        "Category association not yet implemented for product updates"
      );
    }

    // TODO: Handle tags - requires tag association service
    if (data.tags !== undefined) {
      // This would require implementing tag association logic
      // For now, we'll log it as a TODO
      console.warn("Tag association not yet implemented for product updates");
    }

    // Save the updated product
    await this.productRepository.update(product);

    return product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error("Product ID is required");
    }

    const product = await this.getProductById(id);
    if (!product) {
      return false;
    }

    try {
      const productId = ProductId.fromString(id);
      await this.productRepository.delete(productId);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes("constraint")) {
        throw new Error(
          "Cannot delete product: it has associated variants or other dependencies"
        );
      }
      throw error;
    }
  }
}
