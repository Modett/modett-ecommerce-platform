import {
  GiftCardService,
  GiftCardTransactionDto,
} from "../services/gift-card.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetGiftCardTransactionsQuery extends IQuery {
  giftCardId: string;
}

export class GetGiftCardTransactionsHandler
  implements
    IQueryHandler<
      GetGiftCardTransactionsQuery,
      CommandResult<GiftCardTransactionDto[]>
    >
{
  constructor(private readonly giftCardService: GiftCardService) {}

  async handle(
    query: GetGiftCardTransactionsQuery
  ): Promise<CommandResult<GiftCardTransactionDto[]>> {
    try {
      if (!query.giftCardId) {
        return CommandResult.failure<GiftCardTransactionDto[]>(
          "giftCardId is required",
          ["giftCardId"]
        );
      }

      const txns = await this.giftCardService.getGiftCardTransactions(
        query.giftCardId
      );
      return CommandResult.success<GiftCardTransactionDto[]>(txns);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<GiftCardTransactionDto[]>(
          "Failed to get gift card transactions",
          [error.message]
        );
      }
      return CommandResult.failure<GiftCardTransactionDto[]>(
        "An unexpected error occurred while retrieving gift card transactions"
      );
    }
  }
}
