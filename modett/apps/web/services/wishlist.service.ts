import axios from "axios";

const GUEST_TOKEN_KEY = "modett_guest_token";
const WISHLIST_ID_KEY = "modett_wishlist_id";

// Create axios instance for wishlist API
const wishlistApiClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL?.replace("/catalog", "") ||
    "http://localhost:3001/api/v1",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface WishlistItem {
  wishlistItemId: string;
  wishlistId: string;
  variantId: string;
  priority?: number;
  notes?: string;
  addedAt: string;
}

export interface Wishlist {
  wishlistId: string;
  userId?: string;
  guestToken?: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}

class WishlistService {
  private wishlistId: string | null = null;

  constructor() {
    // Initialize wishlist ID from localStorage if in browser
    if (typeof window !== "undefined") {
      this.wishlistId = localStorage.getItem(WISHLIST_ID_KEY);
    }
  }

  /**
   * Get the guest token from cart service, or generate one if needed
   */
  private async getGuestToken(): Promise<string> {
    if (typeof window !== "undefined") {
      const existingToken = localStorage.getItem(GUEST_TOKEN_KEY);
      if (existingToken) {
        return existingToken;
      }
    }

    // Generate a new guest token if one doesn't exist
    return this.generateGuestToken();
  }

  /**
   * Generate a guest token
   */
  private async generateGuestToken(): Promise<string> {
    try {
      const { data } = await wishlistApiClient.get("/cart/generate-guest-token");
      const token = data.data.guestToken;

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(GUEST_TOKEN_KEY, token);
        // Drop any cached wishlist that belonged to an older token
        this.clearWishlist();
      }

      return token;
    } catch (error: any) {
      console.error("Failed to generate guest token:", error);
      throw new Error(
        error.response?.data?.error || "Failed to generate guest token"
      );
    }
  }

  /**
   * Create a default wishlist for guest user
   */
  async createDefaultWishlist(): Promise<Wishlist> {
    try {
      const guestToken = await this.getGuestToken();

      const { data } = await wishlistApiClient.post("/engagement/wishlists", {
        guestToken,
        name: "My Wishlist",
        isDefault: true,
        isPublic: false,
      });

      const wishlist = data.data;
      this.wishlistId = wishlist.wishlistId;

      // Store wishlist ID in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(WISHLIST_ID_KEY, wishlist.wishlistId);
      }

      return wishlist;
    } catch (error: any) {
      console.error("Failed to create wishlist:", error);
      throw new Error(
        error.response?.data?.error || "Failed to create wishlist"
      );
    }
  }

  /**
   * Get or create the default wishlist
   */
  private async getWishlistId(): Promise<string> {
    if (!this.wishlistId) {
      const wishlist = await this.createDefaultWishlist();
      return wishlist.wishlistId;
    }
    return this.wishlistId;
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(variantId: string): Promise<WishlistItem> {
    return this.addToWishlistInternal(variantId);
  }

  private async addToWishlistInternal(
    variantId: string,
    hasRetried = false
  ): Promise<WishlistItem> {
    try {
      const wishlistId = await this.getWishlistId();
      const guestToken = await this.getGuestToken();

      const { data } = await wishlistApiClient.post(
        `/engagement/wishlists/${wishlistId}/items`,
        {
          variantId,
          priority: 3,
        },
        {
          headers: {
            "X-Guest-Token": guestToken,
          },
        }
      );

      return data.data;
    } catch (error: any) {
      const responseData = error?.response?.data;
      const errorMessages = this.extractErrorMessages(responseData);
      const shouldRetry =
        !hasRetried &&
        this.shouldRetryOnError(responseData, errorMessages);

      if (shouldRetry) {
        console.log("🔄 Wishlist not found, retrying with fresh wishlist...");
        this.clearWishlist();
        return this.addToWishlistInternal(variantId, true);
      }

      console.error("❌ Failed to add to wishlist:", errorMessages[0] || error.message);

      throw new Error(
        errorMessages[0] || "Failed to add to wishlist"
      );
    }
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(variantId: string): Promise<void> {
    try {
      const wishlistId = await this.getWishlistId();
      const guestToken = await this.getGuestToken();

      await wishlistApiClient.delete(
        `/engagement/wishlists/${wishlistId}/items/${variantId}`,
        {
          headers: { "X-Guest-Token": guestToken },
        }
      );
    } catch (error: any) {
      console.error("Failed to remove from wishlist:", error);
      throw new Error(
        error.response?.data?.error || "Failed to remove from wishlist"
      );
    }
  }

  /**
   * Get all wishlist items
   */
  async getWishlistItems(): Promise<WishlistItem[]> {
    try {
      const wishlistId = await this.getWishlistId();

      const { data } = await wishlistApiClient.get(
        `/engagement/wishlists/${wishlistId}/items`
      );

      return data.data || [];
    } catch (error: any) {
      console.error("Failed to get wishlist items:", error);
      // Return empty array if wishlist doesn't exist yet
      return [];
    }
  }

  /**
   * Check if a variant is in the wishlist
   */
  async isInWishlist(variantId: string): Promise<boolean> {
    try {
      const items = await this.getWishlistItems();
      return items.some((item) => item.variantId === variantId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear wishlist ID (for logout)
   */
  clearWishlist(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(WISHLIST_ID_KEY);
    }
    this.wishlistId = null;
  }

  private shouldRetryOnError(
    responseData: any,
    errorMessages: string[]
  ): boolean {
    const message = errorMessages.join(" ").toLowerCase();
    const fallbackError =
      typeof responseData?.message === "string"
        ? responseData.message.toLowerCase()
        : "";

    return (
      /wishlist.*not found/.test(message) ||
      /unauthorized/.test(message) ||
      /wishlist.*not found/.test(fallbackError) ||
      /unauthorized/.test(fallbackError)
    );
  }

  private extractErrorMessages(responseData: any): string[] {
    const errors: string[] = [];

    if (typeof responseData?.error === "string") {
      errors.push(responseData.error);
    }

    if (typeof responseData?.message === "string") {
      errors.push(responseData.message);
    }

    if (Array.isArray(responseData?.errors)) {
      for (const errorItem of responseData.errors) {
        if (typeof errorItem === "string") {
          errors.push(errorItem);
        } else if (typeof errorItem?.message === "string") {
          errors.push(errorItem.message);
        }
      }
    }

    return errors;
  }
}

export const wishlistService = new WishlistService();
