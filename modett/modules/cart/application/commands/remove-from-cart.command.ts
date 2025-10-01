import { CartManagementService, CartDto } from "../services/cart-management.service";
import { ICommand, ICommandHandler, CommandResult } from "./add-to-cart.command";

export interface RemoveFromCartCommand extends ICommand {
  cartId: string;
  variantId: string;
  userId?: string;
  guestToken?: string;
}

export class RemoveFromCartHandler implements ICommandHandler<RemoveFromCartCommand, CommandResult<CartDto>> {
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(command: RemoveFromCartCommand): Promise<CommandResult<CartDto>> {
    try {
      // Validate command
      if (!command.cartId) {
        return CommandResult.failure<CartDto>(
          'Cart ID is required',
          ['cartId']
        );
      }

      if (!command.variantId) {
        return CommandResult.failure<CartDto>(
          'Variant ID is required',
          ['variantId']
        );
      }

      // Validate that only one of userId or guestToken is provided (not both)
      if (command.userId && command.guestToken) {
        return CommandResult.failure<CartDto>(
          'Only one of userId or guestToken should be provided',
          ['userId', 'guestToken']
        );
      }

      const cart = await this.cartManagementService.removeFromCart({
        cartId: command.cartId,
        variantId: command.variantId,
        userId: command.userId,
        guestToken: command.guestToken,
      });

      return CommandResult.success<CartDto>(cart);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto>(
          'Failed to remove item from cart',
          [error.message]
        );
      }

      return CommandResult.failure<CartDto>(
        'An unexpected error occurred while removing item from cart'
      );
    }
  }
}