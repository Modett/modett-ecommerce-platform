import axios from "axios";

const GUEST_TOKEN_KEY = "modett_guest_token";
const CART_ID_KEY = "modett_cart_id";

// Create a separate axios instance for cart API
const cartApiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL?.replace("/catalog", "/cart") ||
    "http://localhost:3001/api/v1/cart",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface AddToCartParams {
  variantId: string;
  quantity: number;
  isGift?: boolean;
  giftMessage?: string;
}

export interface CartItem {
  id: string;
  cartItemId?: string; // Deprecated, use id
  variantId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  isGift: boolean;
  giftMessage?: string;
  hasPromosApplied: boolean;
  hasFreeShipping: boolean;
  // Product details from enriched API response
  product?: {
    productId: string;
    title: string;
    slug: string;
    images: Array<{ url: string; alt?: string }>;
  };
  // Variant details from enriched API response
  variant?: {
    size: string | null;
    color: string | null;
    sku: string;
  };
}

export interface Cart {
  cartId: string;
  userId?: string;
  guestToken?: string;
  currency: string;
  items: CartItem[];
  summary: {
    itemCount: number;
    subtotal: number;
    discount: number;
    total: number;
  };
}

class CartService {
  private guestToken: string | null = null;
  private cartId: string | null = null;

  constructor() {
    // Initialize guest token from localStorage if in browser
    if (typeof window !== "undefined") {
      this.guestToken = localStorage.getItem(GUEST_TOKEN_KEY);
      this.cartId = localStorage.getItem(CART_ID_KEY);
    }
  }

  /**
   * Generate a guest token for anonymous users
   */
  async generateGuestToken(): Promise<string> {
    try {
      const { data } = await cartApiClient.get("/generate-guest-token");
      const token = data.data.guestToken;

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(GUEST_TOKEN_KEY, token);
      }

      this.guestToken = token;
      return token;
    } catch (error) {
      console.error("Failed to generate guest token:", error);
      throw error;
    }
  }

  /**
   * Get the current guest token, generating one if needed
   */
  private async getGuestToken(): Promise<string> {
    if (!this.guestToken) {
      this.guestToken = await this.generateGuestToken();
    }
    return this.guestToken;
  }

  /**
   * Add an item to cart
   */
  async addToCart(params: AddToCartParams): Promise<Cart> {
    try {
      // Get or generate guest token
      const token = await this.getGuestToken();

      const { data } = await cartApiClient.post(
        "/cart/items",
        {
          variantId: params.variantId,
          quantity: params.quantity,
          isGift: params.isGift || false,
          giftMessage: params.giftMessage,
        },
        {
          headers: {
            "X-Guest-Token": token,
          },
        }
      );

      if (data?.data?.cartId) {
        this.persistCartId(data.data.cartId);
      }

      return data.data;
    } catch (error: any) {
      console.error("Failed to add item to cart:", error);
      throw new Error(
        error.response?.data?.error || "Failed to add item to cart"
      );
    }
  }

  /**
   * Get cart by ID
   */
  async getCart(cartId: string): Promise<Cart> {
    try {
      const token = await this.getGuestToken();

      const { data } = await cartApiClient.get(`/carts/${cartId}`, {
        headers: {
          "X-Guest-Token": token,
        },
      });

      if (data?.data?.cartId) {
        this.persistCartId(data.data.cartId);
      }

      return data.data;
    } catch (error: any) {
      console.error("Failed to get cart:", error);
      throw new Error(error.response?.data?.error || "Failed to get cart");
    }
  }

  private persistCartId(cartId: string) {
    this.cartId = cartId;
    if (typeof window !== "undefined") {
      localStorage.setItem(CART_ID_KEY, cartId);
    }
  }

  /**
   * Clear guest token (for logout or token expiry)
   */
  clearGuestToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(GUEST_TOKEN_KEY);
    }
    this.guestToken = null;
  }
}

export const cartService = new CartService();
