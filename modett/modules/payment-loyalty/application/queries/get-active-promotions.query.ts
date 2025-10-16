import { PromotionService, PromotionDto } from "../services/promotion.service.js";
import { CommandResult } from "../commands/create-payment-intent.command.js";

export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetActivePromotionsQuery extends IQuery {}

export class GetActivePromotionsHandler
  implements
    IQueryHandler<
      GetActivePromotionsQuery,
      CommandResult<PromotionDto[]>
    >
{
  constructor(private readonly promotionService: PromotionService) {}

  async handle(
    _query: GetActivePromotionsQuery
  ): Promise<CommandResult<PromotionDto[]>> {
    try {
      const promotions = await this.promotionService.getActivePromotions();
      return CommandResult.success<PromotionDto[]>(promotions);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PromotionDto[]>(
          "Failed to get active promotions",
          [error.message]
        );
      }
      return CommandResult.failure<PromotionDto[]>(
        "An unexpected error occurred while retrieving active promotions"
      );
    }
  }
}
