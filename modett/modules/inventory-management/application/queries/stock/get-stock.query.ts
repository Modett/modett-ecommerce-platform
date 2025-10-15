import { StockManagementService } from "../../services/stock-management.service";
import { Stock } from "../../../domain/entities/stock.entity";
import { CommandResult } from "../../commands/stock/add-stock.command";

export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface GetStockQuery extends IQuery {
  variantId: string;
  locationId: string;
}

export interface StockResult {
  variantId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  available: number;
  lowStockThreshold?: number;
  safetyStock?: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export class GetStockQueryHandler
  implements IQueryHandler<GetStockQuery, CommandResult<StockResult | null>>
{
  constructor(private readonly stockService: StockManagementService) {}

  async handle(
    query: GetStockQuery
  ): Promise<CommandResult<StockResult | null>> {
    try {
      const errors: string[] = [];

      // Validation
      if (!query.variantId || query.variantId.trim().length === 0) {
        errors.push("variantId: Variant ID is required");
      }

      if (!query.locationId || query.locationId.trim().length === 0) {
        errors.push("locationId: Location ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<StockResult | null>(
          "Validation failed",
          errors
        );
      }

      const stock = await this.stockService.getStock(
        query.variantId,
        query.locationId
      );

      if (!stock) {
        return CommandResult.success<StockResult | null>(null);
      }

      const stockLevel = stock.getStockLevel();
      const result: StockResult = {
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

      return CommandResult.success(result);
    } catch (error) {
      return CommandResult.failure<StockResult | null>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { GetStockQueryHandler as GetStockHandler };
