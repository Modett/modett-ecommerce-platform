import {
  PromotionService,
  ApplyPromotionDto,
  ApplyPromotionResult,
} from "../services/promotion.service.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface ApplyPromotionCommand extends ICommand {
  promoCode: string;
  orderId?: string;
  orderAmount: number;
  currency?: string;
  products?: string[];
  categories?: string[];
}

export class ApplyPromotionHandler
  implements
    ICommandHandler<ApplyPromotionCommand, CommandResult<ApplyPromotionResult>>
{
  constructor(private readonly promotionService: PromotionService) {}

  async handle(
    command: ApplyPromotionCommand
  ): Promise<CommandResult<ApplyPromotionResult>> {
    try {
      // Validate command
      if (!command.promoCode) {
        return CommandResult.failure<ApplyPromotionResult>(
          "Promo code is required",
          ["promoCode"]
        );
      }

      if (!command.orderAmount || command.orderAmount <= 0) {
        return CommandResult.failure<ApplyPromotionResult>(
          "Order amount must be greater than 0",
          ["orderAmount"]
        );
      }

      const dto: ApplyPromotionDto = {
        promoCode: command.promoCode,
        orderId: command.orderId,
        orderAmount: command.orderAmount,
        currency: command.currency,
        products: command.products,
        categories: command.categories,
      };

      const result = await this.promotionService.applyPromotion(dto);

      if (!result.valid) {
        return CommandResult.failure<ApplyPromotionResult>(
          result.error || "Promotion is not valid",
          ["promoCode"]
        );
      }

      return CommandResult.success<ApplyPromotionResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ApplyPromotionResult>(
          "Failed to apply promotion",
          [error.message]
        );
      }

      return CommandResult.failure<ApplyPromotionResult>(
        "An unexpected error occurred while applying promotion"
      );
    }
  }
}
