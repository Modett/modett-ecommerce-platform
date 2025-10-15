import { ICommand, ICommandHandler, CommandResult } from "./add-stock.command";
import { StockManagementService } from "../../services/stock-management.service";
import { Stock } from "../../../domain/entities/stock.entity";

// ICommand and ICommandHandler are exported from add-stock.command.ts

export interface FulfillReservationCommand extends ICommand {
  variantId: string;
  locationId: string;
  quantity: number;
}

export class FulfillReservationCommandHandler
  implements ICommandHandler<FulfillReservationCommand, CommandResult<Stock>>
{
  constructor(private readonly stockService: StockManagementService) {}

  async handle(
    command: FulfillReservationCommand
  ): Promise<CommandResult<Stock>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.variantId || command.variantId.trim().length === 0) {
        errors.push("variantId: Variant ID is required");
      }

      if (!command.locationId || command.locationId.trim().length === 0) {
        errors.push("locationId: Location ID is required");
      }

      if (!command.quantity || command.quantity <= 0) {
        errors.push("quantity: Quantity must be greater than 0");
      }

      if (errors.length > 0) {
        return CommandResult.failure<Stock>("Validation failed", errors);
      }

      // Execute service

      const stock = await this.stockService.fulfillReservation(
        command.variantId,
        command.locationId,
        command.quantity
      );

      return CommandResult.success(stock);
    } catch (error) {
      return CommandResult.failure<Stock>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

// Alias for backwards compatibility
export { FulfillReservationCommandHandler as FulfillReservationHandler };
