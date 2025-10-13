import { ICommand, ICommandHandler, CommandResult } from "../stock/add-stock.command";
import { PurchaseOrderManagementService } from "../../services/purchase-order-management.service";

export interface DeletePurchaseOrderCommand extends ICommand {
  poId: string;
}

export class DeletePurchaseOrderCommandHandler
  implements ICommandHandler<DeletePurchaseOrderCommand, CommandResult<void>>
{
  constructor(private readonly poService: PurchaseOrderManagementService) {}

  async handle(
    command: DeletePurchaseOrderCommand
  ): Promise<CommandResult<void>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.poId || command.poId.trim().length === 0) {
        errors.push("poId: Purchase Order ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<void>("Validation failed", errors);
      }

      // Execute service
      await this.poService.deletePurchaseOrder(command.poId);

      return CommandResult.success();
    } catch (error) {
      return CommandResult.failure<void>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { DeletePurchaseOrderCommandHandler as DeletePurchaseOrderHandler };
