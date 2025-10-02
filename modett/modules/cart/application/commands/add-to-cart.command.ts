import { PromoData } from "../../domain/value-objects/applied-promos.vo";
import { CartManagementService, CartDto } from "../services/cart-management.service";

// Base interfaces
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

export interface AddToCartCommand extends ICommand {
  cartId?: string;
  userId?: string;
  guestToken?: string;
  variantId: string;
  quantity: number;
  appliedPromos?: PromoData[];
  isGift?: boolean;
  giftMessage?: string;
  createReservation?: boolean;
}

export class AddToCartHandler implements ICommandHandler<AddToCartCommand, CommandResult<CartDto>> {
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(command: AddToCartCommand): Promise<CommandResult<CartDto>> {
    try {
      // Validate command
      if (!command.variantId) {
        return CommandResult.failure<CartDto>(
          'Variant ID is required',
          ['variantId']
        );
      }

      if (!command.quantity || command.quantity <= 0) {
        return CommandResult.failure<CartDto>(
          'Quantity must be greater than 0',
          ['quantity']
        );
      }

      // Validate that at least one identifier is provided
      // Note: cartId is optional - if not provided, cart will be found/created using userId or guestToken
      const hasUserIdentifier = command.userId || command.guestToken;

      if (!hasUserIdentifier && !command.cartId) {
        return CommandResult.failure<CartDto>(
          'Either userId or guestToken is required',
          ['userId', 'guestToken']
        );
      }

      // Validate that user doesn't provide both userId and guestToken
      if (command.userId && command.guestToken) {
        return CommandResult.failure<CartDto>(
          'Cannot provide both userId and guestToken',
          ['userId', 'guestToken']
        );
      }

      const cart = await this.cartManagementService.addToCart({
        cartId: command.cartId,
        userId: command.userId,
        guestToken: command.guestToken,
        variantId: command.variantId,
        quantity: command.quantity,
        appliedPromos: command.appliedPromos,
        isGift: command.isGift,
        giftMessage: command.giftMessage,
        createReservation: command.createReservation,
      });

      return CommandResult.success<CartDto>(cart);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto>(
          'Failed to add item to cart',
          [error.message]
        );
      }

      return CommandResult.failure<CartDto>(
        'An unexpected error occurred while adding item to cart'
      );
    }
  }
}