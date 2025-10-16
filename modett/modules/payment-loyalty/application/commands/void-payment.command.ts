import {
  PaymentService,
  VoidPaymentDto,
  PaymentIntentDto,
} from "../services/payment.service.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface VoidPaymentCommand extends ICommand {
  intentId: string;
  pspReference?: string;
}

export class VoidPaymentHandler
  implements ICommandHandler<VoidPaymentCommand, CommandResult<PaymentIntentDto>>
{
  constructor(private readonly paymentService: PaymentService) {}

  async handle(
    command: VoidPaymentCommand
  ): Promise<CommandResult<PaymentIntentDto>> {
    try {
      if (!command.intentId) {
        return CommandResult.failure<PaymentIntentDto>(
          "Intent ID is required",
          ["intentId"]
        );
      }

      const dto: VoidPaymentDto = {
        intentId: command.intentId,
        pspReference: command.pspReference,
      };

      const result = await this.paymentService.voidPayment(dto);
      return CommandResult.success<PaymentIntentDto>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PaymentIntentDto>(
          "Failed to void payment",
          [error.message]
        );
      }
      return CommandResult.failure<PaymentIntentDto>(
        "An unexpected error occurred while voiding payment"
      );
    }
  }
}

