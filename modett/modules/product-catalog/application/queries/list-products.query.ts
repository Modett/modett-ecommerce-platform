import { ProductManagementService } from "../services/product-management.service";
import { Product } from "../../domain/entities/product.entity";
import { CommandResult } from "../commands/create-product.command";

// Query interfaces - duplicated to avoid cross-imports
export interface IQuery {
  readonly queryId?: string;
  readonly timestamp?: Date;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = any> {
  handle(query: TQuery): Promise<TResult>;
}

export interface ProductResult {
  productId: string;
  title: string;
  slug: string;
  brand?: string;
  shortDesc?: string;
  longDescHtml?: string;
  status: string;
  publishAt?: Date;
  countryOfOrigin?: string;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListProductsQuery extends IQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  brand?: string;
  status?: "draft" | "published" | "scheduled";
  sortBy?: "title" | "createdAt" | "updatedAt" | "publishAt";
  sortOrder?: "asc" | "desc";
}

export interface ListProductsResult {
  products: ProductResult[];
  totalCount: number;
  page: number;
  limit: number;
}

export class ListProductsHandler
  implements IQueryHandler<ListProductsQuery, CommandResult<ListProductsResult>>
{
  constructor(
    private readonly productManagementService: ProductManagementService
  ) {}

  async handle(
    query: ListProductsQuery
  ): Promise<CommandResult<ListProductsResult>> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 20;

      // TODO: Implement actual list products logic in service
      const products = await this.productManagementService.getAllProducts({
        page,
        limit,
        categoryId: query.categoryId,
        brand: query.brand,
        status: query.status,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      const productResults: ProductResult[] = products.items.map(
        (product: Product) => ({
          productId: product.getId().toString(),
          title: product.getTitle(),
          slug: product.getSlug().toString(),
          brand: product.getBrand() ?? undefined,
          shortDesc: product.getShortDesc() ?? undefined,
          longDescHtml: product.getLongDescHtml() ?? undefined,
          status: product.getStatus(),
          publishAt: product.getPublishAt() ?? undefined,
          countryOfOrigin: product.getCountryOfOrigin() ?? undefined,
          seoTitle: product.getSeoTitle() ?? undefined,
          seoDescription: product.getSeoDescription() ?? undefined,
          createdAt: product.getCreatedAt(),
          updatedAt: product.getUpdatedAt(),
        })
      );

      const result: ListProductsResult = {
        products: productResults,
        totalCount: products.totalCount,
        page,
        limit,
      };

      return CommandResult.success<ListProductsResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<ListProductsResult>(
          "Failed to retrieve products",
          [error.message]
        );
      }

      return CommandResult.failure<ListProductsResult>(
        "An unexpected error occurred while retrieving products"
      );
    }
  }
}
