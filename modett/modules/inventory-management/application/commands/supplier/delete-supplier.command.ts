import { ICommand, ICommandHandler, CommandResult } from "../stock/add-stock.command";
import { SupplierManagementService } from "../../services/supplier-management.service";

export interface DeleteSupplierCommand extends ICommand {
  supplierId: string;
}

export class DeleteSupplierCommandHandler
  implements ICommandHandler<DeleteSupplierCommand, CommandResult<void>>
{
  constructor(private readonly supplierService: SupplierManagementService) {}

  async handle(
    command: DeleteSupplierCommand
  ): Promise<CommandResult<void>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.supplierId || command.supplierId.trim().length === 0) {
        errors.push("supplierId: Supplier ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<void>("Validation failed", errors);
      }

      // Execute service
      await this.supplierService.deleteSupplier(command.supplierId);

      return CommandResult.success();
    } catch (error) {
      return CommandResult.failure<void>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { DeleteSupplierCommandHandler as DeleteSupplierHandler };
