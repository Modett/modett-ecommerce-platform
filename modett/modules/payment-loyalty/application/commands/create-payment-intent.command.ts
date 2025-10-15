import {
  PaymentService,
  CreatePaymentIntentDto,
  PaymentIntentDto,
} from "../services/payment.service.js";

export interface ICommand {
  readonly commandId?: string;
  readonly timestamp?: Date;
}

export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  handle(command: TCommand): Promise<TResult>;
}

export class CommandResult<T = any> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public errors?: string[]
  ) {}

  static success<T>(data?: T): CommandResult<T> {
    return new CommandResult(true, data);
  }

  static failure<T>(error: string, errors?: string[]): CommandResult<T> {
    return new CommandResult<T>(false, undefined, error, errors);
  }
}

export interface CreatePaymentIntentCommand extends ICommand {
  orderId: string;
  provider: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  clientSecret?: string;
}

export class CreatePaymentIntentHandler
  implements
    ICommandHandler<CreatePaymentIntentCommand, CommandResult<PaymentIntentDto>>
{
  constructor(private readonly paymentService: PaymentService) {}

  async handle(
    command: CreatePaymentIntentCommand
  ): Promise<CommandResult<PaymentIntentDto>> {
    try {
      // Validate command
      if (!command.orderId) {
        return CommandResult.failure<PaymentIntentDto>("Order ID is required", [
          "orderId",
        ]);
      }

      if (!command.provider) {
        return CommandResult.failure<PaymentIntentDto>("Provider is required", [
          "provider",
        ]);
      }

      if (!command.amount || command.amount <= 0) {
        return CommandResult.failure<PaymentIntentDto>(
          "Amount must be greater than 0",
          ["amount"]
        );
      }

      const dto: CreatePaymentIntentDto = {
        orderId: command.orderId,
        provider: command.provider,
        amount: command.amount,
        currency: command.currency,
        idempotencyKey: command.idempotencyKey,
        clientSecret: command.clientSecret,
      };

      const paymentIntent = await this.paymentService.createPaymentIntent(dto);

      return CommandResult.success<PaymentIntentDto>(paymentIntent);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PaymentIntentDto>(
          "Failed to create payment intent",
          [error.message]
        );
      }

      return CommandResult.failure<PaymentIntentDto>(
        "An unexpected error occurred while creating payment intent"
      );
    }
  }
}
