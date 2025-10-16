import {
  PaymentWebhookService,
  PaymentWebhookEventDto,
} from "../services/payment-webhook.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { WebhookEventFilterOptions } from "../../domain/repositories/payment-webhook-event.repository.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetWebhookEventsQuery
  extends IQuery,
    WebhookEventFilterOptions {}

export class GetWebhookEventsHandler
  implements
    IQueryHandler<
      GetWebhookEventsQuery,
      CommandResult<PaymentWebhookEventDto[]>
    >
{
  constructor(private readonly webhookService: PaymentWebhookService) {}

  async handle(
    query: GetWebhookEventsQuery
  ): Promise<CommandResult<PaymentWebhookEventDto[]>> {
    try {
      const events = await this.webhookService.getWebhookEventsWithFilters({
        provider: query.provider,
        eventType: query.eventType,
        createdAfter: query.createdAfter,
        createdBefore: query.createdBefore,
      });
      return CommandResult.success<PaymentWebhookEventDto[]>(events);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PaymentWebhookEventDto[]>(
          "Failed to get webhook events",
          [error.message]
        );
      }
      return CommandResult.failure<PaymentWebhookEventDto[]>(
        "An unexpected error occurred while retrieving webhook events"
      );
    }
  }
}
