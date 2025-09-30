import { CartManagementService, CartDto } from "../services/cart-management.service";
import { ICommand, ICommandHandler, CommandResult } from "./add-to-cart.command";

export interface ClearCartCommand extends ICommand {
  cartId: string;
  userId?: string;
  guestToken?: string;
}

export class ClearCartHandler implements ICommandHandler<ClearCartCommand, CommandResult<CartDto>> {
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(command: ClearCartCommand): Promise<CommandResult<CartDto>> {
    try {
      // Validate command
      if (!command.cartId) {
        return CommandResult.failure<CartDto>(
          'Cart ID is required',
          ['cartId']
        );
      }

      const cart = await this.cartManagementService.clearCart(
        command.cartId,
        command.userId,
        command.guestToken
      );

      return CommandResult.success<CartDto>(cart);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto>(
          'Failed to clear cart',
          [error.message]
        );
      }

      return CommandResult.failure<CartDto>(
        'An unexpected error occurred while clearing cart'
      );
    }
  }
}