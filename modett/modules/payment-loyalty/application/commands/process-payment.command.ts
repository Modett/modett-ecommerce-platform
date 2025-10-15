import {
  PaymentService,
  ProcessPaymentDto,
  PaymentIntentDto,
} from "../services/payment.service.js";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./create-payment-intent.command.js";

export interface ProcessPaymentCommand extends ICommand {
  intentId: string;
  pspReference?: string;
}

export class ProcessPaymentHandler
  implements
    ICommandHandler<ProcessPaymentCommand, CommandResult<PaymentIntentDto>>
{
  constructor(private readonly paymentService: PaymentService) {}

  async handle(
    command: ProcessPaymentCommand
  ): Promise<CommandResult<PaymentIntentDto>> {
    try {
      // Validate command
      if (!command.intentId) {
        return CommandResult.failure<PaymentIntentDto>(
          "Intent ID is required",
          ["intentId"]
        );
      }

      const dto: ProcessPaymentDto = {
        intentId: command.intentId,
        pspReference: command.pspReference,
      };

      // Authorize and capture the payment
      const authorized = await this.paymentService.authorizePayment(dto);
      const captured = await this.paymentService.capturePayment(
        authorized.intentId,
        dto.pspReference
      );

      return CommandResult.success<PaymentIntentDto>(captured);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PaymentIntentDto>(
          "Failed to process payment",
          [error.message]
        );
      }

      return CommandResult.failure<PaymentIntentDto>(
        "An unexpected error occurred while processing payment"
      );
    }
  }
}
