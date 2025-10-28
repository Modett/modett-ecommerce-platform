// Product Types
export interface Product {
  id: string;
  title: string;
  slug: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status: 'draft' | 'published' | 'scheduled';
  publishAt?: string;
  countryOfOrigin?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
  media?: ProductMedia[];
  categories?: Category[];
  defaultVariantId?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size?: string;
  color?: string;
  barcode?: string;
  price: number;
  compareAtPrice?: number;
  weightG?: number;
  dims?: any;
  taxClass?: string;
  allowBackorder: boolean;
  allowPreorder: boolean;
  restockEta?: string;
  createdAt: string;
  updatedAt: string;
  media?: VariantMedia[];
  product?: Product;
  inventoryStocks?: InventoryStock[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  position?: number;
  parent?: Category;
  children?: Category[];
}

export interface MediaAsset {
  id: string;
  storageKey: string;
  mime: string;
  width?: number;
  height?: number;
  bytes?: number;
  altText?: string;
  focalX?: number;
  focalY?: number;
  renditions?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
  version: number;
  createdAt: string;
}

export interface ProductMedia {
  id: string;
  productId: string;
  assetId: string;
  position?: number;
  isCover: boolean;
  asset: MediaAsset;
}

export interface VariantMedia {
  variantId: string;
  assetId: string;
  asset: MediaAsset;
}

export interface InventoryStock {
  variantId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  lowStockThreshold?: number;
  safetyStock?: number;
}

// Cart Types
export interface ShoppingCart {
  id: string;
  userId?: string;
  guestToken?: string;
  currency?: string;
  reservationExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  qty: number;
  unitPriceSnapshot: number;
  appliedPromos?: any[];
  isGift: boolean;
  giftMessage?: string;
  variant?: ProductVariant;
}

export interface AddToCartInput {
  variantId: string;
  qty: number;
  isGift?: boolean;
  giftMessage?: string;
}

export interface UpdateCartItemInput {
  qty: number;
  isGift?: boolean;
  giftMessage?: string;
}

// Wishlist Types
export interface Wishlist {
  id: string;
  userId?: string;
  guestToken?: string;
  name?: string;
  isDefault: boolean;
  isPublic: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
  items?: WishlistItem[];
}

export interface WishlistItem {
  wishlistId: string;
  variantId: string;
  variant?: ProductVariant;
}

export interface CreateWishlistInput {
  name?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  description?: string;
  guestToken?: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
