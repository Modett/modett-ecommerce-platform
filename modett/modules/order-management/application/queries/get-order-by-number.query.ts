import { OrderManagementService } from '../services/order-management.service';
import { Order } from '../../domain/entities/order.entity';
import { CommandResult } from '../commands/create-order.command';

export interface GetOrderByNumberQuery {
  orderNumber: string;
}

export class GetOrderByNumberQueryHandler {
  constructor(private readonly orderService: OrderManagementService) {}

  async handle(
    query: GetOrderByNumberQuery
  ): Promise<CommandResult<Order>> {
    try {
      // Validation
      if (!query.orderNumber || query.orderNumber.trim().length === 0) {
        return CommandResult.failure<Order>(
          'Order number is required',
          ['orderNumber']
        );
      }

      // Execute service
      const order = await this.orderService.getOrderByOrderNumber(
        query.orderNumber
      );

      if (!order) {
        return CommandResult.failure<Order>('Order not found');
      }

      return CommandResult.success<Order>(order);
    } catch (error) {
      return CommandResult.failure<Order>(
        error instanceof Error ? error.message : 'Unknown error occurred'
      );
    }
  }
}
