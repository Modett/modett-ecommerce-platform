import { ICommand, ICommandHandler, CommandResult } from "./add-stock.command";
import { StockManagementService } from "../../services/stock-management.service";
import { Stock } from "../../../domain/entities/stock.entity";

// ICommand and ICommandHandler are exported from add-stock.command.ts

export interface AdjustStockCommand extends ICommand {
  variantId: string;
  locationId: string;
  quantityDelta: number;
  reason: string;
}

export class AdjustStockCommandHandler
  implements ICommandHandler<AdjustStockCommand, CommandResult<Stock>>
{
  constructor(private readonly stockService: StockManagementService) {}

  async handle(command: AdjustStockCommand): Promise<CommandResult<Stock>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.variantId || command.variantId.trim().length === 0) {
        errors.push("variantId: Variant ID is required");
      }

      if (!command.locationId || command.locationId.trim().length === 0) {
        errors.push("locationId: Location ID is required");
      }

      if (
        command.quantityDelta === undefined ||
        command.quantityDelta === null
      ) {
        errors.push("quantityDelta: Quantity delta is required");
      }

      if (command.quantityDelta === 0) {
        errors.push("quantityDelta: Quantity delta cannot be zero");
      }

      if (!command.reason || command.reason.trim().length === 0) {
        errors.push("reason: Reason is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<Stock>("Validation failed", errors);
      }

      // Execute service
      const stock = await this.stockService.adjustStock(
        command.variantId,
        command.locationId,
        command.quantityDelta,
        command.reason
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
export { AdjustStockCommandHandler as AdjustStockHandler };
