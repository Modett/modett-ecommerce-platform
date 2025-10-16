import { Wishlist } from "../entities/wishlist.entity";
import { WishlistId } from "../value-objects/wishlist-id.vo";

export interface WishlistRepository {
  // Core CRUD
  save(wishlist: Wishlist): Promise<void>;
  update(wishlist: Wishlist): Promise<void>;
  delete(wishlistId: WishlistId): Promise<void>;
  findById(wishlistId: WishlistId): Promise<Wishlist | null>;

  // Finders
  findByUserId(userId: string): Promise<Wishlist[]>;
  findByGuestToken(guestToken: string): Promise<Wishlist[]>;
  findDefaultByUserId(userId: string): Promise<Wishlist | null>;
  findPublicWishlists(limit?: number, offset?: number): Promise<Wishlist[]>;
  findAll(options?: { limit?: number; offset?: number }): Promise<Wishlist[]>;

  // Existence checks
  exists(wishlistId: WishlistId): Promise<boolean>;
  existsByUserId(userId: string): Promise<boolean>;
  existsByGuestToken(guestToken: string): Promise<boolean>;

  // Business queries
  countByUserId(userId: string): Promise<number>;
  countPublicWishlists(): Promise<number>;
}
