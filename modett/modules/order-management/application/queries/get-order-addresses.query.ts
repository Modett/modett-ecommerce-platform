import { OrderManagementService } from "../services/order-management.service";
import { CommandResult } from "../commands/create-order.command";

// Query interfaces
export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetOrderAddressesQuery extends IQuery {
  orderId: string;
}

export interface OrderAddressResult {
  orderId: string;
  billingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
  isSameAddress: boolean;
}

export class GetOrderAddressesHandler
  implements IQueryHandler<GetOrderAddressesQuery, CommandResult<OrderAddressResult>>
{
  constructor(private readonly orderManagementService: OrderManagementService) {}

  async handle(
    query: GetOrderAddressesQuery
  ): Promise<CommandResult<OrderAddressResult>> {
    try {
      // Validate query
      if (!query.orderId || query.orderId.trim().length === 0) {
        return CommandResult.failure<OrderAddressResult>("Order ID is required");
      }

      // Get order addresses
      const orderAddress = await this.orderManagementService.getOrderAddress(
        query.orderId
      );

      if (!orderAddress) {
        return CommandResult.failure<OrderAddressResult>(
          "Order addresses not found"
        );
      }

      const result: OrderAddressResult = {
        orderId: orderAddress.getOrderId(),
        billingAddress: orderAddress.getBillingAddress().toJSON(),
        shippingAddress: orderAddress.getShippingAddress().toJSON(),
        isSameAddress: orderAddress.isSameAddress(),
      };

      return CommandResult.success<OrderAddressResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<OrderAddressResult>(
          "Failed to retrieve order addresses",
          [error.message]
        );
      }

      return CommandResult.failure<OrderAddressResult>(
        "An unexpected error occurred while retrieving order addresses"
      );
    }
  }
}
