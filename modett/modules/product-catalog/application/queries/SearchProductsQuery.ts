import { IQuery } from './Query';
import { Product } from '../../domain/entities/product.entity';

export interface ProductSearchResult {
  products: Product[];
  total: number;
  query: string;
  page: number;
  limit: number;
}

export class SearchProductsQuery implements IQuery<ProductSearchResult> {
  readonly queryId?: string;
  readonly timestamp?: Date;

  constructor(
    public readonly searchTerm: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly filters?: {
      status?: 'draft' | 'published' | 'scheduled';
      categoryIds?: string[];
      brands?: string[];
      priceRange?: { min?: number; max?: number };
    },
    queryId?: string
  ) {
    this.queryId = queryId;
    this.timestamp = new Date();
  }
}