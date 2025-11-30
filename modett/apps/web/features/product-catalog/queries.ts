// ============================================================================
// PRODUCT CATALOG REACT QUERY HOOKS
// ============================================================================

import { useQuery } from "@tanstack/react-query";
import * as productApi from "./api";
import type { GetProductsParams } from "./types";

/**
 * Query key factory for product queries
 */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: GetProductsParams) => [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  detailBySlug: (slug: string) => [...productKeys.details(), "slug", slug] as const,
  featured: (limit: number) => [...productKeys.all, "featured", limit] as const,
  categories: () => [...productKeys.all, "categories"] as const,
  sizeCounts: () => [...productKeys.all, "sizeCounts"] as const,
  colorCounts: () => [...productKeys.all, "colorCounts"] as const,
};

/**
 * Hook to fetch products with filtering, sorting, and pagination
 */
export const useProducts = (params?: GetProductsParams) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.getProducts(params),
  });
};

/**
 * Hook to fetch product by ID
 */
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch product by slug
 */
export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: productKeys.detailBySlug(slug),
    queryFn: () => productApi.getProductBySlug(slug),
    enabled: !!slug,
  });
};

/**
 * Hook to fetch featured products
 */
export const useFeaturedProducts = (limit: number = 6) => {
  return useQuery({
    queryKey: productKeys.featured(limit),
    queryFn: () => productApi.getFeaturedProducts(limit),
  });
};

/**
 * Hook to fetch product categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => productApi.getCategories(),
  });
};

/**
 * Hook to fetch size counts
 */
export const useSizeCounts = () => {
  return useQuery({
    queryKey: productKeys.sizeCounts(),
    queryFn: () => productApi.getSizeCounts(),
  });
};

/**
 * Hook to fetch color counts
 */
export const useColorCounts = () => {
  return useQuery({
    queryKey: productKeys.colorCounts(),
    queryFn: () => productApi.getColorCounts(),
  });
};
