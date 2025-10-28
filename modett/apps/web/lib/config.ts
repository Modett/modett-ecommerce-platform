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
  generateGuestToken: '/v1/cart/generate-guest-token',
  cartById: (id: string) => `/v1/cart/carts/${id}`,
  userCart: (userId: string) => `/v1/cart/users/${userId}/cart`,
  createUserCart: (userId: string) => `/v1/cart/users/${userId}/cart`,
  guestCart: (token: string) => `/v1/cart/guests/${token}/cart`,
  createGuestCart: (token: string) => `/v1/cart/guests/${token}/cart`,
  addCartItem: '/v1/cart/cart/items',
  updateCartItem: (cartId: string, variantId: string) => `/v1/cart/carts/${cartId}/items/${variantId}`,
  removeCartItem: (cartId: string, variantId: string) => `/v1/cart/carts/${cartId}/items/${variantId}`,
  clearUserCart: (userId: string) => `/v1/cart/users/${userId}/cart`,
  clearGuestCart: (token: string) => `/v1/cart/guests/${token}/cart`,

  // Wishlist
  wishlists: '/v1/engagement/wishlists',
  wishlistById: (id: string) => `/v1/engagement/wishlists/${id}`,
  userWishlists: (userId: string) => `/v1/engagement/users/${userId}/wishlists`,
  wishlistItems: (wishlistId: string) => `/v1/engagement/wishlists/${wishlistId}/items`,

  // Media Assets
  mediaAssets: '/v1/catalog/media',
  mediaAssetById: (id: string) => `/v1/catalog/media/${id}`,

  // Auth
  auth: {
    login: '/v1/auth/login',
    register: '/v1/auth/register',
    logout: '/v1/auth/logout',
    refresh: '/v1/auth/refresh',
    profile: '/v1/users/profile',
  },
} as const;
