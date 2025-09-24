import { IQuery } from './Query';
import { Product } from '../../domain/entities/product.entity';

export interface ProductSearchResult {
  products: Product[];
  total: number;
  query: string;
  page: number;
  limit: number;
}

export interface SearchProductsQuery extends IQuery<ProductSearchResult> {
  searchTerm: string;
  page?: number;
  limit?: number;
  filters?: {
    status?: 'draft' | 'published' | 'scheduled';
    categoryIds?: string[];
    brands?: string[];
    priceRange?: { min?: number; max?: number };
  };
}