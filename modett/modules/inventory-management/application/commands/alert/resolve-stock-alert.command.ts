import { ICommand, ICommandHandler, CommandResult } from "../stock/add-stock.command";
import { StockAlertService } from "../../services/stock-alert.service";
import { StockAlert } from "../../../domain/entities/stock-alert.entity";

export interface ResolveStockAlertCommand extends ICommand {
  alertId: string;
}

export class ResolveStockAlertCommandHandler
  implements ICommandHandler<ResolveStockAlertCommand, CommandResult<StockAlert>>
{
  constructor(private readonly stockAlertService: StockAlertService) {}

  async handle(
    command: ResolveStockAlertCommand
  ): Promise<CommandResult<StockAlert>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.alertId || command.alertId.trim().length === 0) {
        errors.push("alertId: Alert ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<StockAlert>("Validation failed", errors);
      }

      // Execute service
      const alert = await this.stockAlertService.resolveStockAlert(
        command.alertId
      );

      return CommandResult.success(alert);
    } catch (error) {
      return CommandResult.failure<StockAlert>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { ResolveStockAlertCommandHandler as ResolveStockAlertHandler };
