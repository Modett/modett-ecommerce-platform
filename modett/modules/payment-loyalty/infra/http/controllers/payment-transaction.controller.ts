import { FastifyRequest, FastifyReply } from "fastify";
import {
  GetPaymentTransactionsQuery,
  GetPaymentTransactionsHandler,
} from "../../../application";
import { PaymentService } from "../../../application/services/payment.service";

export class PaymentTransactionController {
  private listHandler: GetPaymentTransactionsHandler;

  constructor(private readonly paymentService: PaymentService) {
    this.listHandler = new GetPaymentTransactionsHandler(paymentService);
  }

  async list(
    request: FastifyRequest<{ Params: { intentId: string } }>,
    reply: FastifyReply
  ) {
    const result = await this.listHandler.handle({
      intentId: request.params.intentId,
      timestamp: new Date(),
    });
    return reply.code(result.success ? 200 : 400).send(result);
  }
}
