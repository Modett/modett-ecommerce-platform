// ============================================================================
// ADMIN PRODUCTS API
// ============================================================================

import axios from "axios";
import type {
  ProductFilters,
  ProductsListResponse,
  ProductDetailsResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductCategory,
  CreateVariantRequest,
  UpdateVariantRequest,
  ProductVariant,
} from "../types/product.types";

// Create axios instance for admin API
const adminApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Add auth token interceptor
adminApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get all products with filters and pagination (Admin only)
 */
export const getProducts = async (
  filters: ProductFilters = {},
): Promise<ProductsListResponse> => {
  try {
    const { data } = await adminApiClient.get("/catalog/products", {
      params: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        status: filters.status,
        categoryId: filters.categoryId,
        brand: filters.brand,
        sortBy: filters.sortBy || "createdAt",
        sortOrder: filters.sortOrder || "desc",
        search: filters.search,
      },
    });

    return data;
  } catch (error: any) {
    console.error("Get products error:", error);
    return {
      success: false,
      data: {
        products: [],
        total: 0,
        page: 1,
        limit: 20,
      },
      error: error.response?.data?.error || "Failed to fetch products",
    };
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (
  productId: string,
): Promise<ProductDetailsResponse> => {
  try {
    const { data } = await adminApiClient.get(`/catalog/products/${productId}`);
    return data;
  } catch (error: any) {
    console.error("Get product by ID error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to fetch product details",
    };
  }
};

/**
 * Create new product
 */
export const createProduct = async (
  productData: CreateProductRequest,
): Promise<ProductDetailsResponse> => {
  try {
    const { data } = await adminApiClient.post(
      "/catalog/products",
      productData,
    );
    return data;
  } catch (error: any) {
    console.error("Create product error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to create product",
    };
  }
};

/**
 * Update product
 */
export const updateProduct = async (
  productId: string,
  productData: UpdateProductRequest,
): Promise<ProductDetailsResponse> => {
  try {
    const { data } = await adminApiClient.put(
      `/catalog/products/${productId}`,
      productData,
    );
    return data;
  } catch (error: any) {
    console.error("Update product error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update product",
    };
  }
};

/**
 * Delete product
 */
export const deleteProduct = async (
  productId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data } = await adminApiClient.delete(
      `/catalog/products/${productId}`,
    );
    return data;
  } catch (error: any) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to delete product",
    };
  }
};

/**
 * Get categories list
 */
export const getCategories = async (): Promise<{
  success: boolean;
  data: ProductCategory[];
  error?: string;
}> => {
  try {
    const { data } = await adminApiClient.get("/catalog/categories?limit=100");
    return {
      success: true,
      data: data.data || [],
    };
  } catch (error: any) {
    console.error("Get categories error:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.error || "Failed to fetch categories",
    };
  }
};

/**
 * Get variants for a product
 */
export const getVariants = async (
  productId: string,
  params: any = {},
): Promise<{ success: boolean; data: ProductVariant[]; error?: string }> => {
  try {
    const { data } = await adminApiClient.get(
      `/catalog/products/${productId}/variants`,
      { params },
    );
    return data;
  } catch (error: any) {
    console.error("Get variants error:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.error || "Failed to fetch variants",
    };
  }
};

/**
 * Create a new variant
 */
export const createVariant = async (
  productId: string,
  variantData: CreateVariantRequest,
): Promise<{ success: boolean; data?: ProductVariant; error?: string }> => {
  try {
    const { data } = await adminApiClient.post(
      `/catalog/products/${productId}/variants`,
      variantData,
    );
    return data;
  } catch (error: any) {
    console.error("Create variant error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to create variant",
    };
  }
};

/**
 * Update a variant
 */
export const updateVariant = async (
  variantId: string,
  variantData: UpdateVariantRequest,
): Promise<{ success: boolean; data?: ProductVariant; error?: string }> => {
  try {
    const { data } = await adminApiClient.put(
      `/catalog/variants/${variantId}`,
      variantData,
    );
    return data;
  } catch (error: any) {
    console.error("Update variant error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update variant",
    };
  }
};

/**
 * Delete a variant
 */
export const deleteVariant = async (
  variantId: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data } = await adminApiClient.delete(
      `/catalog/variants/${variantId}`,
    );
    return data;
  } catch (error: any) {
    console.error("Delete variant error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to delete variant",
    };
  }
};
