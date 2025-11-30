// ============================================================================
// CART TYPES
// ============================================================================

export interface AddToCartParams {
  variantId: string;
  quantity: number;
  isGift?: boolean;
  giftMessage?: string;
}

export interface CartItem {
  id: string;
  cartItemId?: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  isGift: boolean;
  giftMessage?: string;
  hasPromosApplied: boolean;
  hasFreeShipping: boolean;

  product?: {
    productId: string;
    title: string;
    slug: string;
    images: Array<{ url: string; alt?: string }>;
  };

  variant?: {
    size: string | null;
    color: string | null;
    sku: string;
  };
}

export interface Cart {
  cartId: string;
  userId?: string;
  guestToken?: string;
  currency: string;
  items: CartItem[];
  summary: {
    itemCount: number;
    subtotal: number;
    discount: number;
    total: number;
  };
}
