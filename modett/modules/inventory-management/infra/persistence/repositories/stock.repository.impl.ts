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
  variant?: any;
  location?: any;
}

export class StockRepositoryImpl implements IStockRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Hydration: Database row  Entity
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
      variant: row.variant,
      location: row.location,
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
    search?: string;
  }): Promise<{ stocks: Stock[]; total: number }> {
    const { limit = 50, offset = 0, search } = options || {};

    const where: any = {};

    if (search) {
      where.variant = {
        OR: [
          {
            sku: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            product: {
              title: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            product: {
              brand: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      };
    }

    const [stocks, total] = await Promise.all([
      (this.prisma as any).inventoryStock.findMany({
        take: limit,
        skip: offset,
        where,
        orderBy: { variantId: "asc" },
        include: {
          location: true,
          variant: {
            include: {
              product: {
                include: {
                  media: {
                    include: {
                      asset: {
                        select: {
                          id: true,
                          storageKey: true,
                          mime: true,
                          width: true,
                          height: true,
                          altText: true,
                          focalX: true,
                          focalY: true,
                          renditions: true,
                          version: true,
                          createdAt: true,
                        },
                      },
                    },
                    orderBy: {
                      position: "asc",
                    },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      }),
      (this.prisma as any).inventoryStock.count({ where }),
    ]);

    // Fetch active reservations for these variants
    const variantIds = stocks.map((s: any) => s.variantId);
    const now = new Date();

    const activeReservations = await (this.prisma as any).reservation.groupBy({
      by: ["variantId"],
      where: {
        variantId: { in: variantIds },
        expiresAt: { gt: now },
      },
      _sum: {
        qty: true,
      },
    });

    const reservationMap = new Map<string, number>();
    activeReservations.forEach((r: any) => {
      if (r.variantId && r._sum.qty) {
        reservationMap.set(r.variantId, r._sum.qty);
      }
    });

    return {
      stocks: stocks.map((stock: StockDatabaseRow) => {
        const reservedInCart = reservationMap.get(stock.variantId) || 0;

        // Create a modified row with updated reserved count
        const modifiedRow = {
          ...stock,
          reserved: stock.reserved + reservedInCart,
        };

        return this.toEntity(modifiedRow);
      }),
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

  async getStats(): Promise<{
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
  }> {
    // 1. Total Quantity and Total Value
    // Note: Total Value requires joining with ProductVariant which might be heavy if done via raw SQL on all rows.
    // Ideally we duplicate cost/price onto inventoryStock or use an approximate.
    // For MVP, we'll sum onHand. For value, we might need a separate query or join.
    // Let's do a basic sum for onHand first.

    const totalStats = await (this.prisma as any).inventoryStock.aggregate({
      _sum: {
        onHand: true,
      },
    });

    // 2. Low Stock Count
    // onHand <= lowStockThreshold (where threshold is set)
    const lowStockCount = await (this.prisma as any).inventoryStock.count({
      where: {
        lowStockThreshold: { not: null },
        onHand: {
          lte: (this.prisma as any).inventoryStock.fields.lowStockThreshold,
        },
      },
    });

    // Prisma doesn't support field comparison in 'where' clause easily without raw query or extensions
    // So let's fall back to the raw query we used in findLowStockItems but getting count
    const lowStockCountRaw = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::int as count FROM inventory_management.inventory_stocks
      WHERE low_stock_threshold IS NOT NULL
      AND on_hand <= low_stock_threshold
    `;

    // 3. Out of Stock
    // onHand <= reserved
    const outOfStockCountRaw = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::int as count FROM inventory_management.inventory_stocks
      WHERE on_hand <= reserved
    `;

    return {
      totalItems: totalStats._sum.onHand || 0,
      lowStockCount: Number(lowStockCountRaw[0]?.count || 0),
      outOfStockCount: Number(outOfStockCountRaw[0]?.count || 0),
      totalValue: 0, // Placeholder for now until we join with price/cost
    };
  }
}
