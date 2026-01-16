import { Stock } from "../entities/stock.entity";

export interface IStockRepository {
  // Basic CRUD
  save(stock: Stock): Promise<void>;
  findByVariantAndLocation(
    variantId: string,
    locationId: string
  ): Promise<Stock | null>;
  delete(variantId: string, locationId: string): Promise<void>;

  // Queries
  findByVariant(variantId: string): Promise<Stock[]>;
  findByLocation(locationId: string): Promise<Stock[]>;
  findAll(options?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ stocks: Stock[]; total: number }>;

  // Stock level queries
  findLowStockItems(): Promise<Stock[]>;
  findOutOfStockItems(): Promise<Stock[]>;
  getTotalAvailableStock(variantId: string): Promise<number>;

  // Existence checks
  exists(variantId: string, locationId: string): Promise<boolean>;

  // Analytics
  getStats(): Promise<{
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
  }>;
}
