import { CartManagementService, CartDto } from "../services/cart-management.service";
import { CommandResult } from "../commands/add-to-cart.command";

// Query interfaces
export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetCartQuery extends IQuery {
  cartId: string;
  userId?: string;
  guestToken?: string;
}

export class GetCartHandler implements IQueryHandler<GetCartQuery, CommandResult<CartDto | null>> {
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(query: GetCartQuery): Promise<CommandResult<CartDto | null>> {
    try {
      if (!query.cartId) {
        return CommandResult.failure<CartDto | null>(
          'Cart ID is required',
          ['cartId']
        );
      }

      // Validate that only one of userId or guestToken is provided (not both)
      if (query.userId && query.guestToken) {
        return CommandResult.failure<CartDto | null>(
          'Only one of userId or guestToken should be provided',
          ['userId', 'guestToken']
        );
      }

      const cart = await this.cartManagementService.getCart(
        query.cartId,
        query.userId,
        query.guestToken
      );

      if (!cart) {
        return CommandResult.failure<CartDto | null>('Cart not found');
      }

      return CommandResult.success<CartDto>(cart);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto | null>(
          'Failed to retrieve cart',
          [error.message]
        );
      }

      return CommandResult.failure<CartDto | null>(
        'An unexpected error occurred while retrieving cart'
      );
    }
  }
}

export interface GetActiveCartByUserQuery extends IQuery {
  userId: string;
}

export class GetActiveCartByUserHandler implements IQueryHandler<GetActiveCartByUserQuery, CommandResult<CartDto | null>> {
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(query: GetActiveCartByUserQuery): Promise<CommandResult<CartDto | null>> {
    try {
      if (!query.userId) {
        return CommandResult.failure<CartDto | null>(
          'User ID is required',
          ['userId']
        );
      }

      const cart = await this.cartManagementService.getActiveCartByUser(query.userId);

      if (!cart) {
        return CommandResult.success<CartDto | null>(null);
      }

      return CommandResult.success<CartDto>(cart);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto | null>(
          'Failed to retrieve cart',
          [error.message]
        );
      }

      return CommandResult.failure<CartDto | null>(
        'An unexpected error occurred while retrieving cart'
      );
    }
  }
}

export interface GetActiveCartByGuestTokenQuery extends IQuery {
  guestToken: string;
}

export class GetActiveCartByGuestTokenHandler implements IQueryHandler<GetActiveCartByGuestTokenQuery, CommandResult<CartDto | null>> {
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(query: GetActiveCartByGuestTokenQuery): Promise<CommandResult<CartDto | null>> {
    try {
      if (!query.guestToken) {
        return CommandResult.failure<CartDto | null>(
          'Guest token is required',
          ['guestToken']
        );
      }

      const cart = await this.cartManagementService.getActiveCartByGuestToken(query.guestToken);

      if (!cart) {
        return CommandResult.success<CartDto | null>(null);
      }

      return CommandResult.success<CartDto>(cart);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto | null>(
          'Failed to retrieve cart',
          [error.message]
        );
      }

      return CommandResult.failure<CartDto | null>(
        'An unexpected error occurred while retrieving cart'
      );
    }
  }
}