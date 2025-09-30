import { CartManagementService, CartSummaryDto } from "../services/cart-management.service";
import { CommandResult } from "../commands/add-to-cart.command";
import { IQuery, IQueryHandler } from "./get-cart.query";

export interface GetCartSummaryQuery extends IQuery {
  cartId: string;
  userId?: string;
  guestToken?: string;
}

export class GetCartSummaryHandler implements IQueryHandler<GetCartSummaryQuery, CommandResult<CartSummaryDto>> {
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(query: GetCartSummaryQuery): Promise<CommandResult<CartSummaryDto>> {
    try {
      if (!query.cartId) {
        return CommandResult.failure<CartSummaryDto>(
          'Cart ID is required',
          ['cartId']
        );
      }

      const cart = await this.cartManagementService.getCart(
        query.cartId,
        query.userId,
        query.guestToken
      );

      if (!cart) {
        return CommandResult.failure<CartSummaryDto>('Cart not found');
      }

      return CommandResult.success<CartSummaryDto>(cart.summary);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartSummaryDto>(
          'Failed to retrieve cart summary',
          [error.message]
        );
      }

      return CommandResult.failure<CartSummaryDto>(
        'An unexpected error occurred while retrieving cart summary'
      );
    }
  }
}