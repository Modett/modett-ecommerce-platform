import { ICommand, ICommandHandler, CommandResult } from "../stock/add-stock.command";
import { SupplierManagementService } from "../../services/supplier-management.service";
import { Supplier, SupplierContact } from "../../../domain/entities/supplier.entity";

export interface UpdateSupplierCommand extends ICommand {
  supplierId: string;
  name?: string;
  leadTimeDays?: number;
  contacts?: SupplierContact[];
}

export class UpdateSupplierCommandHandler
  implements ICommandHandler<UpdateSupplierCommand, CommandResult<Supplier>>
{
  constructor(private readonly supplierService: SupplierManagementService) {}

  async handle(
    command: UpdateSupplierCommand
  ): Promise<CommandResult<Supplier>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!command.supplierId || command.supplierId.trim().length === 0) {
        errors.push("supplierId: Supplier ID is required");
      }

      if (!command.name && command.leadTimeDays === undefined && !command.contacts) {
        errors.push("At least one field (name, leadTimeDays, or contacts) must be provided");
      }

      if (command.name && command.name.trim().length === 0) {
        errors.push("name: Supplier name cannot be empty");
      }

      if (command.leadTimeDays !== undefined && command.leadTimeDays < 0) {
        errors.push("leadTimeDays: Lead time days cannot be negative");
      }

      if (errors.length > 0) {
        return CommandResult.failure<Supplier>("Validation failed", errors);
      }

      // Execute service
      const supplier = await this.supplierService.updateSupplier(
        command.supplierId,
        {
          name: command.name,
          leadTimeDays: command.leadTimeDays,
          contacts: command.contacts,
        }
      );

      return CommandResult.success(supplier);
    } catch (error) {
      return CommandResult.failure<Supplier>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { UpdateSupplierCommandHandler as UpdateSupplierHandler };
