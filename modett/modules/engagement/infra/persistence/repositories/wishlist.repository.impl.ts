import { PrismaClient } from "@prisma/client";
import { WishlistRepository } from "../../../domain/repositories/wishlist.repository";
import {
  Wishlist,
  WishlistEntityData,
} from "../../../domain/entities/wishlist.entity";
import { WishlistId } from "../../../domain/value-objects/wishlist-id.vo";

export class WishlistRepositoryImpl implements WishlistRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(wishlist: Wishlist): Promise<void> {
    const data = wishlist.toSnapshot();
    await this.prisma.wishlist.create({
      data: {
        id: data.wishlistId,
        userId: data.userId,
        guestToken: data.guestToken,
        name: data.name,
        isDefault: data.isDefault,
        isPublic: data.isPublic,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async update(wishlist: Wishlist): Promise<void> {
    const data = wishlist.toSnapshot();
    await this.prisma.wishlist.update({
      where: { id: data.wishlistId },
      data: {
        userId: data.userId,
        guestToken: data.guestToken,
        name: data.name,
        isDefault: data.isDefault,
        isPublic: data.isPublic,
        description: data.description,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(wishlistId: WishlistId): Promise<void> {
    await this.prisma.wishlist.delete({
      where: { id: wishlistId.getValue() },
    });
  }

  async findById(wishlistId: WishlistId): Promise<Wishlist | null> {
    const result = await this.prisma.wishlist.findUnique({
      where: { id: wishlistId.getValue() },
    });
    return result ? this.mapPrismaToEntity(result) : null;
  }

  async findByUserId(userId: string): Promise<Wishlist[]> {
    const results = await this.prisma.wishlist.findMany({
      where: { userId: userId },
    });
    return results.map(this.mapPrismaToEntity);
  }

  async findByGuestToken(guestToken: string): Promise<Wishlist[]> {
    const results = await this.prisma.wishlist.findMany({
      where: { guestToken: guestToken },
    });
    return results.map(this.mapPrismaToEntity);
  }

  async findDefaultByUserId(userId: string): Promise<Wishlist | null> {
    const result = await this.prisma.wishlist.findFirst({
      where: { userId: userId, isDefault: true },
    });
    return result ? this.mapPrismaToEntity(result) : null;
  }

  async findPublicWishlists(
    limit?: number,
    offset?: number
  ): Promise<Wishlist[]> {
    const results = await this.prisma.wishlist.findMany({
      where: { isPublic: true },
      take: limit,
      skip: offset,
    });
    return results.map(this.mapPrismaToEntity);
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<Wishlist[]> {
    const results = await this.prisma.wishlist.findMany({
      take: options?.limit,
      skip: options?.offset,
    });
    return results.map(this.mapPrismaToEntity);
  }

  async exists(wishlistId: WishlistId): Promise<boolean> {
    const count = await this.prisma.wishlist.count({
      where: { id: wishlistId.getValue() },
    });
    return count > 0;
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const count = await this.prisma.wishlist.count({
      where: { userId: userId },
    });
    return count > 0;
  }

  async existsByGuestToken(guestToken: string): Promise<boolean> {
    const count = await this.prisma.wishlist.count({
      where: { guestToken: guestToken },
    });
    return count > 0;
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.wishlist.count({ where: { userId: userId } });
  }

  async countPublicWishlists(): Promise<number> {
    return this.prisma.wishlist.count({ where: { isPublic: true } });
  }

  private mapPrismaToEntity = (row: any): Wishlist => {
    const entityData: WishlistEntityData = {
      wishlistId: row.id,
      userId: row.user_id,
      guestToken: row.guest_token,
      name: row.name,
      isDefault: row.is_default,
      isPublic: row.isPublic,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
    return Wishlist.reconstitute(entityData);
  };
}
