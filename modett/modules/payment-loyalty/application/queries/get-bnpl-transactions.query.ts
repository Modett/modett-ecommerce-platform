import {
  BnplTransactionService,
  BnplTransactionDto,
} from "../services/bnpl-transaction.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetBnplTransactionsQuery extends IQuery {
  bnplId?: string;
  intentId?: string;
  orderId?: string;
  userId?: string;
}

export class GetBnplTransactionsHandler
  implements
    IQueryHandler<GetBnplTransactionsQuery, CommandResult<BnplTransactionDto[]>>
{
  constructor(private readonly bnplService: BnplTransactionService) {}

  async handle(
    query: GetBnplTransactionsQuery
  ): Promise<CommandResult<BnplTransactionDto[]>> {
    try {
      if (!query.bnplId && !query.intentId && !query.orderId) {
        return CommandResult.failure<BnplTransactionDto[]>(
          "At least one of bnplId, intentId, or orderId is required",
          ["bnplId", "intentId", "orderId"]
        );
      }

      if (query.bnplId) {
        const txn = await this.bnplService.getBnplTransaction(
          query.bnplId,
          query.userId
        );
        return CommandResult.success<BnplTransactionDto[]>(txn ? [txn] : []);
      }
      if (query.intentId) {
        const txn = await this.bnplService.getBnplTransactionByIntentId(
          query.intentId,
          query.userId
        );
        return CommandResult.success<BnplTransactionDto[]>(txn ? [txn] : []);
      }
      // orderId path
      const txns = await this.bnplService.getBnplTransactionsByOrderId(
        query.orderId as string,
        query.userId
      );
      return CommandResult.success<BnplTransactionDto[]>(txns);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<BnplTransactionDto[]>(
          "Failed to get BNPL transactions",
          [error.message]
        );
      }
      return CommandResult.failure<BnplTransactionDto[]>(
        "An unexpected error occurred while retrieving BNPL transactions"
      );
    }
  }
}
