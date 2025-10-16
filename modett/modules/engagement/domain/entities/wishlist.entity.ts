import { WishlistId } from "../value-objects/wishlist-id.vo";

export interface CreateWishlistData {
  userId?: string;
  guestToken?: string;
  name?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  description?: string;
}

export interface WishlistEntityData {
  wishlistId: string;
  userId?: string;
  guestToken?: string;
  name?: string;
  isDefault: boolean;
  isPublic: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Wishlist {
  private constructor(
    private readonly wishlistId: WishlistId,
    private userId?: string,
    private guestToken?: string,
    private name?: string,
    private isDefault: boolean = false,
    private isPublic: boolean = false,
    private description?: string,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {}

  // Factory methods
  static create(data: CreateWishlistData): Wishlist {
    const wishlistId = WishlistId.create();

    // Validation: must have either userId or guestToken
    if (!data.userId && !data.guestToken) {
      throw new Error("Wishlist must belong to either a user or a guest");
    }

    // Validation: cannot have both userId and guestToken
    if (data.userId && data.guestToken) {
      throw new Error("Wishlist cannot belong to both a user and a guest");
    }

    return new Wishlist(
      wishlistId,
      data.userId,
      data.guestToken,
      data.name,
      data.isDefault || false,
      data.isPublic || false,
      data.description
    );
  }

  static reconstitute(data: WishlistEntityData): Wishlist {
    const wishlistId = WishlistId.fromString(data.wishlistId);

    return new Wishlist(
      wishlistId,
      data.userId,
      data.guestToken,
      data.name,
      data.isDefault,
      data.isPublic,
      data.description,
      data.createdAt,
      data.updatedAt
    );
  }

  // Getters
  getWishlistId(): WishlistId {
    return this.wishlistId;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getGuestToken(): string | undefined {
    return this.guestToken;
  }

  getName(): string | undefined {
    return this.name;
  }

  getIsDefault(): boolean {
    return this.isDefault;
  }

  getIsPublic(): boolean {
    return this.isPublic;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  updateName(name: string): void {
    this.name = name.trim();
    this.touch();
  }

  updateDescription(description?: string): void {
    this.description = description?.trim();
    this.touch();
  }

  makeDefault(): void {
    this.isDefault = true;
    this.touch();
  }

  removeDefault(): void {
    this.isDefault = false;
    this.touch();
  }

  makePublic(): void {
    this.isPublic = true;
    this.touch();
  }

  makePrivate(): void {
    this.isPublic = false;
    this.touch();
  }

  transferToUser(userId: string): void {
    if (!userId) {
      throw new Error("User ID cannot be empty");
    }

    this.userId = userId;
    this.guestToken = undefined;
    this.touch();
  }

  // Helper methods
  isUserWishlist(): boolean {
    return !!this.userId;
  }

  isGuestWishlist(): boolean {
    return !!this.guestToken;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  toSnapshot(): WishlistEntityData {
    return {
      wishlistId: this.wishlistId.getValue(),
      userId: this.userId,
      guestToken: this.guestToken,
      name: this.name,
      isDefault: this.isDefault,
      isPublic: this.isPublic,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
