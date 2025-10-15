import { FastifyRequest, FastifyReply } from "fastify";
import {
  GetTransactionsByVariantQuery,
  GetTransactionsByVariantQueryHandler,
  ListTransactionsQuery,
  ListTransactionsQueryHandler,
} from "../../../application";
import { StockManagementService } from "../../../application/services/stock-management.service";

export class InventoryTransactionController {
  private getTransactionsByVariantHandler: GetTransactionsByVariantQueryHandler;
  private listTransactionsHandler: ListTransactionsQueryHandler;

  constructor(private readonly stockService: StockManagementService) {
    this.getTransactionsByVariantHandler = new GetTransactionsByVariantQueryHandler(stockService);
    this.listTransactionsHandler = new ListTransactionsQueryHandler(stockService);
  }

  async getTransactionsByVariant(request: FastifyRequest<{ Params: { variantId: string } }>, reply: FastifyReply) {
    try {
      const { variantId } = request.params;
      const queryParams = request.query as any;
      const query: GetTransactionsByVariantQuery = {
        variantId,
        locationId: queryParams.locationId,
        limit: queryParams.limit ? Number(queryParams.limit) : undefined,
        offset: queryParams.offset ? Number(queryParams.offset) : undefined,
      };

      const result = await this.getTransactionsByVariantHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({ success: true, data: result.data });
      } else {
        return reply.code(400).send({ success: false, error: result.error, errors: result.errors });
      }
    } catch (error) {
      request.log.error(error, "Failed to get transactions by variant");
      return reply.code(500).send({ success: false, error: "Internal server error" });
    }
  }

  async listTransactions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const queryParams = request.query as any;
      const query: ListTransactionsQuery = {
        variantId: queryParams.variantId,
        locationId: queryParams.locationId,
        limit: queryParams.limit ? Number(queryParams.limit) : undefined,
        offset: queryParams.offset ? Number(queryParams.offset) : undefined,
      };

      const result = await this.listTransactionsHandler.handle(query);

      if (result.success && result.data) {
        return reply.code(200).send({ success: true, data: result.data });
      } else {
        return reply.code(400).send({ success: false, error: result.error, errors: result.errors });
      }
    } catch (error) {
      request.log.error(error, "Failed to list transactions");
      return reply.code(500).send({ success: false, error: "Internal server error" });
    }
  }
}
