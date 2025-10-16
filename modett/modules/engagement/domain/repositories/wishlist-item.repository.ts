import { WishlistItem } from "../entities/wishlist-item.entity";
import { WishlistId } from "../value-objects/wishlist-id.vo";

export interface WishlistItemRepository {
  // Core CRUD
  save(item: WishlistItem): Promise<void>;
  update(item: WishlistItem): Promise<void>;
  delete(wishlistId: WishlistId, variantId: string): Promise<void>;
  findById(
    wishlistId: WishlistId,
    variantId: string
  ): Promise<WishlistItem | null>;

  // Finders
  findByWishlistId(wishlistId: WishlistId): Promise<WishlistItem[]>;
  findByVariantId(variantId: string): Promise<WishlistItem[]>;
  findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<WishlistItem[]>;

  // Existence checks
  exists(wishlistId: WishlistId, variantId: string): Promise<boolean>;

  // Business queries
  countByWishlistId(wishlistId: WishlistId): Promise<number>;
}
