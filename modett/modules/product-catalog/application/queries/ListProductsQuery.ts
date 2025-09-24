import { IQuery } from './Query';
import { Product } from '../../domain/entities/product.entity';

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ListProductsQuery extends IQuery<ProductListResult> {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published' | 'scheduled';
  categoryId?: string;
  brand?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'publishAt';
  sortOrder?: 'asc' | 'desc';
}