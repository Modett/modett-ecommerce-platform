import { api } from '../lib/fetcher';
import { API_ENDPOINTS } from '../lib/config';
import type {
  Product,
  ProductVariant,
  Category,
  PaginatedResponse,
} from '../types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: 'draft' | 'published' | 'scheduled';
  search?: string;
}

export interface GetVariantsParams {
  page?: number;
  limit?: number;
  productId?: string;
  color?: string;
  size?: string;
  inStock?: boolean;
}

export const productService = {
  /**
   * Get all products with optional filtering
   */
  async getProducts(params?: GetProductsParams): Promise<PaginatedResponse<Product>> {
    return api.get<PaginatedResponse<Product>>(API_ENDPOINTS.products, {
      params: params as any,
    });
  },

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product> {
    return api.get<Product>(API_ENDPOINTS.productById(id));
  },

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    return api.get<Product>(API_ENDPOINTS.productBySlug(slug));
  },

  /**
   * Get product variants by product ID
   */
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return api.get<ProductVariant[]>(API_ENDPOINTS.productVariants(productId));
  },

  /**
   * Get all variants with optional filtering
   */
  async getVariants(params?: GetVariantsParams): Promise<PaginatedResponse<ProductVariant>> {
    return api.get<PaginatedResponse<ProductVariant>>(API_ENDPOINTS.variants, {
      params: params as any,
    });
  },

  /**
   * Get variant by ID
   */
  async getVariantById(id: string): Promise<ProductVariant> {
    return api.get<ProductVariant>(API_ENDPOINTS.variantById(id));
  },

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    return api.get<Category[]>(API_ENDPOINTS.categories);
  },

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    return api.get<Category>(API_ENDPOINTS.categoryById(id));
  },

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    return api.get<Category>(API_ENDPOINTS.categoryBySlug(slug));
  },

  /**
   * Get products in a category
   */
  async getCategoryProducts(categoryId: string, params?: GetProductsParams): Promise<PaginatedResponse<Product>> {
    return api.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.categoryProducts(categoryId),
      { params: params as any }
    );
  },
};
