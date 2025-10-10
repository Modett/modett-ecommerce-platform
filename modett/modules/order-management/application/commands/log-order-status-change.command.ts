import { OrderManagementService } from '../services/order-management.service';
import { OrderStatusHistory } from '../../domain/entities/order-status-history.entity';

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

export interface LogOrderStatusChangeCommand extends ICommand {
  orderId: string;
  fromStatus?: string;
  toStatus: string;
  changedBy?: string;
}

export class LogOrderStatusChangeCommandHandler
  implements
    ICommandHandler<LogOrderStatusChangeCommand, CommandResult<OrderStatusHistory>>
{
  constructor(private readonly orderService: OrderManagementService) {}

  async handle(
    command: LogOrderStatusChangeCommand
  ): Promise<CommandResult<OrderStatusHistory>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.orderId || command.orderId.trim().length === 0) {
        errors.push('orderId: Order ID is required');
      }

      if (!command.toStatus || command.toStatus.trim().length === 0) {
        errors.push('toStatus: To status is required');
      }

      if (errors.length > 0) {
        return CommandResult.failure<OrderStatusHistory>('Validation failed', errors);
      }

      // Execute service
      const statusHistory = await this.orderService.logOrderStatusChange({
        orderId: command.orderId,
        fromStatus: command.fromStatus,
        toStatus: command.toStatus,
        changedBy: command.changedBy,
      });

      return CommandResult.success(statusHistory);
    } catch (error) {
      return CommandResult.failure<OrderStatusHistory>(
        error instanceof Error ? error.message : 'Unknown error occurred',
        [error instanceof Error ? error.message : 'Unknown error']
      );
    }
  }
}

// Alias for backwards compatibility
export { LogOrderStatusChangeCommandHandler as LogOrderStatusChangeHandler };
