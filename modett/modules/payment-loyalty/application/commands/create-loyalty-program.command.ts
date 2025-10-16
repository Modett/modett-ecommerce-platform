import {
  LoyaltyService,
  CreateLoyaltyProgramDto,
  LoyaltyProgramDto,
} from "../services/loyalty.service.js";
import { LoyaltyTier, EarnRule, BurnRule } from "../../domain/entities/loyalty-program.entity.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface CreateLoyaltyProgramCommand extends ICommand {
  name: string;
  earnRules: EarnRule | EarnRule[];
  burnRules: BurnRule | BurnRule[];
  tiers: LoyaltyTier[];
}

export class CreateLoyaltyProgramHandler
  implements
    ICommandHandler<
      CreateLoyaltyProgramCommand,
      CommandResult<LoyaltyProgramDto>
    >
{
  constructor(private readonly loyaltyService: LoyaltyService) {}

  async handle(
    command: CreateLoyaltyProgramCommand
  ): Promise<CommandResult<LoyaltyProgramDto>> {
    try {
      const errors: string[] = [];
      if (!command.name) errors.push("name");
      if (!command.earnRules) errors.push("earnRules");
      if (!command.burnRules) errors.push("burnRules");
      if (!command.tiers || command.tiers.length === 0) errors.push("tiers");

      if (errors.length > 0) {
        return CommandResult.failure<LoyaltyProgramDto>(
          "Validation failed",
          errors
        );
      }

      const dto: CreateLoyaltyProgramDto = {
        name: command.name,
        earnRules: command.earnRules,
        burnRules: command.burnRules,
        tiers: command.tiers,
      };

      const program = await this.loyaltyService.createLoyaltyProgram(dto);
      return CommandResult.success<LoyaltyProgramDto>(program);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<LoyaltyProgramDto>(
          "Failed to create loyalty program",
          [error.message]
        );
      }
      return CommandResult.failure<LoyaltyProgramDto>(
        "An unexpected error occurred while creating loyalty program"
      );
    }
  }
}
