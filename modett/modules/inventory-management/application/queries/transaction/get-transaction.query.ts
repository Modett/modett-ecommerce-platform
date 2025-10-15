import { IQuery, IQueryHandler } from "../stock/get-stock.query";
import { CommandResult } from "../../commands/stock/add-stock.command";
import { StockManagementService } from "../../services/stock-management.service";

export interface GetTransactionQuery extends IQuery {
  transactionId: string;
}

export interface TransactionResult {
  invTxnId: string;
  variantId: string;
  locationId: string;
  qtyDelta: number;
  reason: string;

  referenceId?: string;
  createdAt: Date;
}

export class GetTransactionQueryHandler
  implements
    IQueryHandler<GetTransactionQuery, CommandResult<TransactionResult | null>>
{
  constructor(private readonly stockService: StockManagementService) {}

  async handle(
    query: GetTransactionQuery
  ): Promise<CommandResult<TransactionResult | null>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!query.transactionId || query.transactionId.trim().length === 0) {
        errors.push("transactionId: Transaction ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<TransactionResult | null>(
          "Validation failed",
          errors
        );
      }

      // Note: You may need to add a getTransaction method to the service
      // For now, this is a placeholder implementation
      return CommandResult.failure<TransactionResult | null>(
        "Method not implemented",
        [
          "getTransaction method needs to be implemented in StockManagementService",
        ]
      );
    } catch (error) {
      return CommandResult.failure<TransactionResult | null>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { GetTransactionQueryHandler as GetTransactionHandler };
