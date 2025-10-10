import { OrderManagementService } from "../services/order-management.service";
import { Order } from "../../domain/entities/order.entity";

// Base interfaces
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

export interface CreateOrderCommand extends ICommand {
  userId?: string;
  guestToken?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    isGift?: boolean;
    giftMessage?: string;
  }>;
  source?: string;
  currency: string;
}

export class CreateOrderCommandHandler
  implements ICommandHandler<CreateOrderCommand, CommandResult<Order>>
{
  constructor(private readonly orderService: OrderManagementService) {}

  async handle(command: CreateOrderCommand): Promise<CommandResult<Order>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.userId && !command.guestToken) {
        errors.push("Either userId or guestToken is required");
      }

      if (command.userId && command.guestToken) {
        errors.push("Cannot have both userId and guestToken");
      }

      // Validate items
      if (!command.items || command.items.length === 0) {
        errors.push("items: At least one item is required");
      } else {
        command.items.forEach((item, index) => {
          if (!item.variantId || item.variantId.trim().length === 0) {
            errors.push(`items[${index}].variantId: Variant ID is required`);
          }

          if (!item.quantity || item.quantity <= 0) {
            errors.push(
              `items[${index}].quantity: Quantity must be greater than 0`
            );
          }

          if (
            item.isGift &&
            item.giftMessage &&
            item.giftMessage.length > 500
          ) {
            errors.push(
              `items[${index}].giftMessage: Gift message cannot exceed 500 characters`
            );
          }
        });
      }

      if (!command.currency || command.currency.trim().length === 0) {
        errors.push("currency: Currency is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<Order>("Validation failed", errors);
      }

      // Execute service - service will fetch variant details from database
      const order = await this.orderService.createOrder({
        userId: command.userId,
        guestToken: command.guestToken,
        items: command.items, // Simplified items - service will fetch variant details
        source: command.source || "web",
        currency: command.currency,
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

// Alias for backwards compatibility
export { CreateOrderCommandHandler as CreateOrderHandler };
