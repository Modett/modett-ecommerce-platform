import { OrderManagementService } from "../services/order-management.service";
import { Order } from "../../domain/entities/order.entity";

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

export interface AddOrderItemCommand extends ICommand {
  orderId: string;
  variantId: string;
  quantity: number;
  isGift?: boolean;
  giftMessage?: string;
}

export class AddOrderItemCommandHandler
  implements ICommandHandler<AddOrderItemCommand, CommandResult<Order>>
{
  constructor(private readonly orderService: OrderManagementService) {}

  async handle(command: AddOrderItemCommand): Promise<CommandResult<Order>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.orderId || command.orderId.trim().length === 0) {
        errors.push("orderId: Order ID is required");
      }

      if (!command.variantId || command.variantId.trim().length === 0) {
        errors.push("variantId: Variant ID is required");
      }

      if (!command.quantity || command.quantity <= 0) {
        errors.push("quantity: Quantity must be greater than 0");
      }

      if (
        command.isGift &&
        command.giftMessage &&
        command.giftMessage.length > 500
      ) {
        errors.push("giftMessage: Gift message cannot exceed 500 characters");
      }

      if (errors.length > 0) {
        return CommandResult.failure<Order>("Validation failed", errors);
      }

      // Execute service
      const order = await this.orderService.addOrderItem({
        orderId: command.orderId,
        variantId: command.variantId,
        quantity: command.quantity,
        isGift: command.isGift || false,
        giftMessage: command.giftMessage,
      });

      return CommandResult.success(order);
    } catch (error) {
      return CommandResult.failure<Order>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { AddOrderItemCommandHandler as AddOrderItemHandler };
