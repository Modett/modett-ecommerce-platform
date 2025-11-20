import {
  PaymentWebhookService,
  PaymentWebhookEventDto,
} from "../services/payment-webhook.service.js";
import { WebhookEventData } from "../../domain/entities/payment-webhook-event.entity.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface ProcessWebhookEventCommand extends ICommand {
  provider: string;
  eventType: string;
  eventData: WebhookEventData;
  signature?: string;
}

export class ProcessWebhookEventHandler
  implements
    ICommandHandler<
      ProcessWebhookEventCommand,
      CommandResult<PaymentWebhookEventDto>
    >
{
  constructor(private readonly webhookService: PaymentWebhookService) {}

  async handle(
    command: ProcessWebhookEventCommand
  ): Promise<CommandResult<PaymentWebhookEventDto>> {
    try {
      const errors: string[] = [];
      if (!command.provider) errors.push("provider");
      if (!command.eventType) errors.push("eventType");
      if (!command.eventData) errors.push("eventData");
      if (errors.length > 0) {
        return CommandResult.failure<PaymentWebhookEventDto>(
          "Validation failed",
          errors
        );
      }

      const event = await this.webhookService.recordWebhookEvent({
        provider: command.provider,
        eventType: command.eventType,
        eventData: command.eventData,
        signature: command.signature,
      });
      return CommandResult.success<PaymentWebhookEventDto>(event);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PaymentWebhookEventDto>(
          "Failed to process webhook event",
          [error.message]
        );
      }
      return CommandResult.failure<PaymentWebhookEventDto>(
        "An unexpected error occurred while processing webhook event"
      );
    }
  }
}
