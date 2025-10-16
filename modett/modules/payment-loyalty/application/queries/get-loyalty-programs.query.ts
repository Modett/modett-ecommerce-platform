import {
  LoyaltyService,
  LoyaltyProgramDto,
} from "../services/loyalty.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetLoyaltyProgramsQuery extends IQuery {}

export class GetLoyaltyProgramsHandler
  implements
    IQueryHandler<GetLoyaltyProgramsQuery, CommandResult<LoyaltyProgramDto[]>>
{
  constructor(private readonly loyaltyService: LoyaltyService) {}

  async handle(
    _query: GetLoyaltyProgramsQuery
  ): Promise<CommandResult<LoyaltyProgramDto[]>> {
    try {
      const programs = await this.loyaltyService.getAllLoyaltyPrograms();
      return CommandResult.success<LoyaltyProgramDto[]>(programs);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<LoyaltyProgramDto[]>(
          "Failed to get loyalty programs",
          [error.message]
        );
      }
      return CommandResult.failure<LoyaltyProgramDto[]>(
        "An unexpected error occurred while retrieving loyalty programs"
      );
    }
  }
}
