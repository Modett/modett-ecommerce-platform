import { PrismaClient } from "@prisma/client";
import { Stock, StockProps } from "../../../domain/entities/stock.entity";
import { StockLevel } from "../../../domain/value-objects/stock-level.vo";
import { IStockRepository } from "../../../domain/repositories/stock.repository";

interface StockDatabaseRow {
  variantId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  lowStockThreshold: number | null;
  safetyStock: number | null;
}

export class StockRepositoryImpl implements IStockRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Hydration: Database row � Entity
  private toEntity(row: StockDatabaseRow): Stock {
    return Stock.reconstitute({
      variantId: row.variantId,
      locationId: row.locationId,
      stockLevel: StockLevel.create(
        row.onHand,
        row.reserved,
        row.lowStockThreshold,
        row.safetyStock
      ),
    });
  }

  async save(stock: Stock): Promise<void> {
    const stockLevel = stock.getStockLevel();

    // TODO: Create inventoryStock model in Prisma schema
    await (this.prisma as any).inventoryStock.upsert({
      where: {
        variantId_locationId: {
          variantId: stock.getVariantId(),
          locationId: stock.getLocationId(),
        },
      },
      create: {
        variantId: stock.getVariantId(),
        locationId: stock.getLocationId(),
        onHand: stockLevel.getOnHand(),
        reserved: stockLevel.getReserved(),
        lowStockThreshold: stockLevel.getLowStockThreshold(),
        safetyStock: stockLevel.getSafetyStock(),
      },
      update: {
        onHand: stockLevel.getOnHand(),
        reserved: stockLevel.getReserved(),
        lowStockThreshold: stockLevel.getLowStockThreshold(),
        safetyStock: stockLevel.getSafetyStock(),
      },
    });
  }

  async findByVariantAndLocation(
    variantId: string,
    locationId: string
  ): Promise<Stock | null> {
    const stock = await (this.prisma as any).inventoryStock.findUnique({
      where: {
        variantId_locationId: {
          variantId,
          locationId,
        },
      },
    });

    if (!stock) {
      return null;
    }

    return this.toEntity(stock);
  }

  async delete(variantId: string, locationId: string): Promise<void> {
    await (this.prisma as any).inventoryStock.delete({
      where: {
        variantId_locationId: {
          variantId,
          locationId,
        },
      },
    });
  }

  async findByVariant(variantId: string): Promise<Stock[]> {
    const stocks = await (this.prisma as any).inventoryStock.findMany({
      where: { variantId },
    });

    return stocks.map((stock: StockDatabaseRow) => this.toEntity(stock));
  }

  async findByLocation(locationId: string): Promise<Stock[]> {
    const stocks = await (this.prisma as any).inventoryStock.findMany({
      where: { locationId },
    });

    return stocks.map((stock: StockDatabaseRow) => this.toEntity(stock));
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
  }): Promise<{ stocks: Stock[]; total: number }> {
    const { limit = 50, offset = 0 } = options || {};

    const [stocks, total] = await Promise.all([
      (this.prisma as any).inventoryStock.findMany({
        take: limit,
        skip: offset,
        orderBy: { variantId: "asc" },
      }),
      (this.prisma as any).inventoryStock.count(),
    ]);

    return {
      stocks: stocks.map((stock: StockDatabaseRow) => this.toEntity(stock)),
      total,
    };
  }

  async findLowStockItems(): Promise<Stock[]> {
    // Use raw query for complex field comparison
    const stocks = await this.prisma.$queryRaw<StockDatabaseRow[]>`
      SELECT * FROM inventory_management.inventory_stocks
      WHERE low_stock_threshold IS NOT NULL
      AND on_hand <= low_stock_threshold
    `;

    return stocks.map((stock) => this.toEntity(stock));
  }

  async findOutOfStockItems(): Promise<Stock[]> {
    // Use raw query for field comparison
    const stocks = await this.prisma.$queryRaw<StockDatabaseRow[]>`
      SELECT * FROM inventory_management.inventory_stocks
      WHERE on_hand <= reserved
    `;

    return stocks.map((stock) => this.toEntity(stock));
  }

  async getTotalAvailableStock(variantId: string): Promise<number> {
    const result = await (this.prisma as any).inventoryStock.aggregate({
      where: { variantId },
      _sum: {
        onHand: true,
        reserved: true,
      },
    });

    const totalOnHand = result._sum.onHand || 0;
    const totalReserved = result._sum.reserved || 0;

    return totalOnHand - totalReserved;
  }

  async exists(variantId: string, locationId: string): Promise<boolean> {
    const count = await (this.prisma as any).inventoryStock.count({
      where: {
        variantId,
        locationId,
      },
    });

    return count > 0;
  }
}
