// Payment method entity
export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  last4: string;
  provider: string;
  createdAt: Date;
}
