import { OrderManagementService } from '../services/order-management.service';
import { Order } from '../../domain/entities/order.entity';
import { CommandResult } from '../commands/create-order.command';

// Query interfaces
export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetOrderQuery extends IQuery {
  orderId?: string;
  orderNumber?: string;
}

export interface OrderResult {
  orderId: string;
  orderNumber: string;
  userId?: string;
  guestToken?: string;
  items: Array<{
    orderItemId: string;
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
  }>;
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  status: string;
  source: string;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetOrderHandler implements IQueryHandler<GetOrderQuery, CommandResult<OrderResult>> {
  constructor(
    private readonly orderManagementService: OrderManagementService
  ) {}

  async handle(query: GetOrderQuery): Promise<CommandResult<OrderResult>> {
    try {
      // Validate that either orderId or orderNumber is provided
      if (!query.orderId && !query.orderNumber) {
        return CommandResult.failure<OrderResult>(
          'Either orderId or orderNumber is required',
          ['orderId', 'orderNumber']
        );
      }

      // Get order by ID or order number
      let order: Order | null;
      if (query.orderId) {
        order = await this.orderManagementService.getOrderById(query.orderId);
      } else if (query.orderNumber) {
        order = await this.orderManagementService.getOrderByOrderNumber(query.orderNumber);
      } else {
        order = null;
      }

      if (!order) {
        return CommandResult.failure<OrderResult>(
          'Order not found'
        );
      }

      const result: OrderResult = {
        orderId: order.getOrderId().toString(),
        orderNumber: order.getOrderNumber().toString(),
        userId: order.getUserId(),
        guestToken: order.getGuestToken(),
        items: order.getItems().map((item) => ({
          orderItemId: item.getOrderItemId(),
          variantId: item.getVariantId(),
          quantity: item.getQuantity(),
          productSnapshot: item.getProductSnapshot().toJSON(),
          isGift: item.isGiftItem(),
          giftMessage: item.getGiftMessage(),
        })),
        totals: order.getTotals().toJSON(),
        status: order.getStatus().toString(),
        source: order.getSource().toString(),
        currency: order.getCurrency().toString(),
        createdAt: order.getCreatedAt(),
        updatedAt: order.getUpdatedAt()
      };

      return CommandResult.success<OrderResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<OrderResult>(
          'Failed to retrieve order',
          [error.message]
        );
      }

      return CommandResult.failure<OrderResult>(
        'An unexpected error occurred while retrieving order'
      );
    }
  }
}
