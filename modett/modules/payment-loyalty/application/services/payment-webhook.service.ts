import {
  IPaymentWebhookEventRepository,
  WebhookEventFilterOptions,
} from "../../domain/repositories/payment-webhook-event.repository.js";
import {
  PaymentWebhookEvent,
  WebhookEventData,
} from "../../domain/entities/payment-webhook-event.entity.js";

export interface CreateWebhookEventDto {
  provider: string;
  eventType: string;
  eventData: WebhookEventData;
}

export interface PaymentWebhookEventDto {
  eventId: string;
  provider: string;
  eventType: string;
  eventData: WebhookEventData;
  createdAt: Date;
}

export class PaymentWebhookService {
  constructor(
    private readonly webhookEventRepo: IPaymentWebhookEventRepository
  ) {}

  async recordWebhookEvent(
    dto: CreateWebhookEventDto
  ): Promise<PaymentWebhookEventDto> {
    const event = PaymentWebhookEvent.create({
      provider: dto.provider,
      eventType: dto.eventType,
      eventData: dto.eventData,
    });

    await this.webhookEventRepo.save(event);

    return this.toDto(event);
  }

  async getWebhookEvent(
    eventId: string
  ): Promise<PaymentWebhookEventDto | null> {
    const event = await this.webhookEventRepo.findById(eventId);
    return event ? this.toDto(event) : null;
  }

  async getWebhookEventsByProvider(
    provider: string
  ): Promise<PaymentWebhookEventDto[]> {
    const events = await this.webhookEventRepo.findByProvider(provider);
    return events.map((e) => this.toDto(e));
  }

  async getWebhookEventsWithFilters(
    filters: WebhookEventFilterOptions
  ): Promise<PaymentWebhookEventDto[]> {
    const events = await this.webhookEventRepo.findWithFilters(filters);
    return events.map((e) => this.toDto(e));
  }

  async countWebhookEvents(
    filters?: WebhookEventFilterOptions
  ): Promise<number> {
    return await this.webhookEventRepo.count(filters);
  }

  private toDto(event: PaymentWebhookEvent): PaymentWebhookEventDto {
    return {
      eventId: event.eventId,
      provider: event.provider,
      eventType: event.eventType,
      eventData: event.eventData,
      createdAt: event.createdAt,
    };
  }
}
