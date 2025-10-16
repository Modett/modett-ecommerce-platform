import {
  PaymentService,
  PaymentIntentDto,
} from "../services/payment.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetPaymentIntentQuery extends IQuery {
  intentId?: string;
  orderId?: string;
}

export class GetPaymentIntentHandler
  implements
    IQueryHandler<GetPaymentIntentQuery, CommandResult<PaymentIntentDto>>
{
  constructor(private readonly paymentService: PaymentService) {}

  async handle(
    query: GetPaymentIntentQuery
  ): Promise<CommandResult<PaymentIntentDto>> {
    try {
      if (!query.intentId && !query.orderId) {
        return CommandResult.failure<PaymentIntentDto>(
          "Either intentId or orderId is required",
          ["intentId", "orderId"]
        );
      }

      let intent: PaymentIntentDto | null = null;
      if (query.intentId) {
        intent = await this.paymentService.getPaymentIntent(query.intentId);
      } else if (query.orderId) {
        intent = await this.paymentService.getPaymentIntentByOrderId(
          query.orderId
        );
      }

      if (!intent) {
        return CommandResult.failure<PaymentIntentDto>(
          "Payment intent not found"
        );
      }

      return CommandResult.success<PaymentIntentDto>(intent);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PaymentIntentDto>(
          "Failed to get payment intent",
          [error.message]
        );
      }
      return CommandResult.failure<PaymentIntentDto>(
        "An unexpected error occurred while retrieving payment intent"
      );
    }
  }
}
