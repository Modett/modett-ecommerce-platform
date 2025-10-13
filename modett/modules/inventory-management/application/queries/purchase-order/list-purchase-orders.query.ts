import { IQuery, IQueryHandler } from "../stock/get-stock.query";
import { CommandResult } from "../../commands/stock/add-stock.command";
import { PurchaseOrderManagementService } from "../../services/purchase-order-management.service";
import { PurchaseOrderResult } from "./get-purchase-order.query";

export interface ListPurchaseOrdersQuery extends IQuery {
  limit?: number;
  offset?: number;
  status?: string;
  supplierId?: string;
  sortBy?: "createdAt" | "updatedAt" | "eta";
  sortOrder?: "asc" | "desc";
}

export interface ListPurchaseOrdersResult {
  purchaseOrders: PurchaseOrderResult[];
  total: number;
}

export class ListPurchaseOrdersQueryHandler
  implements IQueryHandler<ListPurchaseOrdersQuery, CommandResult<ListPurchaseOrdersResult>>
{
  constructor(private readonly poService: PurchaseOrderManagementService) {}

  async handle(
    query: ListPurchaseOrdersQuery
  ): Promise<CommandResult<ListPurchaseOrdersResult>> {
    try {
      const result = await this.poService.listPurchaseOrders({
        limit: query.limit,
        offset: query.offset,
        status: query.status,
        supplierId: query.supplierId,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      const purchaseOrders: PurchaseOrderResult[] = result.purchaseOrders.map((po) => ({
        poId: po.getPoId().getValue(),
        supplierId: po.getSupplierId().getValue(),
        eta: po.getEta() ?? undefined,
        status: po.getStatus().getValue(),
        createdAt: po.getCreatedAt(),
        updatedAt: po.getUpdatedAt(),
      }));

      return CommandResult.success({
        purchaseOrders,
        total: result.total,
      });
    } catch (error) {
      return CommandResult.failure<ListPurchaseOrdersResult>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"]
      );
    }
  }
}

export { ListPurchaseOrdersQueryHandler as ListPurchaseOrdersHandler };
