import {
  LoyaltyService,
  RedeemPointsDto,
  LoyaltyAccountDto,
} from "../services/loyalty.service.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface RedeemLoyaltyPointsCommand extends ICommand {
  userId: string;
  programId: string;
  points: number;
  orderId: string;
}

export class RedeemLoyaltyPointsHandler
  implements
    ICommandHandler<
      RedeemLoyaltyPointsCommand,
      CommandResult<LoyaltyAccountDto>
    >
{
  constructor(private readonly loyaltyService: LoyaltyService) {}

  async handle(
    command: RedeemLoyaltyPointsCommand
  ): Promise<CommandResult<LoyaltyAccountDto>> {
    try {
      // Validate command
      if (!command.userId) {
        return CommandResult.failure<LoyaltyAccountDto>("User ID is required", [
          "userId",
        ]);
      }

      if (!command.programId) {
        return CommandResult.failure<LoyaltyAccountDto>(
          "Program ID is required",
          ["programId"]
        );
      }

      if (!command.points || command.points <= 0) {
        return CommandResult.failure<LoyaltyAccountDto>(
          "Points must be greater than 0",
          ["points"]
        );
      }

      if (!command.orderId) {
        return CommandResult.failure<LoyaltyAccountDto>(
          "Order ID is required",
          ["orderId"]
        );
      }

      const dto: RedeemPointsDto = {
        userId: command.userId,
        programId: command.programId,
        points: command.points,
        orderId: command.orderId,
      };

      const account = await this.loyaltyService.redeemPoints(dto);

      return CommandResult.success<LoyaltyAccountDto>(account);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<LoyaltyAccountDto>(
          "Failed to redeem loyalty points",
          [error.message]
        );
      }

      return CommandResult.failure<LoyaltyAccountDto>(
        "An unexpected error occurred while redeeming loyalty points"
      );
    }
  }
}
