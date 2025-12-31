// ============================================================================
// ENGAGEMENT (WISHLIST) TYPES
// ============================================================================

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

export interface AddToWishlistParams {
  variantId: string;
  productId?: string;
  priority?: number;
}

export interface RemoveFromWishlistParams {
  variantId: string;
  productId?: string;
}
