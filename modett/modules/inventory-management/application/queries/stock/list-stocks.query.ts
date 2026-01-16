import { IQuery, IQueryHandler } from "./get-stock.query";
import { CommandResult } from "../../commands/stock/add-stock.command";
import { StockManagementService } from "../../services/stock-management.service";
import { StockResult } from "./get-stock.query";

export interface ListStocksQuery extends IQuery {
  limit?: number;
  offset?: number;
  search?: string;
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
        search: query.search,
      });

      const stocks: StockResult[] = result.stocks.map((stock) => {
        const stockLevel = stock.getStockLevel();
        return {
          stockId: `${stock.getVariantId()}-${stock.getLocationId()}`,
          variantId: stock.getVariantId(),
          locationId: stock.getLocationId(),
          onHand: stockLevel.getOnHand(),
          reserved: stockLevel.getReserved(),
          available: stockLevel.getAvailable(),
          lowStockThreshold: stockLevel.getLowStockThreshold() ?? undefined,
          safetyStock: stockLevel.getSafetyStock() ?? undefined,
          isLowStock: stockLevel.isLowStock(),
          isOutOfStock: stockLevel.isOutOfStock(),
          variant: {
            ...stock.getVariant(),
            size: stock.getVariant()?.size,
            color: stock.getVariant()?.color,
          },
          location: stock.getLocation(),
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
