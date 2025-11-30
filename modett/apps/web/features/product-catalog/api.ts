// ============================================================================
// PRODUCT CATALOG API
// ============================================================================

import { apiClient } from "@/lib/api-client";
import type {
  Product,
  ProductsResponse,
  GetProductsParams,
  ProductCategory,
  CountItem,
} from "./types";
import {
  transformProduct,
  sortProductsByPrice,
  calculateSizeCounts,
  calculateColorCounts,
} from "./utils";

/**
 * Get products with filtering, sorting, and pagination
 */
export const getProducts = async (
  params?: GetProductsParams
): Promise<ProductsResponse> => {
  const { page = 1, pageSize = 20, sort } = params || {};

  // Prepare API params
  const apiParams: any = {
    page,
    limit: pageSize,
    ...params,
  };

  // Handle sorting logic
  let isPriceSort = false;
  if (sort === "newest") {
    apiParams.sortBy = "createdAt";
    apiParams.sortOrder = "desc";
  } else if (sort === "price_asc" || sort === "price_desc") {
    isPriceSort = true;
    // For price sorting, fetch more items to sort in memory since backend doesn't support it
    apiParams.limit = 100;
    delete apiParams.sortBy;
    delete apiParams.sortOrder;
  }

  const { data } = await apiClient.get("/products", { params: apiParams });
  // Backend wraps response in { success, data }
  const responseData = data.data || data;

  let products = responseData.products.map(transformProduct);

  // Apply client-side sorting for price
  if (isPriceSort) {
    const direction = sort === "price_asc" ? "asc" : "desc";
    products = sortProductsByPrice(products, direction);
  }

  return {
    products,
    totalCount: responseData.total || 0,
    page: responseData.page || 1,
    pageSize: responseData.limit || 20,
  };
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get(`/products/${id}`);
  const responseData = data.data || data;

  return {
    id: responseData.productId,
    productId: responseData.productId,
    title: responseData.title,
    slug: responseData.slug,
    description: responseData.shortDesc,
    price: 0,
    brand: responseData.brand,
    images: [],
  };
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (slug: string): Promise<Product> => {
  const { data } = await apiClient.get(`/products/slug/${slug}`);
  const responseData = data.data || data;

  return transformProduct(responseData);
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (
  limit: number = 6
): Promise<Product[]> => {
  const { data } = await apiClient.get("/products", {
    params: { limit, page: 1 },
  });

  const responseData = data.data || data;
  const products = responseData.products || [];

  return products.map(transformProduct);
};

/**
 * Get product categories
 */
export const getCategories = async (): Promise<ProductCategory[]> => {
  const { data } = await apiClient.get("/categories");
  const responseData = data.data || data;

  return responseData.map((c: any) => ({
    id: c.categoryId || c.id,
    name: c.name,
    slug: c.slug,
    position: c.position,
  }));
};

/**
 * Get size counts across all products
 */
export const getSizeCounts = async (): Promise<CountItem[]> => {
  const { data } = await apiClient.get("/products", {
    params: { limit: 100, page: 1 },
  });

  const responseData = data.data || data;
  const products = responseData.products || [];

  return calculateSizeCounts(products);
};

/**
 * Get color counts across all products
 */
export const getColorCounts = async (): Promise<CountItem[]> => {
  const { data } = await apiClient.get("/products", {
    params: { limit: 100, page: 1 },
  });

  const responseData = data.data || data;
  const products = responseData.products || [];

  return calculateColorCounts(products);
};
