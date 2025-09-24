import { IQuery } from './Query';
import { Product } from '../../domain/entities/product.entity';

export interface GetProductQuery extends IQuery<Product> {
  productId: string;
}