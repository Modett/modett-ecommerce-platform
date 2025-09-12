// Payment method DB model
export interface PaymentMethodModel {
  id: string;
  userId: string;
  type: string;
  last4: string;
  provider: string;
  createdAt: Date;
}
