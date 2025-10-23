import { v4 as uuidv4 } from "uuid";
import { Stock } from "../../domain/entities/stock.entity";
import { InventoryTransaction } from "../../domain/entities/inventory-transaction.entity";
import { StockLevel } from "../../domain/value-objects/stock-level.vo";
import { TransactionId } from "../../domain/value-objects/transaction-id.vo";
import { TransactionReasonVO } from "../../domain/value-objects/transaction-reason.vo";
import { IStockRepository } from "../../domain/repositories/stock.repository";
import { IInventoryTransactionRepository } from "../../domain/repositories/inventory-transaction.repository";

export class StockManagementService {
  constructor(
    private readonly stockRepository: IStockRepository,
    private readonly transactionRepository: IInventoryTransactionRepository
  ) {}

  async addStock(
    variantId: string,
    locationId: string,
    quantity: number,
    reason: string
  ): Promise<Stock> {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero");
    }

    let stock = await this.stockRepository.findByVariantAndLocation(
      variantId,
      locationId
    );

    if (!stock) {
      // Create new stock record
      stock = Stock.create({
        variantId,
        locationId,
        stockLevel: StockLevel.create(quantity, 0),
      });
    } else {
      // Add to existing stock
      stock = stock.addStock(quantity);
    }

    await this.stockRepository.save(stock);

    // Record transaction
    const transaction = InventoryTransaction.create({
      invTxnId: TransactionId.create(uuidv4()),
      variantId,
      locationId,
      qtyDelta: quantity,
      reason: TransactionReasonVO.create(reason),
      referenceId: undefined,
      createdAt: new Date(),
    });

    await this.transactionRepository.save(transaction);

    return stock;
  }

  async adjustStock(
    variantId: string,
    locationId: string,
    quantityDelta: number,
    reason: string
  ): Promise<Stock> {
    const stock = await this.stockRepository.findByVariantAndLocation(
      variantId,
      locationId
    );

    if (!stock) {
      throw new Error(
        `Stock not found for variant ${variantId} at location ${locationId}`
      );
    }

    const updatedStock =
      quantityDelta > 0
        ? stock.addStock(quantityDelta)
        : stock.removeStock(Math.abs(quantityDelta));

    await this.stockRepository.save(updatedStock);

    // Record transaction
    const transaction = InventoryTransaction.create({
      invTxnId: TransactionId.create(uuidv4()),
      variantId,
      locationId,
      qtyDelta: quantityDelta,
      reason: TransactionReasonVO.create(reason),
      referenceId: undefined,
      createdAt: new Date(),
    });

    await this.transactionRepository.save(transaction);

    return updatedStock;
  }

  async transferStock(
    variantId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number
  ): Promise<{ fromStock: Stock; toStock: Stock }> {
    if (quantity <= 0) {
      throw new Error("Transfer quantity must be greater than zero");
    }

    // Remove from source location
    const fromStock = await this.stockRepository.findByVariantAndLocation(
      variantId,
      fromLocationId
    );

    if (!fromStock) {
      throw new Error(
        `Stock not found for variant ${variantId} at location ${fromLocationId}`
      );
    }

    const updatedFromStock = fromStock.removeStock(quantity);
    await this.stockRepository.save(updatedFromStock);

    // Record outbound transaction
    const outboundTxn = InventoryTransaction.create({
      invTxnId: TransactionId.create(uuidv4()),
      variantId,
      locationId: fromLocationId,
      qtyDelta: -quantity,
      reason: TransactionReasonVO.create("adjustment"),

      referenceId: toLocationId,
      createdAt: new Date(),
    });
    await this.transactionRepository.save(outboundTxn);

    // Add to destination location
    let toStock = await this.stockRepository.findByVariantAndLocation(
      variantId,
      toLocationId
    );

    if (!toStock) {
      toStock = Stock.create({
        variantId,
        locationId: toLocationId,
        stockLevel: StockLevel.create(quantity, 0),
      });
    } else {
      toStock = toStock.addStock(quantity);
    }

    await this.stockRepository.save(toStock);

    // Record inbound transaction
    const inboundTxn = InventoryTransaction.create({
      invTxnId: TransactionId.create(uuidv4()),
      variantId,
      locationId: toLocationId,
      qtyDelta: quantity,
      reason: TransactionReasonVO.create("adjustment"),

      referenceId: fromLocationId,
      createdAt: new Date(),
    });
    await this.transactionRepository.save(inboundTxn);

    return { fromStock: updatedFromStock, toStock };
  }

  async reserveStock(
    variantId: string,
    locationId: string,
    quantity: number
  ): Promise<Stock> {
    const stock = await this.stockRepository.findByVariantAndLocation(
      variantId,
      locationId
    );

    if (!stock) {
      throw new Error(
        `Stock not found for variant ${variantId} at location ${locationId}`
      );
    }

    const updatedStock = stock.reserveStock(quantity);
    await this.stockRepository.save(updatedStock);

    // Note: Reservations don't create inventory transactions since they don't change on-hand quantity
    // Only changes to on-hand stock (add, remove, adjust) create transactions
    // Stock release for expired reservations is handled by ReservationExpiryHandler

    return updatedStock;
  }

  async fulfillReservation(
    variantId: string,
    locationId: string,
    quantity: number
  ): Promise<Stock> {
    const stock = await this.stockRepository.findByVariantAndLocation(
      variantId,
      locationId
    );

    if (!stock) {
      throw new Error(
        `Stock not found for variant ${variantId} at location ${locationId}`
      );
    }

    const updatedStock = stock.fulfillReservation(quantity);
    await this.stockRepository.save(updatedStock);

    // Record order fulfillment transaction
    const transaction = InventoryTransaction.create({
      invTxnId: TransactionId.create(uuidv4()),
      variantId,
      locationId,
      qtyDelta: -quantity,
      reason: TransactionReasonVO.create("order"),
      createdAt: new Date(),
    });
    await this.transactionRepository.save(transaction);

    return updatedStock;
  }

  async setStockThresholds(
    variantId: string,
    locationId: string,
    lowStockThreshold?: number,
    safetyStock?: number
  ): Promise<Stock> {
    const stock = await this.stockRepository.findByVariantAndLocation(
      variantId,
      locationId
    );

    if (!stock) {
      throw new Error(
        `Stock not found for variant ${variantId} at location ${locationId}`
      );
    }

    const updatedStock = stock.updateThresholds(lowStockThreshold, safetyStock);
    await this.stockRepository.save(updatedStock);

    return updatedStock;
  }

  async getStock(variantId: string, locationId: string): Promise<Stock | null> {
    return this.stockRepository.findByVariantAndLocation(variantId, locationId);
  }

  async getStockByVariant(variantId: string): Promise<Stock[]> {
    return this.stockRepository.findByVariant(variantId);
  }

  async getTotalAvailableStock(variantId: string): Promise<number> {
    return this.stockRepository.getTotalAvailableStock(variantId);
  }

  async getLowStockItems(): Promise<Stock[]> {
    return this.stockRepository.findLowStockItems();
  }

  async getOutOfStockItems(): Promise<Stock[]> {
    return this.stockRepository.findOutOfStockItems();
  }

  async listStocks(options?: {
    limit?: number;
    offset?: number;
  }): Promise<{ stocks: Stock[]; total: number }> {
    return this.stockRepository.findAll(options);
  }

  async getTransactionHistory(
    variantId: string,
    locationId?: string,
    options?: { limit?: number; offset?: number }
  ): Promise<{ transactions: InventoryTransaction[]; total: number }> {
    if (locationId) {
      return this.transactionRepository.findByVariantAndLocation(
        variantId,
        locationId,
        options
      );
    }
    return this.transactionRepository.findByVariant(variantId, options);
  }
}
