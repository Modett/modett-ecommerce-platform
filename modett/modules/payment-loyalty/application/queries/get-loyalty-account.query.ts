import {
  LoyaltyService,
  LoyaltyAccountDto,
} from "../services/loyalty.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetLoyaltyAccountQuery extends IQuery {
  userId: string;
  programId: string;
}

export class GetLoyaltyAccountHandler
  implements
    IQueryHandler<GetLoyaltyAccountQuery, CommandResult<LoyaltyAccountDto>>
{
  constructor(private readonly loyaltyService: LoyaltyService) {}

  async handle(
    query: GetLoyaltyAccountQuery
  ): Promise<CommandResult<LoyaltyAccountDto>> {
    try {
      const errors: string[] = [];
      if (!query.userId) errors.push("userId");
      if (!query.programId) errors.push("programId");
      if (errors.length > 0) {
        return CommandResult.failure<LoyaltyAccountDto>(
          "Validation failed",
          errors
        );
      }

      const account = await this.loyaltyService.getLoyaltyAccount(
        query.userId,
        query.programId
      );
      if (!account) {
        return CommandResult.failure<LoyaltyAccountDto>(
          "Loyalty account not found"
        );
      }
      return CommandResult.success<LoyaltyAccountDto>(account);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<LoyaltyAccountDto>(
          "Failed to get loyalty account",
          [error.message]
        );
      }
      return CommandResult.failure<LoyaltyAccountDto>(
        "An unexpected error occurred while retrieving loyalty account"
      );
    }
  }
}
