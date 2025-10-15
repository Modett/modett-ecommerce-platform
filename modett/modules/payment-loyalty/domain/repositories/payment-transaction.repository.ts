import { PaymentTransaction } from "../entities/payment-transaction.entity.js";
import { PaymentTransactionType } from "../value-objects/payment-transaction-type.vo.js";

export interface PaymentTransactionFilterOptions {
  intentId?: string;
  type?: PaymentTransactionType;
  status?: string;
}

export interface IPaymentTransactionRepository {
  save(transaction: PaymentTransaction): Promise<void>;
  findById(txnId: string): Promise<PaymentTransaction | null>;
  findByIntentId(intentId: string): Promise<PaymentTransaction[]>;
  findWithFilters(
    filters: PaymentTransactionFilterOptions
  ): Promise<PaymentTransaction[]>;
  count(filters?: PaymentTransactionFilterOptions): Promise<number>;
}
