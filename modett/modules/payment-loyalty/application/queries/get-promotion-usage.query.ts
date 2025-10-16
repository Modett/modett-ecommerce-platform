import {
  PromotionService,
  PromotionUsageDto,
} from "../services/promotion.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";
import { IQuery, IQueryHandler } from "./get-active-promotions.query";

export interface GetPromotionUsageQuery extends IQuery {
  promoId: string;
}

export class GetPromotionUsageHandler
  implements
    IQueryHandler<GetPromotionUsageQuery, CommandResult<PromotionUsageDto[]>>
{
  constructor(private readonly promotionService: PromotionService) {}

  async handle(
    query: GetPromotionUsageQuery
  ): Promise<CommandResult<PromotionUsageDto[]>> {
    try {
      if (!query.promoId) {
        return CommandResult.failure<PromotionUsageDto[]>(
          "promoId is required",
          ["promoId"]
        );
      }
      const usage = await this.promotionService.getPromotionUsage(
        query.promoId
      );
      return CommandResult.success<PromotionUsageDto[]>(usage);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PromotionUsageDto[]>(
          "Failed to get promotion usage",
          [error.message]
        );
      }
      return CommandResult.failure<PromotionUsageDto[]>(
        "An unexpected error occurred while retrieving promotion usage"
      );
    }
  }
}
