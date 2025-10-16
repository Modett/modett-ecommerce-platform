import { PrismaClient } from "@prisma/client";
import { ProductReviewRepository } from "../../../domain/repositories/product-review.repository";
import {
  ProductReview,
  ProductReviewEntityData,
} from "../../../domain/entities/product-review.entity";
import { ReviewId } from "../../../domain/value-objects/review-id.vo";

export class ProductReviewRepositoryImpl implements ProductReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(review: ProductReview): Promise<void> {
    const data = review.toSnapshot();
    await this.prisma.productReview.create({
      data: {
        id: data.reviewId,
        productId: data.productId,
        userId: data.userId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        status: data.status,
        createdAt: data.createdAt,
      },
    });
  }

  async update(review: ProductReview): Promise<void> {
    const data = review.toSnapshot();
    await this.prisma.productReview.update({
      where: { id: data.reviewId },
      data: {
        productId: data.productId,
        userId: data.userId,
        rating: data.rating,
        title: data.title,
        body: data.body,
        status: data.status,
      },
    });
  }

  async delete(reviewId: ReviewId): Promise<void> {
    await this.prisma.productReview.delete({
      where: { id: reviewId.getValue() },
    });
  }

  async findById(reviewId: ReviewId): Promise<ProductReview | null> {
    const result = await this.prisma.productReview.findUnique({
      where: { id: reviewId.getValue() },
    });
    return result ? this.mapPrismaToEntity(result) : null;
  }

  async findByProductId(productId: string): Promise<ProductReview[]> {
    const results = await this.prisma.productReview.findMany({
      where: { productId },
    });
    return results.map(this.mapPrismaToEntity);
  }

  async findByUserId(userId: string): Promise<ProductReview[]> {
    const results = await this.prisma.productReview.findMany({
      where: { userId },
    });
    return results.map(this.mapPrismaToEntity);
  }

  async findByStatus(status: string): Promise<ProductReview[]> {
    const results = await this.prisma.productReview.findMany({
      where: { status },
    });
    return results.map(this.mapPrismaToEntity);
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<ProductReview[]> {
    const results = await this.prisma.productReview.findMany({
      take: options?.limit,
      skip: options?.offset,
    });
    return results.map(this.mapPrismaToEntity);
  }

  async exists(reviewId: ReviewId): Promise<boolean> {
    const count = await this.prisma.productReview.count({
      where: { id: reviewId.getValue() },
    });
    return count > 0;
  }

  async existsByUserIdAndProductId(
    userId: string,
    productId: string
  ): Promise<boolean> {
    const count = await this.prisma.productReview.count({
      where: { userId, productId },
    });
    return count > 0;
  }

  async countByProductId(productId: string): Promise<number> {
    return this.prisma.productReview.count({ where: { productId } });
  }

  async countByUserId(userId: string): Promise<number> {
    return this.prisma.productReview.count({ where: { userId } });
  }

  private mapPrismaToEntity = (row: any): ProductReview => {
    const entityData: ProductReviewEntityData = {
      reviewId: row.id,
      productId: row.productId,
      userId: row.userId,
      rating: row.rating,
      title: row.title,
      body: row.body,
      status: row.status,
      createdAt: row.createdAt,
    };
    return ProductReview.reconstitute(entityData);
  };
}
