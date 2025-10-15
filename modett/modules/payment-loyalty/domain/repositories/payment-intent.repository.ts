import { PaymentIntent } from "../entities/payment-intent.entity.js";
import { PaymentIntentStatus } from "../value-objects/payment-intent-status.vo.js";

export interface PaymentIntentFilterOptions {
  orderId?: string;
  provider?: string;
  status?: PaymentIntentStatus;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface PaymentIntentQueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IPaymentIntentRepository {
  save(intent: PaymentIntent): Promise<void>;
  update(intent: PaymentIntent): Promise<void>;
  delete(intentId: string): Promise<void>;
  findById(intentId: string): Promise<PaymentIntent | null>;
  findByOrderId(orderId: string): Promise<PaymentIntent[]>;
  findByIdempotencyKey(key: string): Promise<PaymentIntent | null>;
  findWithFilters(
    filters: PaymentIntentFilterOptions,
    options?: PaymentIntentQueryOptions
  ): Promise<PaymentIntent[]>;
  count(filters?: PaymentIntentFilterOptions): Promise<number>;
  exists(intentId: string): Promise<boolean>;
}
