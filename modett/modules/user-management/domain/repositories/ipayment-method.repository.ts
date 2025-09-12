// Payment method repository interface
import { PaymentMethod } from "../entities/payment-method.entity";

export interface IPaymentMethodRepository {
  findById(id: string): Promise<PaymentMethod | null>;
  findByUserId(userId: string): Promise<PaymentMethod[]>;
  create(method: PaymentMethod): Promise<PaymentMethod>;
  update(method: PaymentMethod): Promise<PaymentMethod>;
  delete(id: string): Promise<void>;
}
