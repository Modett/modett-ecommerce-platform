import {
  PromotionService,
  CreatePromotionDto,
  PromotionDto,
} from "../services/promotion.service.js";
import { PromotionRule } from "../../domain/entities/promotion.entity.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface CreatePromotionCommand extends ICommand {
  code?: string;
  rule: PromotionRule;
  startsAt?: Date;
  endsAt?: Date;
  usageLimit?: number;
}

export class CreatePromotionHandler
  implements
    ICommandHandler<CreatePromotionCommand, CommandResult<PromotionDto>>
{
  constructor(private readonly promotionService: PromotionService) {}

  async handle(
    command: CreatePromotionCommand
  ): Promise<CommandResult<PromotionDto>> {
    try {
      // Validate command
      if (!command.rule) {
        return CommandResult.failure<PromotionDto>(
          "Promotion rule is required",
          ["rule"]
        );
      }

      if (!command.rule.type) {
        return CommandResult.failure<PromotionDto>(
          "Promotion rule type is required",
          ["rule.type"]
        );
      }

      const dto: CreatePromotionDto = {
        code: command.code,
        rule: command.rule,
        startsAt: command.startsAt,
        endsAt: command.endsAt,
        usageLimit: command.usageLimit,
      };

      const promotion = await this.promotionService.createPromotion(dto);

      return CommandResult.success<PromotionDto>(promotion);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PromotionDto>(
          "Failed to create promotion",
          [error.message]
        );
      }

      return CommandResult.failure<PromotionDto>(
        "An unexpected error occurred while creating promotion"
      );
    }
  }
}
