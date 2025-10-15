import { PaymentWebhookEvent } from "../entities/payment-webhook-event.entity.js";

export interface WebhookEventFilterOptions {
  provider?: string;
  eventType?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface IPaymentWebhookEventRepository {
  save(event: PaymentWebhookEvent): Promise<void>;
  findById(eventId: string): Promise<PaymentWebhookEvent | null>;
  findByProvider(provider: string): Promise<PaymentWebhookEvent[]>;
  findWithFilters(
    filters: WebhookEventFilterOptions
  ): Promise<PaymentWebhookEvent[]>;
  count(filters?: WebhookEventFilterOptions): Promise<number>;
}
