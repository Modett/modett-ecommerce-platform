import { apiClient } from '@/lib/api-client';

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  brand?: string;
  category?: string;
  images?: Array<{ url: string; alt?: string }>;
  variants?: Array<{
    id: string;
    size?: string;
    color?: string;
    sku: string;
    inventory: number;
  }>;
}

export interface ProductsResponse {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const productService = {
  async getProducts(params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    search?: string;
  }): Promise<ProductsResponse> {
    const { data } = await apiClient.get('/products', { params });
    // Backend wraps response in { success, data }
    const responseData = data.data || data;

    return {
      products: responseData.products.map((p: any) => ({
        id: p.productId,
        title: p.title,
        slug: p.slug,
        description: p.shortDesc,
        price: 0, // Will be updated when we add variants
        compareAtPrice: undefined,
        brand: p.brand,
        images: [],
      })),
      totalCount: responseData.total || 0,
      page: responseData.page || 1,
      pageSize: responseData.limit || 20,
    };
  },

  async getProductById(id: string): Promise<Product> {
    const { data } = await apiClient.get(`/products/${id}`);
    const responseData = data.data || data;

    return {
      id: responseData.productId,
      title: responseData.title,
      slug: responseData.slug,
      description: responseData.shortDesc,
      price: 0,
      brand: responseData.brand,
      images: [],
    };
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const { data } = await apiClient.get(`/products/slug/${slug}`);
    const responseData = data.data || data;

    return {
      id: responseData.productId,
      title: responseData.title,
      slug: responseData.slug,
      description: responseData.shortDesc,
      price: 0,
      brand: responseData.brand,
      images: [],
    };
  },

  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const { data } = await apiClient.get('/products', {
      params: { limit, page: 1 },
    });

    // Backend wraps response in { success, data: { products, total, page, limit } }
    const responseData = data.data || data;
    const products = responseData.products || [];

    return products.map((p: any) => {
      // Get the lowest price variant
      const lowestPriceVariant = p.variants?.sort(
        (a: any, b: any) => parseFloat(a.price) - parseFloat(b.price)
      )[0];

      return {
        id: p.productId,
        title: p.title,
        slug: p.slug,
        description: p.shortDesc,
        price: lowestPriceVariant ? parseFloat(lowestPriceVariant.price) : 0,
        compareAtPrice: lowestPriceVariant?.compareAtPrice
          ? parseFloat(lowestPriceVariant.compareAtPrice)
          : undefined,
        brand: p.brand,
        images: p.images || [],
        variants: p.variants || [],
      };
    });
  },
};
