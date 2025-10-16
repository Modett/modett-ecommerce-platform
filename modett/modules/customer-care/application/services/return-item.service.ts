import {
  IReturnItemRepository,
  ReturnItemFilterOptions,
} from "../../domain/repositories/return-item.repository.js";
import { ReturnItem } from "../../domain/entities/return-item.entity.js";
import {
  ItemCondition,
  ItemDisposition,
  Money,
} from "../../domain/value-objects/index.js";

export class ReturnItemService {
  constructor(private readonly itemRepository: IReturnItemRepository) {}

  async createItem(data: {
    rmaId: string;
    orderItemId: string;
    quantity: number;
    condition?: ItemCondition;
    disposition?: ItemDisposition;
    fees?: number;
    currency?: string;
  }): Promise<ReturnItem> {
    const item = ReturnItem.create({
      rmaId: data.rmaId,
      orderItemId: data.orderItemId,
      quantity: data.quantity,
      condition: data.condition,
      disposition: data.disposition,
      fees:
        data.fees !== undefined
          ? Money.create(data.fees, data.currency)
          : undefined,
    });

    await this.itemRepository.save(item);
    return item;
  }

  async getItem(
    rmaId: string,
    orderItemId: string
  ): Promise<ReturnItem | null> {
    return await this.itemRepository.findById(rmaId, orderItemId);
  }

  async updateItem(
    rmaId: string,
    orderItemId: string,
    data: {
      quantity?: number;
      condition?: ItemCondition;
      disposition?: ItemDisposition;
      fees?: number;
      currency?: string;
    }
  ): Promise<void> {
    const item = await this.itemRepository.findById(rmaId, orderItemId);

    if (!item) {
      throw new Error(
        `Return item not found for rmaId=${rmaId}, orderItemId=${orderItemId}`
      );
    }

    if (data.quantity !== undefined) {
      item.updateQuantity(data.quantity);
    }
    if (data.condition) {
      item.setCondition(data.condition);
    }
    if (data.disposition) {
      item.setDisposition(data.disposition);
    }
    if (data.fees !== undefined) {
      item.setFees(Money.create(data.fees, data.currency));
    }

    await this.itemRepository.update(item);
  }

  async deleteItem(rmaId: string, orderItemId: string): Promise<void> {
    const exists = await this.itemRepository.exists(rmaId, orderItemId);

    if (!exists) {
      throw new Error(
        `Return item not found for rmaId=${rmaId}, orderItemId=${orderItemId}`
      );
    }

    await this.itemRepository.delete(rmaId, orderItemId);
  }

  async getItemsByRmaId(rmaId: string): Promise<ReturnItem[]> {
    return await this.itemRepository.findByRmaId(rmaId);
  }

  async getItemsByOrderItemId(orderItemId: string): Promise<ReturnItem[]> {
    return await this.itemRepository.findByOrderItemId(orderItemId);
  }

  async getItemsWithFilters(
    filters: ReturnItemFilterOptions
  ): Promise<ReturnItem[]> {
    return await this.itemRepository.findWithFilters(filters);
  }

  async getAllItems(): Promise<ReturnItem[]> {
    return await this.itemRepository.findAll();
  }

  async getItemsByCondition(condition: ItemCondition): Promise<ReturnItem[]> {
    return await this.itemRepository.findByCondition(condition);
  }

  async getItemsByDisposition(
    disposition: ItemDisposition
  ): Promise<ReturnItem[]> {
    return await this.itemRepository.findByDisposition(disposition);
  }

  async getItemsForRestock(rmaId?: string): Promise<ReturnItem[]> {
    return await this.itemRepository.findItemsForRestock(rmaId);
  }

  async getItemsForRepair(rmaId?: string): Promise<ReturnItem[]> {
    return await this.itemRepository.findItemsForRepair(rmaId);
  }

  async getItemsForDiscard(rmaId?: string): Promise<ReturnItem[]> {
    return await this.itemRepository.findItemsForDiscard(rmaId);
  }

  async getItemsWithFees(rmaId?: string): Promise<ReturnItem[]> {
    return await this.itemRepository.findItemsWithFees(rmaId);
  }

  async countItemsByRmaId(rmaId: string): Promise<number> {
    return await this.itemRepository.countByRmaId(rmaId);
  }

  async countItemsByCondition(condition: ItemCondition): Promise<number> {
    return await this.itemRepository.countByCondition(condition);
  }

  async countItemsByDisposition(disposition: ItemDisposition): Promise<number> {
    return await this.itemRepository.countByDisposition(disposition);
  }

  async countItems(filters?: ReturnItemFilterOptions): Promise<number> {
    return await this.itemRepository.count(filters);
  }

  async itemExists(rmaId: string, orderItemId: string): Promise<boolean> {
    return await this.itemRepository.exists(rmaId, orderItemId);
  }

  async hasItemsForRma(rmaId: string): Promise<boolean> {
    return await this.itemRepository.hasItemsForRma(rmaId);
  }

  async saveAllItems(items: ReturnItem[]): Promise<void> {
    await this.itemRepository.saveAll(items);
  }

  async deleteByRmaId(rmaId: string): Promise<void> {
    await this.itemRepository.deleteByRmaId(rmaId);
  }
}
