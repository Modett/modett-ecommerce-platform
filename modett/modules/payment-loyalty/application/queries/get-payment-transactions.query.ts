import {
  PaymentService,
  PaymentTransactionDto,
} from "../services/payment.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetPaymentTransactionsQuery extends IQuery {
  intentId: string;
  userId?: string;
}

export class GetPaymentTransactionsHandler
  implements
    IQueryHandler<
      GetPaymentTransactionsQuery,
      CommandResult<PaymentTransactionDto[]>
    >
{
  constructor(private readonly paymentService: PaymentService) {}

  async handle(
    query: GetPaymentTransactionsQuery
  ): Promise<CommandResult<PaymentTransactionDto[]>> {
    try {
      if (!query.intentId) {
        return CommandResult.failure<PaymentTransactionDto[]>(
          "intentId is required",
          ["intentId"]
        );
      }

      const txns = await this.paymentService.getPaymentTransactions(
        query.intentId,
        query.userId
      );
      return CommandResult.success<PaymentTransactionDto[]>(txns);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PaymentTransactionDto[]>(
          "Failed to get payment transactions",
          [error.message]
        );
      }
      return CommandResult.failure<PaymentTransactionDto[]>(
        "An unexpected error occurred while retrieving payment transactions"
      );
    }
  }
}
