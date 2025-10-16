import { FastifyRequest, FastifyReply } from "fastify";
import {
  CreateGiftCardCommand,
  CreateGiftCardHandler,
  RedeemGiftCardCommand,
  RedeemGiftCardHandler,
  GetGiftCardBalanceQuery,
  GetGiftCardBalanceHandler,
  GetGiftCardTransactionsQuery,
  GetGiftCardTransactionsHandler,
} from "../../../application";
import { GiftCardService } from "../../../application/services/gift-card.service";

export interface CreateGiftCardRequest {
  code: string;
  initialBalance: number;
  currency?: string;
  expiresAt?: string;
  recipientEmail?: string;
  recipientName?: string;
  message?: string;
}

export interface RedeemGiftCardRequest {
  amount: number;
  orderId: string;
}

export class GiftCardController {
  private createHandler: CreateGiftCardHandler;
  private redeemHandler: RedeemGiftCardHandler;
  private balanceHandler: GetGiftCardBalanceHandler;
  private txnsHandler: GetGiftCardTransactionsHandler;

  constructor(private readonly giftCardService: GiftCardService) {
    this.createHandler = new CreateGiftCardHandler(giftCardService);
    this.redeemHandler = new RedeemGiftCardHandler(giftCardService);
    this.balanceHandler = new GetGiftCardBalanceHandler(giftCardService);
    this.txnsHandler = new GetGiftCardTransactionsHandler(giftCardService);
  }

  async create(
    request: FastifyRequest<{ Body: CreateGiftCardRequest }>,
    reply: FastifyReply
  ) {
    const body = request.body;
    const cmd: CreateGiftCardCommand = {
      code: body.code,
      initialBalance: body.initialBalance,
      currency: body.currency,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      recipientEmail: body.recipientEmail,
      recipientName: body.recipientName,
      message: body.message,
      timestamp: new Date(),
    };
    const result = await this.createHandler.handle(cmd);
    return reply.code(result.success ? 201 : 400).send(result);
  }

  async redeem(
    request: FastifyRequest<{ Params: { giftCardId: string }; Body: RedeemGiftCardRequest }>,
    reply: FastifyReply
  ) {
    const { giftCardId } = request.params;
    const body = request.body;
    const cmd: RedeemGiftCardCommand = {
      giftCardId,
      amount: body.amount,
      orderId: body.orderId,
      timestamp: new Date(),
    };
    const result = await this.redeemHandler.handle(cmd);
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async getBalance(
    request: FastifyRequest<{ Querystring: { codeOrId: string } }>,
    reply: FastifyReply
  ) {
    const query: GetGiftCardBalanceQuery = {
      codeOrId: request.query.codeOrId,
      timestamp: new Date(),
    };
    const result = await this.balanceHandler.handle(query);
    return reply.code(result.success ? 200 : 404).send(result);
  }

  async getTransactions(
    request: FastifyRequest<{ Params: { giftCardId: string } }>,
    reply: FastifyReply
  ) {
    const query: GetGiftCardTransactionsQuery = {
      giftCardId: request.params.giftCardId,
      timestamp: new Date(),
    };
    const result = await this.txnsHandler.handle(query);
    return reply.code(result.success ? 200 : 400).send(result);
  }
}
