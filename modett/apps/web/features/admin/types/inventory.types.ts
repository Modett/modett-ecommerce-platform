export interface StockLocation {
  locationId: string;
  type: "warehouse" | "store" | "vendor";
  name: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface InventorySupplier {
  supplierId: string;
  name: string;
  leadTimeDays?: number;
  contacts: Array<{
    name: string;
    email?: string;
    phone?: string;
  }>;
}

export interface StockItem {
  stockId: string;
  variantId: string;
  locationId: string;
  onHand: number;
  reserved: number;
  available: number; // calculated as onHand - reserved
  lowStockThreshold?: number;
  safetyStock?: number;
  updatedAt: string;

  // Relations (often included in list/get responses)
  variant?: {
    id: string; // backend variant id
    sku: string;
    price: number;
    size?: string;
    color?: string;
    product?: {
      title: string;
      media?: Array<{
        asset?: {
          url?: string;
          publicUrl?: string;
          storageKey?: string;
        };
      }>;
    };
    attributes?: Record<string, string>; // size, color etc
  };
  location?: StockLocation;
}

export interface InventoryFilters {
  limit?: number;
  offset?: number; // pagination usually uses page/limit but backend routes.ts showed offset
  variantId?: string;
  locationId?: string;
  search?: string;
}

export interface StocksListResponse {
  success: boolean;
  data: {
    stocks: StockItem[];
    total: number;
  };
  error?: string;
}

export interface LocationsListResponse {
  success: boolean;
  data: {
    locations: StockLocation[];
    total: number;
  };
  error?: string;
}

export interface InventoryStatsResponse {
  success: boolean;
  data: {
    totalItems: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
  };
  error?: string;
}

export interface AddStockRequest {
  variantId: string;
  locationId: string;
  quantity: number;
  reason: "rma" | "adjustment" | "po";
}

export interface TransferStockRequest {
  variantId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
}

export interface AdjustStockRequest {
  variantId: string;
  locationId: string;
  quantityDelta: number;
  reason: string;
}
