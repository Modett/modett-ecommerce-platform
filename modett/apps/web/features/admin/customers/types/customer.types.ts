// ============================================================================
// ADMIN CUSTOMER TYPES
// ============================================================================

export type UserRole =
  | "GUEST"
  | "CUSTOMER"
  | "ADMIN"
  | "INVENTORY_STAFF"
  | "CUSTOMER_SERVICE"
  | "ANALYST"
  | "VENDOR";

export type UserStatus = "active" | "inactive" | "blocked";

export interface AdminCustomer {
  userId: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  isGuest: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "email";
  sortOrder?: "asc" | "desc";
}

export interface CustomerPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomersListResponse {
  success: boolean;
  data?: {
    users: AdminCustomer[];
    pagination: CustomerPagination;
  };
  error?: string;
}

export interface CustomerDetailsResponse {
  success: boolean;
  data?: AdminCustomer;
  error?: string;
}

export interface UpdateCustomerStatusRequest {
  status: UserStatus;
  notes?: string;
}

export interface UpdateCustomerStatusResponse {
  success: boolean;
  data?: AdminCustomer;
  error?: string;
}
