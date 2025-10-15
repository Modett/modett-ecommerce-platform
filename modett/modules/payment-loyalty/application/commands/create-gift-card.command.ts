import {
  GiftCardService,
  CreateGiftCardDto,
  GiftCardDto,
} from "../services/gift-card.service.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface CreateGiftCardCommand extends ICommand {
  code: string;
  initialBalance: number;
  currency?: string;
  expiresAt?: Date;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
}

export class CreateGiftCardHandler
  implements ICommandHandler<CreateGiftCardCommand, CommandResult<GiftCardDto>>
{
  constructor(private readonly giftCardService: GiftCardService) {}

  async handle(
    command: CreateGiftCardCommand
  ): Promise<CommandResult<GiftCardDto>> {
    try {
      // Validate command
      if (!command.code) {
        return CommandResult.failure<GiftCardDto>(
          "Gift card code is required",
          ["code"]
        );
      }

      if (!command.initialBalance || command.initialBalance <= 0) {
        return CommandResult.failure<GiftCardDto>(
          "Initial balance must be greater than 0",
          ["initialBalance"]
        );
      }

      const dto: CreateGiftCardDto = {
        code: command.code,
        initialBalance: command.initialBalance,
        currency: command.currency,
        expiresAt: command.expiresAt,
        recipientEmail: command.recipientEmail,
        recipientName: command.recipientName,
        message: command.message,
      };

      const giftCard = await this.giftCardService.createGiftCard(dto);

      return CommandResult.success<GiftCardDto>(giftCard);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<GiftCardDto>(
          "Failed to create gift card",
          [error.message]
        );
      }

      return CommandResult.failure<GiftCardDto>(
        "An unexpected error occurred while creating gift card"
      );
    }
  }
}
