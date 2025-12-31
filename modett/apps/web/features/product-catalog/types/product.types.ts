// ============================================================================
// PRODUCT CATALOG TYPES
// ============================================================================

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  sku: string;
  inventory: number;
  price?: string;
  compareAtPrice?: string;
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  position?: number;
}

export interface Product {
  id: string;
  productId: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  brand?: string;
  category?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  categories?: ProductCategory[];
}

export interface ProductsResponse {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetProductsParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  sort?: string;
}

export interface CountItem {
  id: string;
  count: number;
}
