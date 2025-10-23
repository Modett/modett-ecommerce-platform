import {
  CartManagementService,
  CartDto,
} from "../services/cart-management.service";
import {
  ICommand,
  ICommandHandler,
  CommandResult,
} from "./add-to-cart.command";

export interface CreateUserCartCommand extends ICommand {
  userId: string;
  currency?: string;
  reservationDurationMinutes?: number;
}

export class CreateUserCartHandler
  implements ICommandHandler<CreateUserCartCommand, CommandResult<CartDto>>
{
  constructor(private readonly cartManagementService: CartManagementService) {}

  async handle(
    command: CreateUserCartCommand
  ): Promise<CommandResult<CartDto>> {
    try {
      // Validate command
      if (!command.userId) {
        return CommandResult.failure<CartDto>("User ID is required", [
          "userId",
        ]);
      }

      const result = await this.cartManagementService.createUserCart({
        userId: command.userId,
        currency: command.currency || "USD",
        reservationDurationMinutes: command.reservationDurationMinutes,
      });

      return CommandResult.success<CartDto>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<CartDto>("Failed to create user cart", [
          error.message,
        ]);
      }

      return CommandResult.failure<CartDto>(
        "An unexpected error occurred while creating user cart"
      );
    }
  }
}
