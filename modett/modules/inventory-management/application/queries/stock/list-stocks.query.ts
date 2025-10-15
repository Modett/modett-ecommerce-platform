import { IQuery, IQueryHandler } from "./get-stock.query";
import { CommandResult } from "../../commands/stock/add-stock.command";
import { StockManagementService } from "../../services/stock-management.service";
import { StockResult } from "./get-stock.query";

export interface ListStocksQuery extends IQuery {
  limit?: number;
  offset?: number;
}

export interface ListStocksResult {
  stocks: StockResult[];
  total: number;
}

export class ListStocksQueryHandler
  implements IQueryHandler<ListStocksQuery, CommandResult<ListStocksResult>>
{
  constructor(private readonly stockService: StockManagementService) {}

  async handle(
    query: ListStocksQuery
  ): Promise<CommandResult<ListStocksResult>> {
    try {
      const result = await this.stockService.listStocks({
        limit: query.limit,
        offset: query.offset,
      });

      const stocks: StockResult[] = result.stocks.map((stock) => {
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

      return CommandResult.success({
        stocks,
        total: result.total,
      });
    } catch (error) {
      return CommandResult.failure<ListStocksResult>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { ListStocksQueryHandler as ListStocksHandler };
