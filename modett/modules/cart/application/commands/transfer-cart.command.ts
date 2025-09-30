import { CartManagementService, CartDto } from "../services/cart-management.service";
import { ICommand, ICommandHandler, CommandResult } from "./add-to-cart.command";

export interface TransferCartCommand extends ICommand {
  guestToken: string;
  userId: string;
  mergeWithExisting?: boolean;
}

export class TransferCartHandler implements ICommandHandler<TransferCartCommand, CommandResult<CartDto>> {
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(command: TransferCartCommand): Promise<CommandResult<CartDto>> {
    try {
      // Validate command
      if (!command.guestToken) {
        return CommandResult.failure<CartDto>(
          'Guest token is required',
          ['guestToken']
        );
      }

      if (!command.userId) {
        return CommandResult.failure<CartDto>(
          'User ID is required',
          ['userId']
        );
      }

      const cart = await this.cartManagementService.transferGuestCartToUser({
        guestToken: command.guestToken,
        userId: command.userId,
        mergeWithExisting: command.mergeWithExisting,
      });

      return CommandResult.success<CartDto>(cart);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto>(
          'Failed to transfer cart',
          [error.message]
        );
      }

      return CommandResult.failure<CartDto>(
        'An unexpected error occurred while transferring cart'
      );
    }
  }
}