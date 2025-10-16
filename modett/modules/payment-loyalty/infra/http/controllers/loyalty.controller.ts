import { FastifyRequest, FastifyReply } from "fastify";
import {
  // Commands
  CreateLoyaltyProgramCommand,
  CreateLoyaltyProgramHandler,
  AwardLoyaltyPointsCommand,
  AwardLoyaltyPointsHandler,
  RedeemLoyaltyPointsCommand,
  RedeemLoyaltyPointsHandler,
  // Queries
  GetLoyaltyAccountQuery,
  GetLoyaltyAccountHandler,
  GetLoyaltyProgramsQuery,
  GetLoyaltyProgramsHandler,
  GetLoyaltyTransactionsQuery,
  GetLoyaltyTransactionsHandler,
} from "../../../application";
import {
  LoyaltyService,
} from "../../../application/services/loyalty.service";
import { LoyaltyTransactionService } from "../../../application/services/loyalty-transaction.service";

// Request DTOs
export interface CreateLoyaltyProgramRequest {
  name: string;
  earnRules: any;
  burnRules: any;
  tiers: any[];
}

export interface AwardPointsRequest {
  userId: string;
  programId: string;
  points: number;
  reason: string;
  orderId?: string;
}

export interface RedeemPointsRequest {
  userId: string;
  programId: string;
  points: number;
  orderId: string;
}

export class LoyaltyController {
  private createProgramHandler: CreateLoyaltyProgramHandler;
  private awardPointsHandler: AwardLoyaltyPointsHandler;
  private redeemPointsHandler: RedeemLoyaltyPointsHandler;

  private getAccountHandler: GetLoyaltyAccountHandler;
  private getProgramsHandler: GetLoyaltyProgramsHandler;
  private getTransactionsHandler: GetLoyaltyTransactionsHandler;

  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly loyaltyTxnService: LoyaltyTransactionService
  ) {
    // Commands
    this.createProgramHandler = new CreateLoyaltyProgramHandler(loyaltyService);
    this.awardPointsHandler = new AwardLoyaltyPointsHandler(loyaltyService);
    this.redeemPointsHandler = new RedeemLoyaltyPointsHandler(loyaltyService);

    // Queries
    this.getAccountHandler = new GetLoyaltyAccountHandler(loyaltyService);
    this.getProgramsHandler = new GetLoyaltyProgramsHandler(loyaltyService);
    this.getTransactionsHandler = new GetLoyaltyTransactionsHandler(
      loyaltyTxnService
    );
  }

  // Commands
  async createProgram(
    request: FastifyRequest<{ Body: CreateLoyaltyProgramRequest }>,
    reply: FastifyReply
  ) {
    const body = request.body;
    const cmd: CreateLoyaltyProgramCommand = {
      name: body.name,
      earnRules: body.earnRules,
      burnRules: body.burnRules,
      tiers: body.tiers,
      timestamp: new Date(),
    };
    const result = await this.createProgramHandler.handle(cmd);
    return reply.code(result.success ? 201 : 400).send(result);
  }

  async awardPoints(
    request: FastifyRequest<{ Body: AwardPointsRequest }>,
    reply: FastifyReply
  ) {
    const cmd: AwardLoyaltyPointsCommand = { ...request.body, timestamp: new Date() };
    const result = await this.awardPointsHandler.handle(cmd);
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async redeemPoints(
    request: FastifyRequest<{ Body: RedeemPointsRequest }>,
    reply: FastifyReply
  ) {
    const cmd: RedeemLoyaltyPointsCommand = { ...request.body, timestamp: new Date() };
    const result = await this.redeemPointsHandler.handle(cmd);
    return reply.code(result.success ? 200 : 400).send(result);
  }

  // Queries
  async getAccount(
    request: FastifyRequest<{ Querystring: { userId: string; programId: string } }>,
    reply: FastifyReply
  ) {
    const query: GetLoyaltyAccountQuery = {
      userId: request.query.userId,
      programId: request.query.programId,
      timestamp: new Date(),
    };
    const result = await this.getAccountHandler.handle(query);
    return reply.code(result.success ? 200 : 404).send(result);
  }

  async getPrograms(
    _request: FastifyRequest,
    reply: FastifyReply
  ) {
    const result = await this.getProgramsHandler.handle({ timestamp: new Date() });
    return reply.code(result.success ? 200 : 400).send(result);
  }

  async getTransactions(
    request: FastifyRequest<{ Querystring: { accountId?: string; orderId?: string } }>,
    reply: FastifyReply
  ) {
    const query: GetLoyaltyTransactionsQuery = {
      accountId: request.query.accountId,
      orderId: request.query.orderId,
      timestamp: new Date(),
    };
    const result = await this.getTransactionsHandler.handle(query);
    return reply.code(result.success ? 200 : 400).send(result);
  }
}
