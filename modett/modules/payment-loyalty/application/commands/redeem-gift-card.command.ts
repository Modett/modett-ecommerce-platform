import {
  GiftCardService,
  RedeemGiftCardDto,
  GiftCardDto,
} from "../services/gift-card.service.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface RedeemGiftCardCommand extends ICommand {
  giftCardId: string;
  amount: number;
  orderId: string;
}

export class RedeemGiftCardHandler
  implements ICommandHandler<RedeemGiftCardCommand, CommandResult<GiftCardDto>>
{
  constructor(private readonly giftCardService: GiftCardService) {}

  async handle(
    command: RedeemGiftCardCommand
  ): Promise<CommandResult<GiftCardDto>> {
    try {
      // Validate command
      if (!command.giftCardId) {
        return CommandResult.failure<GiftCardDto>("Gift card ID is required", [
          "giftCardId",
        ]);
      }

      if (!command.amount || command.amount <= 0) {
        return CommandResult.failure<GiftCardDto>(
          "Redemption amount must be greater than 0",
          ["amount"]
        );
      }

      if (!command.orderId) {
        return CommandResult.failure<GiftCardDto>("Order ID is required", [
          "orderId",
        ]);
      }

      const dto: RedeemGiftCardDto = {
        giftCardId: command.giftCardId,
        amount: command.amount,
        orderId: command.orderId,
      };

      const giftCard = await this.giftCardService.redeemGiftCard(dto);

      return CommandResult.success<GiftCardDto>(giftCard);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<GiftCardDto>(
          "Failed to redeem gift card",
          [error.message]
        );
      }

      return CommandResult.failure<GiftCardDto>(
        "An unexpected error occurred while redeeming gift card"
      );
    }
  }
}
