export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  apiVersion: 'v1',
} as const;

export const API_ENDPOINTS = {
  // Products
  products: '/v1/catalog/products',
  productById: (id: string) => `/v1/catalog/products/${id}`,
  productBySlug: (slug: string) => `/v1/catalog/products/slug/${slug}`,
  productVariants: (productId: string) => `/v1/catalog/products/${productId}/variants`,

  // Categories
  categories: '/v1/catalog/categories',
  categoryById: (id: string) => `/v1/catalog/categories/${id}`,
  categoryBySlug: (slug: string) => `/v1/catalog/categories/slug/${slug}`,
  categoryProducts: (categoryId: string) => `/v1/catalog/categories/${categoryId}/products`,

  // Variants
  variants: '/v1/catalog/variants',
  variantById: (id: string) => `/v1/catalog/variants/${id}`,

  // Cart
  cart: '/v1/cart',
  cartById: (id: string) => `/v1/cart/${id}`,
  userCart: (userId: string) => `/v1/cart/user/${userId}`,
  guestCart: (token: string) => `/v1/cart/guest/${token}`,
  cartItems: (cartId: string) => `/v1/cart/${cartId}/items`,
  cartItem: (cartId: string, itemId: string) => `/v1/cart/${cartId}/items/${itemId}`,

  // Wishlist
  wishlists: '/v1/wishlists',
  wishlistById: (id: string) => `/v1/wishlists/${id}`,
  userWishlists: (userId: string) => `/v1/wishlists/user/${userId}`,
  wishlistItems: (wishlistId: string) => `/v1/wishlists/${wishlistId}/items`,

  // Media Assets
  mediaAssets: '/v1/catalog/media-assets',
  mediaAssetById: (id: string) => `/v1/catalog/media-assets/${id}`,

  // Auth
  auth: {
    login: '/v1/auth/login',
    register: '/v1/auth/register',
    logout: '/v1/auth/logout',
    refresh: '/v1/auth/refresh',
    profile: '/v1/users/profile',
  },
} as const;
