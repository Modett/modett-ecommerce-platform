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

export interface Address {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
  phone: string;
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
  email?: string;
  shipping_address?: Address;
  billing_address?: Address;

  // Individual address fields
  shippingMethod?: string;
  shippingOption?: string;
  isGift?: boolean;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingProvince?: string;
  shippingPostalCode?: string;
  shippingCountryCode?: string;
  shippingPhone?: string;
  billingFirstName?: string;
  billingLastName?: string;
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingProvince?: string;
  billingPostalCode?: string;
  billingCountryCode?: string;
  billingPhone?: string;
  sameAddressForBilling?: boolean;
}
