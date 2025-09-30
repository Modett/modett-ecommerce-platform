import { CartManagementService, CartDto } from "../services/cart-management.service";
import { ICommand, ICommandHandler, CommandResult } from "./add-to-cart.command";

export interface UpdateCartItemCommand extends ICommand {
  cartId: string;
  variantId: string;
  quantity: number;
  userId?: string;
  guestToken?: string;
}

export class UpdateCartItemHandler implements ICommandHandler<UpdateCartItemCommand, CommandResult<CartDto>> {
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(command: UpdateCartItemCommand): Promise<CommandResult<CartDto>> {
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

      if (command.quantity < 0) {
        return CommandResult.failure<CartDto>(
          'Quantity must be non-negative',
          ['quantity']
        );
      }

      const cart = await this.cartManagementService.updateCartItem({
        cartId: command.cartId,
        variantId: command.variantId,
        quantity: command.quantity,
        userId: command.userId,
        guestToken: command.guestToken,
      });

      return CommandResult.success<CartDto>(cart);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto>(
          'Failed to update cart item',
          [error.message]
        );
      }

      return CommandResult.failure<CartDto>(
        'An unexpected error occurred while updating cart item'
      );
    }
  }
}