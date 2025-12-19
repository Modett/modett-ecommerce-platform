import { CheckoutId } from "../value-objects/checkout-id.vo";
import { CartId } from "../value-objects/cart-id.vo";
import { UserId } from "../../../user-management/domain/value-objects/user-id.vo";
import { GuestToken } from "../value-objects/guest-token.vo";
import { Currency } from "../value-objects/currency.vo";
import {
  CheckoutStatus,
  CheckoutStatusEnum,
} from "../value-objects/checkout-status.vo";

export interface CreateCheckoutData {
  cartId: string;
  userId?: string;
  guestToken?: string;
  totalAmount: number;
  currency: string;
  expiresInMinutes?: number;
}

export interface CheckoutEntityData {
  checkoutId: string;
  cartId: string;
  userId?: string;
  guestToken?: string;
  status: string;
  totalAmount: number;
  currency: string;
  expiresAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Checkout {
  private constructor(
    private readonly checkoutId: CheckoutId,
    private readonly cartId: CartId,
    private readonly userId: UserId | null,
    private readonly guestToken: GuestToken | null,
    private status: CheckoutStatus,
    private readonly totalAmount: number,
    private readonly currency: Currency,
    private readonly expiresAt: Date,
    private completedAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {
    if (userId && guestToken) {
      throw new Error("Checkout cannot belong to both user and guest");
    }
    if (!userId && !guestToken) {
      throw new Error("Checkout must belong to either user or guest");
    }
    if (totalAmount < 0) {
      throw new Error("Total amount cannot be negative");
    }
  }

  static create(data: CreateCheckoutData): Checkout {
    const checkoutId = CheckoutId.create();
    const cartId = CartId.fromString(data.cartId);
    const userId = data.userId ? UserId.fromString(data.userId) : null;
    const guestToken = data.guestToken
      ? GuestToken.fromString(data.guestToken)
      : null;
    const currency = Currency.fromString(data.currency);
    const status = CheckoutStatus.pending();
    const now = new Date();
    const expiresInMinutes = data.expiresInMinutes || 15;
    const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

    return new Checkout(
      checkoutId,
      cartId,
      userId,
      guestToken,
      status,
      data.totalAmount,
      currency,
      expiresAt,
      null,
      now,
      now
    );
  }

  static fromData(data: CheckoutEntityData): Checkout {
    const checkoutId = CheckoutId.fromString(data.checkoutId);
    const cartId = CartId.fromString(data.cartId);
    const userId = data.userId ? UserId.fromString(data.userId) : null;
    const guestToken = data.guestToken
      ? GuestToken.fromString(data.guestToken)
      : null;
    const currency = Currency.fromString(data.currency);
    const status = CheckoutStatus.fromString(data.status);

    return new Checkout(
      checkoutId,
      cartId,
      userId,
      guestToken,
      status,
      data.totalAmount,
      currency,
      data.expiresAt,
      data.completedAt || null,
      data.createdAt,
      data.updatedAt
    );
  }

  markAsCompleted(completedAt: Date = new Date()): void {
    if (this.status.isCompleted()) {
      throw new Error("Checkout is already completed");
    }
    if (this.status.isExpired()) {
      throw new Error("Cannot complete an expired checkout");
    }
    if (this.status.isCancelled()) {
      throw new Error("Cannot complete a cancelled checkout");
    }
    this.status = CheckoutStatus.completed();
    this.completedAt = completedAt;
    this.updatedAt = new Date();
  }

  markAsExpired(): void {
    if (this.status.isCompleted()) {
      throw new Error("Cannot expire a completed checkout");
    }
    this.status = CheckoutStatus.expired();
    this.updatedAt = new Date();
  }

  markAsCancelled(): void {
    if (this.status.isCompleted()) {
      throw new Error("Cannot cancel a completed checkout");
    }
    this.status = CheckoutStatus.cancelled();
    this.updatedAt = new Date();
  }

  isExpired(): boolean {
    return this.expiresAt < new Date() || this.status.isExpired();
  }

  isPending(): boolean {
    return this.status.isPending();
  }

  isCompleted(): boolean {
    return this.status.isCompleted();
  }

  getCheckoutId(): CheckoutId {
    return this.checkoutId;
  }

  getCartId(): CartId {
    return this.cartId;
  }

  getUserId(): UserId | null {
    return this.userId;
  }

  getGuestToken(): GuestToken | null {
    return this.guestToken;
  }

  getStatus(): CheckoutStatus {
    return this.status;
  }

  getTotalAmount(): number {
    return this.totalAmount;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  toData(): CheckoutEntityData {
    return {
      checkoutId: this.checkoutId.toString(),
      cartId: this.cartId.toString(),
      userId: this.userId?.toString(),
      guestToken: this.guestToken?.toString(),
      status: this.status.toString(),
      totalAmount: this.totalAmount,
      currency: this.currency.toString(),
      expiresAt: this.expiresAt,
      completedAt: this.completedAt || undefined,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
