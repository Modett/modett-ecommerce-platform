import { apiClient } from "@/lib/api-client";

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
  images?: Array<{ url: string; alt?: string }>;
  variants?: Array<{
    id: string;
    size?: string;
    color?: string;
    sku: string;
    inventory: number;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    position?: number;
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
    sort?: string;
  }): Promise<ProductsResponse> {
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
      // For price sorting, we fetch more items to sort in memory since backend doesn't support it
      apiParams.limit = 100;
      delete apiParams.sortBy;
      delete apiParams.sortOrder;
    }

    const { data } = await apiClient.get("/products", { params: apiParams });
    // Backend wraps response in { success, data }
    const responseData = data.data || data;

    let products = responseData.products.map((p: any) => {
      const lowestPriceVariant = p.variants?.sort(
        (a: any, b: any) => parseFloat(a.price) - parseFloat(b.price)
      )[0];

      return {
        id: p.productId,
        productId: p.productId,
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
        categories: p.categories || [],
      };
    });

    // Apply client-side sorting for price
    if (isPriceSort) {
      products.sort((a: any, b: any) => {
        if (sort === "price_asc") {
          return a.price - b.price;
        } else {
          return b.price - a.price;
        }
      });
    }

    return {
      products,
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
      productId: responseData.productId,
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
      productId: responseData.productId,
      title: responseData.title,
      slug: responseData.slug,
      description: responseData.shortDesc,
      price: 0,
      brand: responseData.brand,
      images: [],
    };
  },

  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const { data } = await apiClient.get("/products", {
      params: { limit, page: 1 },
    });

    const responseData = data.data || data;
    const products = responseData.products || [];

    return products.map((p: any) => {
      const lowestPriceVariant = p.variants?.sort(
        (a: any, b: any) => parseFloat(a.price) - parseFloat(b.price)
      )[0];

      return {
        id: p.productId,
        productId: p.productId,
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

  async getCategories(): Promise<
    Array<{ id: string; name: string; slug: string; position?: number }>
  > {
    const { data } = await apiClient.get("/categories");
    const responseData = data.data || data;
    return responseData.map((c: any) => ({
      id: c.categoryId || c.id,
      name: c.name,
      slug: c.slug,
      position: c.position,
    }));
  },

  async getSizeCounts(): Promise<Array<{ id: string; count: number }>> {
    const { data } = await apiClient.get("/products", {
      params: { limit: 100, page: 1 },
    });

    const responseData = data.data || data;
    const products = responseData.products || [];

    const sizeCounts: Record<string, number> = {};
    products.forEach((product: any) => {
      product.variants?.forEach((variant: any) => {
        if (variant.size && variant.inventory > 0) {
          sizeCounts[variant.size] = (sizeCounts[variant.size] || 0) + 1;
        }
      });
    });

    return Object.entries(sizeCounts)
      .map(([size, count]) => ({ id: size, count }))
      .sort((a, b) => {
        const numA = parseInt(a.id);
        const numB = parseInt(b.id);
        // If both are valid numbers, sort numerically
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }

        return a.id.localeCompare(b.id);
      });
  },

  async getColorCounts(): Promise<Array<{ id: string; count: number }>> {
    const { data } = await apiClient.get("/products", {
      params: { limit: 100, page: 1 },
    });

    const responseData = data.data || data;
    const products = responseData.products || [];

    const colorCounts: Record<string, number> = {};
    products.forEach((product: any) => {
      product.variants?.forEach((variant: any) => {
        if (variant.color && variant.inventory > 0) {
          colorCounts[variant.color] = (colorCounts[variant.color] || 0) + 1;
        }
      });
    });

    return Object.entries(colorCounts)
      .map(([color, count]) => ({ id: color, count }))
      .sort((a, b) => a.id.localeCompare(b.id));
  },
};
