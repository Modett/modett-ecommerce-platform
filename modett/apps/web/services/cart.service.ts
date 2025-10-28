import { api } from '../lib/fetcher';
import type { FetcherOptions } from '../lib/fetcher';
import { API_ENDPOINTS } from '../lib/config';
import type {
  ShoppingCart,
  CartItem,
  AddToCartInput,
  UpdateCartItemInput,
  ApiResponse,
} from '../types';

// Helper to map backend cart response to frontend type
function mapCartResponse(backendCart: any): ShoppingCart {
  return {
    id: backendCart.cartId || backendCart.id,
    userId: backendCart.userId,
    guestToken: backendCart.guestToken,
    currency: backendCart.currency,
    reservationExpiresAt: backendCart.reservationExpiresAt,
    createdAt: backendCart.createdAt,
    updatedAt: backendCart.updatedAt,
    items: backendCart.items || [],
  };
}

type CartAuthOptions = {
  token?: string;
  guestToken?: string;
};

function getStoredGuestToken(): string | undefined {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return undefined;
  }
  return localStorage.getItem('guestCartToken') || undefined;
}

function buildAuthOptions(auth?: CartAuthOptions): FetcherOptions | undefined {
  const options: FetcherOptions = {};

  if (auth?.token) {
    options.token = auth.token;
  }

  const resolvedGuestToken = auth?.guestToken ?? getStoredGuestToken();
  if (resolvedGuestToken) {
    options.guestToken = resolvedGuestToken;
  }

  return Object.keys(options).length > 0 ? options : undefined;
}

export const cartService = {
  /**
   * Get cart by ID
   */
  async getCartById(cartId: string, auth?: CartAuthOptions): Promise<ShoppingCart> {
    const response = await api.get<ApiResponse<any>>(
      API_ENDPOINTS.cartById(cartId),
      buildAuthOptions(auth)
    );
    return mapCartResponse(response.data);
  },

  /**
   * Get user's cart
   */
  async getUserCart(userId: string, token: string): Promise<ShoppingCart> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.userCart(userId), { token });
    return mapCartResponse(response.data);
  },

  /**
   * Get guest cart
   */
  async getGuestCart(guestToken: string): Promise<ShoppingCart> {
    const response = await api.get<ApiResponse<any>>(API_ENDPOINTS.guestCart(guestToken));
    return mapCartResponse(response.data);
  },

  /**
   * Create a new cart for user
   */
  async createUserCart(userId: string, token: string): Promise<ShoppingCart> {
    const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.createUserCart(userId), {}, { token });
    return mapCartResponse(response.data);
  },

  /**
   * Create a new cart for guest
   */
  async createGuestCart(guestToken: string): Promise<ShoppingCart> {
    const response = await api.post<ApiResponse<any>>(API_ENDPOINTS.createGuestCart(guestToken), {});
    return mapCartResponse(response.data);
  },

  /**
   * Generate a guest token
   */
  async generateGuestToken(): Promise<{ guestToken: string }> {
    const response = await api.get<ApiResponse<{ guestToken: string }>>(API_ENDPOINTS.generateGuestToken);
    return response.data!;
  },

  /**
   * Add item to cart
   */
  async addItem(
    cartId: string,
    item: AddToCartInput,
    auth?: CartAuthOptions
  ): Promise<CartItem> {
    // The backend expects cartId, variantId, and quantity (not qty)
    const payload = {
      cartId,
      variantId: item.variantId,
      quantity: item.qty, // Transform qty to quantity
      isGift: item.isGift,
      giftMessage: item.giftMessage,
    };
    const response = await api.post<ApiResponse<CartItem>>(
      API_ENDPOINTS.addCartItem,
      payload,
      buildAuthOptions(auth)
    );
    return response.data!;
  },

  /**
   * Update cart item quantity
   */
  async updateItem(
    cartId: string,
    variantId: string,
    updates: UpdateCartItemInput,
    auth?: CartAuthOptions
  ): Promise<CartItem> {
    const response = await api.put<ApiResponse<CartItem>>(
      API_ENDPOINTS.updateCartItem(cartId, variantId),
      updates,
      buildAuthOptions(auth)
    );
    return response.data!;
  },

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, variantId: string, auth?: CartAuthOptions): Promise<void> {
    await api.delete<ApiResponse<void>>(
      API_ENDPOINTS.removeCartItem(cartId, variantId),
      buildAuthOptions(auth)
    );
  },

  /**
   * Clear cart (remove all items)
   */
  async clearCart(cartId: string, auth?: CartAuthOptions): Promise<void> {
    const cart = await this.getCartById(cartId, auth);
    if (cart.items) {
      await Promise.all(
        cart.items.map((item) => this.removeItem(cartId, item.variantId, auth))
      );
    }
  },

  /**
   * Delete cart
   */
  async deleteCart(cartId: string, auth?: CartAuthOptions): Promise<void> {
    await api.delete<ApiResponse<void>>(
      API_ENDPOINTS.cartById(cartId),
      buildAuthOptions(auth)
    );
  },

  /**
   * Get or create guest cart
   * This is a convenience method for handling guest cart flow
   */
  async getOrCreateGuestCart(): Promise<ShoppingCart> {
    // Try to get existing guest cart from localStorage
    let guestToken = localStorage.getItem('guestCartToken');

    if (guestToken) {
      try {
        return await this.getGuestCart(guestToken);
      } catch (error) {
        // If cart doesn't exist, create a new one
        localStorage.removeItem('guestCartToken');
        guestToken = null;
      }
    }

    // Generate a new guest token from the backend
    if (!guestToken) {
      const response = await this.generateGuestToken();
      guestToken = response.guestToken;
      localStorage.setItem('guestCartToken', guestToken);
    }

    // Create new guest cart
    const cart = await this.createGuestCart(guestToken);
    return cart;
  },

  /**
   * Calculate cart total
   */
  calculateTotal(cart: ShoppingCart): number {
    if (!cart.items || cart.items.length === 0) return 0;
    return cart.items.reduce(
      (total, item) => total + item.unitPriceSnapshot * item.qty,
      0
    );
  },

  /**
   * Get cart item count
   */
  getItemCount(cart: ShoppingCart): number {
    if (!cart.items || cart.items.length === 0) return 0;
    return cart.items.reduce((count, item) => count + item.qty, 0);
  },
};
