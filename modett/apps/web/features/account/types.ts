export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  dateOfBirth?: string;
  residentOf?: string;
  nationality?: string;
}

export interface OrderItem {
  orderItemId: string;
  productSnapshot?: {
    name: string;
    imageUrl?: string;
    images?: Array<{
      storageKey: string;
    }>;
  };
}

export interface OrderSummary {
  orderId: string;
  orderNumber: string;
  status: string;
  totals: {
    total: number;
    subtotal?: number;
    tax?: number;
    shipping?: number;
  };
  currency: string;
  createdAt: string;
  items: OrderItem[];
}
