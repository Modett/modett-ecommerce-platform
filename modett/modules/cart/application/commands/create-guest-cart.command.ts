import {
  CartManagementService,
  CartDto,
} from "../services/cart-management.service";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./add-to-cart.command";

export interface CreateGuestCartCommand extends ICommand {
  guestToken: string;
  currency?: string;
  reservationDurationMinutes?: number;
}

export class CreateGuestCartHandler
  implements ICommandHandler<CreateGuestCartCommand, CommandResult<CartDto>>
{
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(
    command: CreateGuestCartCommand
  ): Promise<CommandResult<CartDto>> {
    try {
      // Validate command
      if (!command.guestToken) {
        return CommandResult.failure<CartDto>("Guest token is required", [
          "guestToken",
        ]);
      }

      const result = await this.cartManagementService.createGuestCart({
        guestToken: command.guestToken,
        currency: command.currency || "USD",
        reservationDurationMinutes: command.reservationDurationMinutes,
      });

      return CommandResult.success<CartDto>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto>("Failed to create guest cart", [
          error.message,
        ]);
      }

      return CommandResult.failure<CartDto>(
        "An unexpected error occurred while creating guest cart"
      );
    }
  }
}
