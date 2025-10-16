import { ProductReview } from "../entities/product-review.entity";
import { ReviewId } from "../value-objects/review-id.vo";

export interface ProductReviewRepository {
  // Core CRUD
  save(review: ProductReview): Promise<void>;
  update(review: ProductReview): Promise<void>;
  delete(reviewId: ReviewId): Promise<void>;
  findById(reviewId: ReviewId): Promise<ProductReview | null>;

  // Finders
  findByProductId(productId: string): Promise<ProductReview[]>;
  findByUserId(userId: string): Promise<ProductReview[]>;
  findByStatus(status: string): Promise<ProductReview[]>;
  findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<ProductReview[]>;

  // Existence checks
  exists(reviewId: ReviewId): Promise<boolean>;
  existsByUserIdAndProductId(
    userId: string,
    productId: string
  ): Promise<boolean>;

  // Business queries
  countByProductId(productId: string): Promise<number>;
  countByUserId(userId: string): Promise<number>;
}
