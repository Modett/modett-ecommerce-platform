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

export interface RemoveOrderItemCommand extends ICommand {
  orderId: string;
  itemId: string;
}

export class RemoveOrderItemCommandHandler
  implements ICommandHandler<RemoveOrderItemCommand, CommandResult<Order>>
{
  constructor(private readonly orderService: OrderManagementService) {}

  async handle(
    command: RemoveOrderItemCommand
  ): Promise<CommandResult<Order>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.orderId || command.orderId.trim().length === 0) {
        errors.push("orderId: Order ID is required");
      }

      if (!command.itemId || command.itemId.trim().length === 0) {
        errors.push("itemId: Item ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<Order>("Validation failed", errors);
      }

      // Execute service
      const order = await this.orderService.removeOrderItem({
        orderId: command.orderId,
        itemId: command.itemId,
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

export { RemoveOrderItemCommandHandler as RemoveOrderItemHandler };
