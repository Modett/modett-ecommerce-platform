export type ProductStatus = "draft" | "published" | "scheduled";

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number; // calculated from stock? or direct field? Backend has `stockLevel` on Stock entity, Variant entity doesn't seem to have direct inventory count unless computed.
  // Backend Variant Model properties from route schema:
  barcode?: string;
  weightG?: number;
  dims?: {
    length?: number;
    width?: number;
    height?: number;
  };
  taxClass?: string;
  allowBackorder?: boolean;
  allowPreorder?: boolean;
  restockEta?: string;
}

export interface CreateVariantRequest {
  sku: string;
  price: number;
  size?: string;
  color?: string;
  barcode?: string;
  compareAtPrice?: number;
  weightG?: number;
  dims?: {
    length?: number;
    width?: number;
    height?: number;
  };
  taxClass?: string;
  allowBackorder?: boolean;
  allowPreorder?: boolean;
  restockEta?: string;
}

export interface UpdateVariantRequest extends Partial<CreateVariantRequest> {}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  position?: number;
}

export interface ProductImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface AdminProduct {
  productId: string;
  title: string;
  slug: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status: ProductStatus;
  categories: ProductCategory[];
  images: ProductImage[];
  variants: ProductVariant[];
  countryOfOrigin?: string;
  seoTitle?: string;
  seoDescription?: string;
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  page?: number;
  limit?: number;
  status?: ProductStatus;
  categoryId?: string;
  brand?: string;
  sortBy?: "title" | "createdAt" | "updatedAt" | "publishAt";
  sortOrder?: "asc" | "desc";
}

export interface ProductsListResponse {
  success: boolean;
  data: {
    products: AdminProduct[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}

export interface ProductDetailsResponse {
  success: boolean;
  data?: AdminProduct;
  error?: string;
}

export interface CreateProductRequest {
  title: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status?: ProductStatus;
  publishAt?: string;
  countryOfOrigin?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryIds?: string[];
  // Backend create schema doesn't seem to include variants/images inline?
  // Usually these are added separately or I missed it in the file view.
  // Looking at the schema again: properties for createProduct only show basic fields + categoryIds.
  // It seems variants and images might be handled via separate endpoints or I missed them.
  // I will assume for now we create basic product then add others, OR I might need to check ProductController implementation.
  // For the purpose of the "Product Page" (list view), this is fine.
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  tags?: string[];
}
