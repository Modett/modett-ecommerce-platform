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

export interface GetOrderItemsQuery extends IQuery {
  orderId: string;
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

export class GetOrderItemsHandler
  implements IQueryHandler<GetOrderItemsQuery, CommandResult<OrderItemResult[]>>
{
  constructor(private readonly orderManagementService: OrderManagementService) {}

  async handle(
    query: GetOrderItemsQuery
  ): Promise<CommandResult<OrderItemResult[]>> {
    try {
      // Validate
      if (!query.orderId || query.orderId.trim().length === 0) {
        return CommandResult.failure<OrderItemResult[]>(
          'orderId is required',
          ['orderId']
        );
      }

      // Get order items
      const items = await this.orderManagementService.getOrderItems(
        query.orderId
      );

      const results: OrderItemResult[] = items.map((item) => ({
        orderItemId: item.getOrderItemId(),
        orderId: item.getOrderId(),
        variantId: item.getVariantId(),
        quantity: item.getQuantity(),
        productSnapshot: item.getProductSnapshot().toJSON(),
        isGift: item.isGiftItem(),
        giftMessage: item.getGiftMessage(),
        subtotal: item.calculateSubtotal(),
      }));

      return CommandResult.success<OrderItemResult[]>(results);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<OrderItemResult[]>(
          'Failed to retrieve order items',
          [error.message]
        );
      }

      return CommandResult.failure<OrderItemResult[]>(
        'An unexpected error occurred while retrieving order items'
      );
    }
  }
}
