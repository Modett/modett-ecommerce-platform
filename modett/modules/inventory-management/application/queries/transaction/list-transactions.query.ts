import { IQuery, IQueryHandler } from "../stock/get-stock.query";
import { CommandResult } from "../../commands/stock/add-stock.command";
import { StockManagementService } from "../../services/stock-management.service";
import { TransactionResult } from "./get-transaction.query";

export interface ListTransactionsQuery extends IQuery {
  variantId: string;
  locationId?: string;
  limit?: number;
  offset?: number;
}

export interface ListTransactionsResult {
  transactions: TransactionResult[];
  total: number;
}

export class ListTransactionsQueryHandler
  implements
    IQueryHandler<ListTransactionsQuery, CommandResult<ListTransactionsResult>>
{
  constructor(private readonly stockService: StockManagementService) {}

  async handle(
    query: ListTransactionsQuery
  ): Promise<CommandResult<ListTransactionsResult>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!query.variantId || query.variantId.trim().length === 0) {
        errors.push("variantId: Variant ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<ListTransactionsResult>(
          "Validation failed",
          errors
        );
      }

      const result = await this.stockService.getTransactionHistory(
        query.variantId,
        query.locationId,
        {
          limit: query.limit,
          offset: query.offset,
        }
      );

      const transactions: TransactionResult[] = result.transactions.map(
        (txn) => ({
          invTxnId: txn.getInvTxnId().getValue(),
          variantId: txn.getVariantId(),
          locationId: txn.getLocationId(),
          qtyDelta: txn.getQtyDelta(),
          reason: txn.getReason().getValue(),

          referenceId: txn.getReferenceId() ?? undefined,
          createdAt: txn.getCreatedAt(),
        })
      );

      return CommandResult.success({
        transactions,
        total: result.total,
      });
    } catch (error) {
      return CommandResult.failure<ListTransactionsResult>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { ListTransactionsQueryHandler as ListTransactionsHandler };
