import { api, APIError } from "../lib/fetcher";
import type { FetcherOptions } from "../lib/fetcher";
import { API_ENDPOINTS } from "../lib/config";
import type {
  Wishlist,
  WishlistItem,
  CreateWishlistInput,
  ApiResponse,
} from "../types";

type WishlistAuthOptions = {
  token?: string;
  guestToken?: string;
};

const buildAuthOptions = (
  auth?: WishlistAuthOptions
): FetcherOptions | undefined => {
  if (!auth?.token && !auth?.guestToken) {
    return undefined;
  }

  const options: FetcherOptions = {};
  if (auth.token) {
    options.token = auth.token;
  }
  if (auth.guestToken) {
    options.guestToken = auth.guestToken;
  }
  return options;
};

const toIsoString = (value?: string | Date | null): string => {
  if (!value) {
    return new Date().toISOString();
  }
  return new Date(value).toISOString();
};

const mapWishlistItem = (raw: any): WishlistItem => ({
  wishlistId:
    raw?.wishlistId ||
    raw?.wishlist_id ||
    raw?.wishlistItemId ||
    raw?.wishlist_item_id ||
    "",
  variantId: raw?.variantId || raw?.variant_id || "",
  variant: raw?.variant,
});

const mapWishlist = (raw: any, items: WishlistItem[] = []): Wishlist => ({
  id: raw?.id || raw?.wishlistId || raw?.wishlist_id,
  userId: raw?.userId || raw?.user_id || undefined,
  guestToken: raw?.guestToken || raw?.guest_token || undefined,
  name: raw?.name,
  isDefault: raw?.isDefault ?? raw?.is_default ?? false,
  isPublic: raw?.isPublic ?? raw?.is_public ?? false,
  description: raw?.description ?? undefined,
  createdAt: toIsoString(raw?.createdAt ?? raw?.created_at),
  updatedAt: toIsoString(raw?.updatedAt ?? raw?.updated_at ?? raw?.createdAt),
  items,
});

const unwrap = <T>(response: ApiResponse<T> | T): T => {
  if (response && typeof response === "object" && "data" in response) {
    const apiResponse = response as ApiResponse<T>;
    return (apiResponse.data ?? (apiResponse as unknown as T)) as T;
  }
  return response as T;
};

export const wishlistService = {
  /**
   * Get all wishlists for the current user
   */
  async getUserWishlists(
    userId: string,
    auth: WishlistAuthOptions
  ): Promise<Wishlist[]> {
    const response = await api.get<ApiResponse<any[]>>(
      API_ENDPOINTS.userWishlists(userId),
      buildAuthOptions(auth)
    );
    const data = unwrap(response) || [];
    return data.map((wishlist) => mapWishlist(wishlist));
  },

  /**
   * Get wishlist by ID (includes items)
   */
  async getWishlistById(
    wishlistId: string,
    auth?: WishlistAuthOptions
  ): Promise<Wishlist> {
    const wishlistResponse = await api.get<ApiResponse<any>>(
      API_ENDPOINTS.wishlistById(wishlistId),
      buildAuthOptions(auth)
    );
    const baseWishlist = unwrap(wishlistResponse);

    const rawItems = await api
      .get<ApiResponse<any[]>>(
        API_ENDPOINTS.wishlistItems(wishlistId),
        buildAuthOptions(auth)
      )
      .then((response) => unwrap(response))
      .catch(() => []);
    const items = rawItems.map(mapWishlistItem);

    return mapWishlist(baseWishlist, items);
  },

  /**
   * Create a new wishlist
   */
  async createWishlist(
    data: CreateWishlistInput,
    auth?: WishlistAuthOptions
  ): Promise<Wishlist> {
    const response = await api.post<ApiResponse<any>>(
      API_ENDPOINTS.wishlists,
      data,
      buildAuthOptions(auth)
    );
    return mapWishlist(unwrap(response));
  },

  /**
   * Update wishlist
   */
  async updateWishlist(
    wishlistId: string,
    updates: Partial<CreateWishlistInput>,
    auth?: WishlistAuthOptions
  ): Promise<Wishlist> {
    const response = await api.patch<ApiResponse<any>>(
      API_ENDPOINTS.wishlistById(wishlistId),
      updates,
      buildAuthOptions(auth)
    );
    return mapWishlist(unwrap(response));
  },

  /**
   * Delete wishlist
   */
  async deleteWishlist(
    wishlistId: string,
    auth?: WishlistAuthOptions
  ): Promise<void> {
    await api.delete<void>(
      API_ENDPOINTS.wishlistById(wishlistId),
      buildAuthOptions(auth)
    );
  },

  /**
   * Get wishlist items
   */
  async getWishlistItems(
    wishlistId: string,
    auth?: WishlistAuthOptions
  ): Promise<WishlistItem[]> {
    const response = await api.get<ApiResponse<any[]>>(
      API_ENDPOINTS.wishlistItems(wishlistId),
      buildAuthOptions(auth)
    );
    return unwrap(response).map(mapWishlistItem);
  },

  /**
   * Add item to wishlist
   */
  async addItem(
    wishlistId: string,
    variantId: string,
    auth?: WishlistAuthOptions
  ): Promise<WishlistItem> {
    const response = await api.post<ApiResponse<any>>(
      API_ENDPOINTS.wishlistItems(wishlistId),
      { variantId },
      buildAuthOptions(auth)
    );
    return mapWishlistItem(unwrap(response));
  },

  /**
   * Remove item from wishlist
   */
  async removeItem(
    wishlistId: string,
    variantId: string,
    auth?: WishlistAuthOptions
  ): Promise<void> {
    try {
      await api.delete<void>(
        `${API_ENDPOINTS.wishlistItems(wishlistId)}/${variantId}`,
        buildAuthOptions(auth)
      );
    } catch (error) {
      if (error instanceof APIError && (error.status === 404 || error.status === 400)) {
        return;
      }
      throw error;
    }
  },

  /**
   * Toggle variant in wishlist (add if not present, remove if present)
   */
  async toggleItem(
    wishlistId: string,
    variantId: string,
    auth?: WishlistAuthOptions
  ): Promise<{ added: boolean }> {
    const wishlist = await this.getWishlistById(wishlistId, auth);

    if (this.isInWishlist(wishlist, variantId)) {
      await this.removeItem(wishlistId, variantId, auth);
      return { added: false };
    }

    await this.addItem(wishlistId, variantId, auth);
    return { added: true };
  },

  /**
   * Check if variant is in wishlist
   */
  isInWishlist(wishlist: Wishlist, variantId: string): boolean {
    if (!wishlist.items || wishlist.items.length === 0) return false;
    return wishlist.items.some((item) => item.variantId === variantId);
  },

  /**
   * Move wishlist item to cart
   */
  async moveToCart(
    wishlistId: string,
    variantId: string,
    auth?: WishlistAuthOptions
  ): Promise<void> {
    await this.removeItem(wishlistId, variantId, auth);
  },
};

