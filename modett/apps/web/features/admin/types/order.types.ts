// ============================================================================
// ADMIN ORDER TYPES
// ============================================================================

export interface AdminOrderItem {
  orderItemId: string;
  variantId: string;
  quantity: number;
  productSnapshot: {
    productId: string;
    variantId: string;
    sku: string;
    name: string;
    variantName?: string;
    price: number;
    imageUrl?: string;
  };
  subtotal: number;
  isGift: boolean;
  giftMessage?: string;
}

export interface AdminOrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface AdminOrderAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface AdminOrderShipment {
  shipmentId: string;
  orderId: string;
  carrier?: string;
  service?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  isShipped: boolean;
  isDelivered: boolean;
}

export interface AdminOrder {
  orderId: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  source: string;
  currency: string;
  items: AdminOrderItem[];
  totals: AdminOrderTotals;
  shipments?: AdminOrderShipment[];
  billingAddress?: AdminOrderAddress;
  shippingAddress?: AdminOrderAddress;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "CREATED"
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "FULFILLED"
  | "PARTIALLY_RETURNED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "total" | "orderNumber";
  sortOrder?: "asc" | "desc";
}

export interface OrdersListResponse {
  success: boolean;
  data: {
    orders: AdminOrder[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface OrderDetailsResponse {
  success: boolean;
  data?: AdminOrder;
  error?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  data?: {
    orderId: string;
    status: OrderStatus;
    updatedAt: string;
  };
  error?: string;
}
