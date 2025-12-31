/**
 * Shared types used across multiple features
 * Only put types here if used by 3+ features
 */

export interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ImageAsset {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export type Currency = "USD" | "LKR" | "EUR" | "GBP";

export type DateString = string; // ISO 8601 format
