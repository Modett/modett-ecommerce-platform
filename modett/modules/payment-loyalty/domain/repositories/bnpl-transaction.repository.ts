import { BnplTransaction } from "../entities/bnpl-transaction.entity.js";

export interface BnplTransactionFilterOptions {
  intentId?: string;
  orderId?: string;
  provider?: string;
  status?: string;
}

export interface IBnplTransactionRepository {
  save(transaction: BnplTransaction): Promise<void>;
  update(transaction: BnplTransaction): Promise<void>;
  findById(bnplId: string): Promise<BnplTransaction | null>;
  findByIntentId(intentId: string): Promise<BnplTransaction | null>;
  findByOrderId(orderId: string): Promise<BnplTransaction[]>;
  findWithFilters(
    filters: BnplTransactionFilterOptions
  ): Promise<BnplTransaction[]>;
  count(filters?: BnplTransactionFilterOptions): Promise<number>;
}
