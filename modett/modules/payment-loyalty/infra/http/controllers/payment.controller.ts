import { FastifyRequest, FastifyReply } from "fastify";
import {
  // Payment
  CreatePaymentIntentCommand,
  CreatePaymentIntentHandler,
  ProcessPaymentCommand,
  ProcessPaymentHandler,
  RefundPaymentCommand,
  RefundPaymentHandler,
  VoidPaymentCommand,
  VoidPaymentHandler,
  // BNPL
  CreateBnplTransactionCommand,
  CreateBnplTransactionHandler,
  ProcessBnplPaymentCommand,
  ProcessBnplPaymentHandler,
  // Gift cards
  CreateGiftCardCommand,
  CreateGiftCardHandler,
  RedeemGiftCardCommand,
  RedeemGiftCardHandler,
  // Promotions
  CreatePromotionCommand,
  CreatePromotionHandler,
  ApplyPromotionCommand,
  ApplyPromotionHandler,
  RecordPromotionUsageCommand,
  RecordPromotionUsageHandler,
  // Webhooks
  ProcessWebhookEventCommand,
  ProcessWebhookEventHandler,
  // Queries
  GetPaymentIntentQuery,
  GetPaymentIntentHandler,
  GetPaymentTransactionsQuery,
  GetPaymentTransactionsHandler,
  GetBnplTransactionsQuery,
  GetBnplTransactionsHandler,
  GetGiftCardBalanceQuery,
  GetGiftCardBalanceHandler,
  GetGiftCardTransactionsQuery,
  GetGiftCardTransactionsHandler,
  GetActivePromotionsQuery,
  GetActivePromotionsHandler,
  GetPromotionUsageQuery,
  GetPromotionUsageHandler,
  GetWebhookEventsQuery,
  GetWebhookEventsHandler,
} from "../../../application";
import {
  PaymentService,
  BnplTransactionService,
  GiftCardService,
  PromotionService,
  PaymentWebhookService,
} from "../../../application/services";

// Request DTOs (subset for clarity)
export interface CreatePaymentIntentRequest {
  orderId: string;
  provider: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  clientSecret?: string;
}

export interface ProcessPaymentRequest {
  intentId: string;
  pspReference?: string;
}

export interface RefundPaymentRequest {
  intentId: string;
  amount?: number;
  reason?: string;
}

export interface VoidPaymentRequest {
  intentId: string;
  pspReference?: string;
}

export interface CreateBnplTransactionRequest {
  intentId: string;
  provider: string;
  plan: any;
}

export interface ProcessBnplPaymentParams {
  bnplId: string;
  action: "approve" | "reject" | "activate" | "complete" | "cancel";
}

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

export interface ApplyPromotionRequest {
  promoCode: string;
  orderId?: string;
  orderAmount: number;
  currency?: string;
  products?: string[];
  categories?: string[];
}

export interface CreatePromotionRequest {
  code?: string;
  rule: any;
  startsAt?: string;
  endsAt?: string;
  usageLimit?: number;
}

export interface RecordPromotionUsageRequest {
  orderId: string;
  discountAmount: number;
  currency?: string;
}

export interface ProcessWebhookEventRequest {
  provider: string;
  eventType: string;
  eventData: Record<string, any>;
}

export class PaymentController {
  // Handlers
  private createPaymentIntentHandler: CreatePaymentIntentHandler;
  private processPaymentHandler: ProcessPaymentHandler;
  private refundPaymentHandler: RefundPaymentHandler;
  private voidPaymentHandler: VoidPaymentHandler;

  private createBnplTxnHandler: CreateBnplTransactionHandler;
  private processBnplPaymentHandler: ProcessBnplPaymentHandler;

  private createGiftCardHandler: CreateGiftCardHandler;
  private redeemGiftCardHandler: RedeemGiftCardHandler;

  private createPromotionHandler: CreatePromotionHandler;
  private applyPromotionHandler: ApplyPromotionHandler;
  private recordPromotionUsageHandler: RecordPromotionUsageHandler;

  private processWebhookEventHandler: ProcessWebhookEventHandler;

  // Queries
  private getPaymentIntentHandler: GetPaymentIntentHandler;
  private getPaymentTransactionsHandler: GetPaymentTransactionsHandler;
  private getBnplTransactionsHandler: GetBnplTransactionsHandler;
  private getGiftCardBalanceHandler: GetGiftCardBalanceHandler;
  private getGiftCardTransactionsHandler: GetGiftCardTransactionsHandler;
  private getActivePromotionsHandler: GetActivePromotionsHandler;
  private getPromotionUsageHandler: GetPromotionUsageHandler;
  private getWebhookEventsHandler: GetWebhookEventsHandler;

  constructor(
    paymentService: PaymentService,
    bnplService: BnplTransactionService,
    giftCardService: GiftCardService,
    promotionService: PromotionService,
    webhookService: PaymentWebhookService
  ) {
    // Commands
    this.createPaymentIntentHandler = new CreatePaymentIntentHandler(paymentService);
    this.processPaymentHandler = new ProcessPaymentHandler(paymentService);
    this.refundPaymentHandler = new RefundPaymentHandler(paymentService);
    this.voidPaymentHandler = new VoidPaymentHandler(paymentService);

    this.createBnplTxnHandler = new CreateBnplTransactionHandler(bnplService);
    this.processBnplPaymentHandler = new ProcessBnplPaymentHandler(bnplService);

    this.createGiftCardHandler = new CreateGiftCardHandler(giftCardService);
    this.redeemGiftCardHandler = new RedeemGiftCardHandler(giftCardService);

    this.createPromotionHandler = new CreatePromotionHandler(promotionService);
    this.applyPromotionHandler = new ApplyPromotionHandler(promotionService);
    this.recordPromotionUsageHandler = new RecordPromotionUsageHandler(
      promotionService
    );

    this.processWebhookEventHandler = new ProcessWebhookEventHandler(
      webhookService
    );

    // Queries
    this.getPaymentIntentHandler = new GetPaymentIntentHandler(paymentService);
    this.getPaymentTransactionsHandler = new GetPaymentTransactionsHandler(
      paymentService
    );
    this.getBnplTransactionsHandler = new GetBnplTransactionsHandler(bnplService);
    this.getGiftCardBalanceHandler = new GetGiftCardBalanceHandler(giftCardService);
    this.getGiftCardTransactionsHandler = new GetGiftCardTransactionsHandler(
      giftCardService
    );
    this.getActivePromotionsHandler = new GetActivePromotionsHandler(
      promotionService
    );
    this.getPromotionUsageHandler = new GetPromotionUsageHandler(promotionService);
    this.getWebhookEventsHandler = new GetWebhookEventsHandler(webhookService);
  }

  // Commands
  async createPaymentIntent(
    request: FastifyRequest<{ Body: CreatePaymentIntentRequest }>,
    reply: FastifyReply
  ) {
    const body = request.body;
    const cmd: CreatePaymentIntentCommand = {
      ...body,
      timestamp: new Date(),
    };
    const result = await this.createPaymentIntentHandler.handle(cmd);
    return reply.code(result.success ? 201 : 400).send(result);
  }

  async processPayment(
    request: FastifyRequest<{ Body: ProcessPaymentRequest }>,
    reply: FastifyReply
  ) {
    const cmd: ProcessPaymentCommand = { ...request.body, timestamp: new Date() };
    const result = await this.processPaymentHandler.handle(cmd);
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async refundPayment(
    request: FastifyRequest<{ Body: RefundPaymentRequest }>,
    reply: FastifyReply
  ) {
    const cmd: RefundPaymentCommand = { ...request.body, timestamp: new Date() };
    const result = await this.refundPaymentHandler.handle(cmd);
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async voidPayment(
    request: FastifyRequest<{ Body: VoidPaymentRequest }>,
    reply: FastifyReply
  ) {
    const cmd: VoidPaymentCommand = { ...request.body, timestamp: new Date() };
    const result = await this.voidPaymentHandler.handle(cmd);
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async createBnplTransaction(
    request: FastifyRequest<{ Body: CreateBnplTransactionRequest }>,
    reply: FastifyReply
  ) {
    const cmd: CreateBnplTransactionCommand = {
      ...request.body,
      timestamp: new Date(),
    };
    const result = await this.createBnplTxnHandler.handle(cmd);
    return reply.code(result.success ? 201 : 400).send(result);
  }

  async processBnpl(
    request: FastifyRequest<{ Params: ProcessBnplPaymentParams }>,
    reply: FastifyReply
  ) {
    const { bnplId, action } = request.params;
    const cmd: ProcessBnplPaymentCommand = { bnplId, action, timestamp: new Date() };
    const result = await this.processBnplPaymentHandler.handle(cmd);
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async createGiftCard(
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
    const result = await this.createGiftCardHandler.handle(cmd);
    return reply.code(result.success ? 201 : 400).send(result);
  }

  async redeemGiftCard(
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
    const result = await this.redeemGiftCardHandler.handle(cmd);
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async createPromotion(
    request: FastifyRequest<{ Body: CreatePromotionRequest }>,
    reply: FastifyReply
  ) {
    const body = request.body;
    const cmd: CreatePromotionCommand = {
      code: body.code,
      rule: body.rule,
      startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
      endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      usageLimit: body.usageLimit,
      timestamp: new Date(),
    };
    const result = await this.createPromotionHandler.handle(cmd);
    return reply.code(result.success ? 201 : 400).send(result);
  }

  async applyPromotion(
    request: FastifyRequest<{ Body: ApplyPromotionRequest }>,
    reply: FastifyReply
  ) {
    const cmd: ApplyPromotionCommand = { ...request.body, timestamp: new Date() };
    const result = await this.applyPromotionHandler.handle(cmd);
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async recordPromotionUsage(
    request: FastifyRequest<{ Params: { promoId: string }; Body: RecordPromotionUsageRequest }>,
    reply: FastifyReply
  ) {
    const { promoId } = request.params;
    const body = request.body;
    const cmd: RecordPromotionUsageCommand = {
      promoId,
      orderId: body.orderId,
      discountAmount: body.discountAmount,
      currency: body.currency,
      timestamp: new Date(),
    };
    const result = await this.recordPromotionUsageHandler.handle(cmd);
    return reply.code(result.success ? 201 : 400).send(result);
  }

  async processWebhook(
    request: FastifyRequest<{ Body: ProcessWebhookEventRequest }>,
    reply: FastifyReply
  ) {
    const cmd: ProcessWebhookEventCommand = { ...request.body, timestamp: new Date() };
    const result = await this.processWebhookEventHandler.handle(cmd);
    return reply.code(result.success ? 201 : 400).send(result);
  }

  // Queries
  async getPaymentIntent(
    request: FastifyRequest<{ Querystring: { intentId?: string; orderId?: string } }>,
    reply: FastifyReply
  ) {
    const query: GetPaymentIntentQuery = {
      intentId: request.query.intentId,
      orderId: request.query.orderId,
      timestamp: new Date(),
    };
    const result = await this.getPaymentIntentHandler.handle(query);
    return reply.code(result.success ? 200 : 404).send(result);
  }

  async getPaymentTransactions(
    request: FastifyRequest<{ Params: { intentId: string } }>,
    reply: FastifyReply
  ) {
    const result = await this.getPaymentTransactionsHandler.handle({
      intentId: request.params.intentId,
      timestamp: new Date(),
    });
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async getBnplTransactions(
    request: FastifyRequest<{ Querystring: { bnplId?: string; intentId?: string; orderId?: string } }>,
    reply: FastifyReply
  ) {
    const result = await this.getBnplTransactionsHandler.handle({
      ...request.query,
      timestamp: new Date(),
    });
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async getGiftCardBalance(
    request: FastifyRequest<{ Querystring: { codeOrId: string } }>,
    reply: FastifyReply
  ) {
    const result = await this.getGiftCardBalanceHandler.handle({
      codeOrId: request.query.codeOrId,
      timestamp: new Date(),
    });
    return reply.code(result.success ? 200 : 404).send(result);
  }

  async getGiftCardTransactions(
    request: FastifyRequest<{ Params: { giftCardId: string } }>,
    reply: FastifyReply
  ) {
    const result = await this.getGiftCardTransactionsHandler.handle({
      giftCardId: request.params.giftCardId,
      timestamp: new Date(),
    });
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async getActivePromotions(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    const result = await this.getActivePromotionsHandler.handle({
      timestamp: new Date(),
    });
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async getPromotionUsage(
    request: FastifyRequest<{ Params: { promoId: string } }>,
    reply: FastifyReply
  ) {
    const result = await this.getPromotionUsageHandler.handle({
      promoId: request.params.promoId,
      timestamp: new Date(),
    });
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async getWebhookEvents(
    request: FastifyRequest<{ Querystring: { provider?: string; eventType?: string; createdAfter?: string; createdBefore?: string } }>,
    reply: FastifyReply
  ) {
    const result = await this.getWebhookEventsHandler.handle({
      provider: request.query.provider,
      eventType: request.query.eventType,
      createdAfter: request.query.createdAfter
        ? new Date(request.query.createdAfter)
        : undefined,
      createdBefore: request.query.createdBefore
        ? new Date(request.query.createdBefore)
        : undefined,
      timestamp: new Date(),
    });
    return reply.code(result.success ? 200 : 400).send(result);
  }
}
