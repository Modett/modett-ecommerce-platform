import { OrderManagementService } from '../services/order-management.service';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { CommandResult } from '../commands/create-order.command';

export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetOrderItemQuery extends IQuery {
  itemId: string;
}

export interface OrderItemResult {
  orderItemId: string;
  orderId: string;
  variantId: string;
  quantity: number;
  productSnapshot: {
    productId: string;
    variantId: string;
    sku: string;
    name: string;
    variantName?: string;
    price: number;
    imageUrl?: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    attributes?: Record<string, any>;
  };
  isGift: boolean;
  giftMessage?: string;
  subtotal: number;
}

export class GetOrderItemHandler
  implements IQueryHandler<GetOrderItemQuery, CommandResult<OrderItemResult>>
{
  constructor(private readonly orderManagementService: OrderManagementService) {}

  async handle(
    query: GetOrderItemQuery
  ): Promise<CommandResult<OrderItemResult>> {
    try {
      // Validate
      if (!query.itemId || query.itemId.trim().length === 0) {
        return CommandResult.failure<OrderItemResult>(
          'itemId is required',
          ['itemId']
        );
      }

      // Get order item
      const item = await this.orderManagementService.getOrderItem(query.itemId);

      if (!item) {
        return CommandResult.failure<OrderItemResult>('Order item not found');
      }

      const result: OrderItemResult = {
        orderItemId: item.getOrderItemId(),
        orderId: item.getOrderId(),
        variantId: item.getVariantId(),
        quantity: item.getQuantity(),
        productSnapshot: item.getProductSnapshot().toJSON(),
        isGift: item.isGiftItem(),
        giftMessage: item.getGiftMessage(),
        subtotal: item.calculateSubtotal(),
      };

      return CommandResult.success<OrderItemResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<OrderItemResult>(
          'Failed to retrieve order item',
          [error.message]
        );
      }

      return CommandResult.failure<OrderItemResult>(
        'An unexpected error occurred while retrieving order item'
      );
    }
  }
}
