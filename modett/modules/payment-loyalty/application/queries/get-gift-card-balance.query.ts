import { GiftCardService } from "../services/gift-card.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetGiftCardBalanceQuery extends IQuery {
  codeOrId: string;
}

export class GetGiftCardBalanceHandler
  implements IQueryHandler<GetGiftCardBalanceQuery, CommandResult<number>>
{
  constructor(private readonly giftCardService: GiftCardService) {}

  async handle(query: GetGiftCardBalanceQuery): Promise<CommandResult<number>> {
    try {
      if (!query.codeOrId) {
        return CommandResult.failure<number>("codeOrId is required", [
          "codeOrId",
        ]);
      }

      const balance = await this.giftCardService.getGiftCardBalance(
        query.codeOrId
      );
      if (balance === null) {
        return CommandResult.failure<number>("Gift card not found");
      }
      return CommandResult.success<number>(balance);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<number>(
          "Failed to get gift card balance",
          [error.message]
        );
      }
      return CommandResult.failure<number>(
        "An unexpected error occurred while retrieving gift card balance"
      );
    }
  }
}
