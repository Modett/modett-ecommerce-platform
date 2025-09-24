import { IQuery } from './Query';
import { Product } from '../../domain/entities/product.entity';

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export class ListProductsQuery implements IQuery<ProductListResult> {
  readonly queryId?: string;
  readonly timestamp?: Date;

  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly status?: 'draft' | 'published' | 'scheduled',
    public readonly categoryId?: string,
    public readonly brand?: string,
    public readonly sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'publishAt',
    public readonly sortOrder?: 'asc' | 'desc',
    queryId?: string
  ) {
    this.queryId = queryId;
    this.timestamp = new Date();
  }
}