import { IQuery } from './Query';
import { Product } from '../../domain/entities/product.entity';

export class GetProductQuery implements IQuery<Product> {
  readonly queryId?: string;
  readonly timestamp?: Date;

  constructor(
    public readonly productId: string,
    queryId?: string
  ) {
    this.queryId = queryId;
    this.timestamp = new Date();
  }
}