import { OrderManagementService } from '../services/order-management.service';
import { Order } from '../../domain/entities/order.entity';
import { ICommand, ICommandHandler, CommandResult } from './create-order.command';

export interface UpdateOrderStatusCommand extends ICommand {
  orderId: string;
  status: string;
}

export class UpdateOrderStatusCommandHandler
  implements ICommandHandler<UpdateOrderStatusCommand, CommandResult<Order>>
{
  constructor(private readonly orderService: OrderManagementService) {}

  async handle(
    command: UpdateOrderStatusCommand
  ): Promise<CommandResult<Order>> {
    try {
      // Validation
      if (!command.orderId || command.orderId.trim().length === 0) {
        return CommandResult.failure<Order>(
          'Order ID is required',
          ['orderId: Order ID cannot be empty']
        );
      }

      if (!command.status || command.status.trim().length === 0) {
        return CommandResult.failure<Order>(
          'Status is required',
          ['status: Status cannot be empty']
        );
      }

      const validStatuses = [
        'created',
        'paid',
        'fulfilled',
        'partially_returned',
        'refunded',
        'cancelled',
      ];

      if (!validStatuses.includes(command.status)) {
        return CommandResult.failure<Order>(
          'Invalid status',
          [`status: Must be one of: ${validStatuses.join(', ')}`]
        );
      }

      // Execute service
      const order = await this.orderService.updateOrderStatus(
        command.orderId,
        command.status
      );

      if (!order) {
        return CommandResult.failure<Order>(
          'Order not found',
          ['orderId: Order does not exist']
        );
      }

      return CommandResult.success(order);
    } catch (error) {
      return CommandResult.failure<Order>(
        error instanceof Error ? error.message : 'Unknown error occurred',
        [error instanceof Error ? error.message : 'Unknown error']
      );
    }
  }
}
