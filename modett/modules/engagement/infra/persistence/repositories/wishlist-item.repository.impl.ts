import { PrismaClient } from "@prisma/client";
import { WishlistItemRepository } from "../../../domain/repositories/wishlist-item.repository";
import {
  WishlistItem,
  WishlistItemEntityData,
} from "../../../domain/entities/wishlist-item.entity";
import { WishlistId } from "../../../domain/value-objects/wishlist-id.vo";

export class WishlistItemRepositoryImpl implements WishlistItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(item: WishlistItem): Promise<void> {
    const data = item.toSnapshot();
    await this.prisma.wishlistItem.create({
      data: {
        wishlistId: data.wishlistId,
        variantId: data.variantId,
      },
    });
  }

  async update(item: WishlistItem): Promise<void> {
    // No updatable fields in WishlistItem according to the current DB schema.
    throw new Error(
      "WishlistItem has no updatable fields in the current schema."
    );
  }

  async delete(wishlistId: WishlistId, variantId: string): Promise<void> {
    await this.prisma.wishlistItem.delete({
      where: {
        wishlistId_variantId: {
          wishlistId: wishlistId.getValue(),
          variantId: variantId,
        },
      },
    });
  }

  async findById(
    wishlistId: WishlistId,
    variantId: string
  ): Promise<WishlistItem | null> {
    const result = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_variantId: {
          wishlistId: wishlistId.getValue(),
          variantId: variantId,
        },
      },
    });
    return result ? this.mapPrismaToEntity(result) : null;
  }

  async findByWishlistId(wishlistId: WishlistId): Promise<WishlistItem[]> {
    const results = await this.prisma.wishlistItem.findMany({
      where: { wishlistId: wishlistId.getValue() },
    });
    return results.map(this.mapPrismaToEntity);
  }

  async findByVariantId(variantId: string): Promise<WishlistItem[]> {
    const results = await this.prisma.wishlistItem.findMany({
      where: { variantId },
    });
    return results.map(this.mapPrismaToEntity);
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<WishlistItem[]> {
    const results = await this.prisma.wishlistItem.findMany({
      take: options?.limit,
      skip: options?.offset,
    });
    return results.map(this.mapPrismaToEntity);
  }

  async exists(wishlistId: WishlistId, variantId: string): Promise<boolean> {
    const count = await this.prisma.wishlistItem.count({
      where: {
        wishlistId: wishlistId.getValue(),
        variantId,
      },
    });
    return count > 0;
  }

  async countByWishlistId(wishlistId: WishlistId): Promise<number> {
    return this.prisma.wishlistItem.count({
      where: { wishlistId: wishlistId.getValue() },
    });
  }

  private mapPrismaToEntity = (row: any): WishlistItem => {
    const entityData: WishlistItemEntityData = {
      wishlistId: row.wishlistId,
      variantId: row.variantId,
    };
    return WishlistItem.reconstitute(entityData);
  };
}
