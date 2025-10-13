import { StockManagementService } from "../../services/stock-management.service";
import { Stock } from "../../../domain/entities/stock.entity";

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

export interface AddStockCommand extends ICommand {
  variantId: string;
  locationId: string;
  quantity: number;
  reason: string;
}

export class AddStockCommandHandler
  implements ICommandHandler<AddStockCommand, CommandResult<Stock>>
{
  constructor(private readonly stockService: StockManagementService) {}

  async handle(command: AddStockCommand): Promise<CommandResult<Stock>> {
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

      if (!command.reason || command.reason.trim().length === 0) {
        errors.push("reason: Reason is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<Stock>("Validation failed", errors);
      }

      // Execute service
      const stock = await this.stockService.addStock(
        command.variantId,
        command.locationId,
        command.quantity,
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
export { AddStockCommandHandler as AddStockHandler };
