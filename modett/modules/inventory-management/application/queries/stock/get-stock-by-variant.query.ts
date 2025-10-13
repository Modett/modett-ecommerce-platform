import { IQuery, IQueryHandler } from "./get-stock.query";
import { CommandResult } from "../../commands/stock/add-stock.command";
import { StockManagementService } from "../../services/stock-management.service";
import { StockResult } from "./get-stock.query";

export interface GetStockByVariantQuery extends IQuery {
  variantId: string;
}

export class GetStockByVariantQueryHandler
  implements IQueryHandler<GetStockByVariantQuery, CommandResult<StockResult[]>>
{
  constructor(private readonly stockService: StockManagementService) {}

  async handle(
    query: GetStockByVariantQuery
  ): Promise<CommandResult<StockResult[]>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!query.variantId || query.variantId.trim().length === 0) {
        errors.push("variantId: Variant ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<StockResult[]>(
          "Validation failed",
          errors
        );
      }

      const stocks = await this.stockService.getStockByVariant(query.variantId);

      const results: StockResult[] = stocks.map((stock) => {
        const stockLevel = stock.getStockLevel();
        return {
          variantId: stock.getVariantId(),
          locationId: stock.getLocationId(),
          onHand: stockLevel.getOnHand(),
          reserved: stockLevel.getReserved(),
          available: stockLevel.getAvailable(),
          lowStockThreshold: stockLevel.getLowStockThreshold() ?? undefined,
          safetyStock: stockLevel.getSafetyStock() ?? undefined,
          isLowStock: stockLevel.isLowStock(),
          isOutOfStock: stockLevel.isOutOfStock(),
        };
      });

      return CommandResult.success(results);
    } catch (error) {
      return CommandResult.failure<StockResult[]>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { GetStockByVariantQueryHandler as GetStockByVariantHandler };
