import {
  LoyaltyTransactionService,
  LoyaltyTransactionDto,
} from "../services/loyalty-transaction.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetLoyaltyTransactionsQuery extends IQuery {
  accountId?: string;
  orderId?: string;
}

export class GetLoyaltyTransactionsHandler
  implements
    IQueryHandler<
      GetLoyaltyTransactionsQuery,
      CommandResult<LoyaltyTransactionDto[]>
    >
{
  constructor(private readonly loyaltyTxnService: LoyaltyTransactionService) {}

  async handle(
    query: GetLoyaltyTransactionsQuery
  ): Promise<CommandResult<LoyaltyTransactionDto[]>> {
    try {
      if (!query.accountId && !query.orderId) {
        return CommandResult.failure<LoyaltyTransactionDto[]>(
          "Either accountId or orderId is required",
          ["accountId", "orderId"]
        );
      }

      if (query.accountId) {
        const txns =
          await this.loyaltyTxnService.getLoyaltyTransactionsByAccountId(
            query.accountId
          );
        return CommandResult.success<LoyaltyTransactionDto[]>(txns);
      }

      const txns = await this.loyaltyTxnService.getLoyaltyTransactionsByOrderId(
        query.orderId as string
      );
      return CommandResult.success<LoyaltyTransactionDto[]>(txns);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<LoyaltyTransactionDto[]>(
          "Failed to get loyalty transactions",
          [error.message]
        );
      }
      return CommandResult.failure<LoyaltyTransactionDto[]>(
        "An unexpected error occurred while retrieving loyalty transactions"
      );
    }
  }
}
