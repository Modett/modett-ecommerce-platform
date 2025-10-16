import {
  PromotionService,
  RecordPromotionUsageDto,
  PromotionUsageDto,
} from "../services/promotion.service.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface RecordPromotionUsageCommand extends ICommand {
  promoId: string;
  orderId: string;
  discountAmount: number;
  currency?: string;
}

export class RecordPromotionUsageHandler
  implements
    ICommandHandler<
      RecordPromotionUsageCommand,
      CommandResult<PromotionUsageDto>
    >
{
  constructor(private readonly promotionService: PromotionService) {}

  async handle(
    command: RecordPromotionUsageCommand
  ): Promise<CommandResult<PromotionUsageDto>> {
    try {
      const errors: string[] = [];
      if (!command.promoId) errors.push("promoId");
      if (!command.orderId) errors.push("orderId");
      if (!command.discountAmount || command.discountAmount <= 0)
        errors.push("discountAmount");

      if (errors.length > 0) {
        return CommandResult.failure<PromotionUsageDto>(
          "Validation failed",
          errors
        );
      }

      const dto: RecordPromotionUsageDto = {
        promoId: command.promoId,
        orderId: command.orderId,
        discountAmount: command.discountAmount,
        currency: command.currency,
      };

      const usage = await this.promotionService.recordPromotionUsage(dto);
      return CommandResult.success<PromotionUsageDto>(usage);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PromotionUsageDto>(
          "Failed to record promotion usage",
          [error.message]
        );
      }
      return CommandResult.failure<PromotionUsageDto>(
        "An unexpected error occurred while recording promotion usage"
      );
    }
  }
}
