import { ReviewId } from "../value-objects/review-id.vo";
import { Rating } from "../value-objects/rating.vo";

export interface CreateProductReviewData {
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  body?: string;
}

export interface ProductReviewEntityData {
  reviewId: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  body?: string;
  status: string;
  createdAt: Date;
}

export class ProductReview {
  private constructor(
    private readonly reviewId: ReviewId,
    private readonly productId: string,
    private readonly userId: string,
    private rating: Rating,
    private title?: string,
    private body?: string,
    private status: string = "pending",
    private readonly createdAt: Date = new Date()
  ) {}

  // Factory methods
  static create(data: CreateProductReviewData): ProductReview {
    const reviewId = ReviewId.create();
    const rating = Rating.fromNumber(data.rating);

    if (!data.productId) {
      throw new Error("Product ID is required");
    }

    if (!data.userId) {
      throw new Error("User ID is required");
    }

    return new ProductReview(
      reviewId,
      data.productId,
      data.userId,
      rating,
      data.title,
      data.body
    );
  }

  static reconstitute(data: ProductReviewEntityData): ProductReview {
    const reviewId = ReviewId.fromString(data.reviewId);
    const rating = Rating.fromNumber(data.rating);

    return new ProductReview(
      reviewId,
      data.productId,
      data.userId,
      rating,
      data.title,
      data.body,
      data.status,
      data.createdAt
    );
  }

  // Getters
  getReviewId(): ReviewId {
    return this.reviewId;
  }

  getProductId(): string {
    return this.productId;
  }

  getUserId(): string {
    return this.userId;
  }

  getRating(): Rating {
    return this.rating;
  }

  getTitle(): string | undefined {
    return this.title;
  }

  getBody(): string | undefined {
    return this.body;
  }

  getStatus(): string {
    return this.status;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  // Business methods
  updateRating(rating: number): void {
    this.rating = Rating.fromNumber(rating);
  }

  updateTitle(title?: string): void {
    this.title = title?.trim();
  }

  updateBody(body?: string): void {
    this.body = body?.trim();
  }

  approve(): void {
    this.status = "approved";
  }

  reject(): void {
    this.status = "rejected";
  }

  flag(): void {
    this.status = "flagged";
  }

  // Helper methods
  isPending(): boolean {
    return this.status === "pending";
  }

  isApproved(): boolean {
    return this.status === "approved";
  }

  isRejected(): boolean {
    return this.status === "rejected";
  }

  isFlagged(): boolean {
    return this.status === "flagged";
  }

  isPositive(): boolean {
    return this.rating.isPositive();
  }

  isNegative(): boolean {
    return this.rating.isNegative();
  }

  hasContent(): boolean {
    return !!(this.title || this.body);
  }

  toSnapshot(): ProductReviewEntityData {
    return {
      reviewId: this.reviewId.getValue(),
      productId: this.productId,
      userId: this.userId,
      rating: this.rating.getValue(),
      title: this.title,
      body: this.body,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
