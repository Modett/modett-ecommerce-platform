import { PrismaClient } from "@prisma/client";
import { IBnplTransactionRepository } from "../../domain/repositories/bnpl-transaction.repository.js";
import {
  BnplTransaction,
  BnplPlan,
} from "../../domain/entities/bnpl-transaction.entity.js";

export interface CreateBnplTransactionDto {
  intentId: string;
  provider: string;
  plan: BnplPlan;
}

export interface UpdateBnplStatusDto {
  bnplId: string;
  status: "approved" | "rejected" | "active" | "completed" | "cancelled";
}

export interface BnplTransactionDto {
  bnplId: string;
  intentId: string;
  provider: string;
  plan: BnplPlan;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BnplTransactionService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly bnplTxnRepo: IBnplTransactionRepository
  ) {}

  async createBnplTransaction(
    dto: CreateBnplTransactionDto
  ): Promise<BnplTransactionDto> {
    const transaction = BnplTransaction.create({
      intentId: dto.intentId,
      provider: dto.provider,
      plan: dto.plan,
    });

    await this.bnplTxnRepo.save(transaction);

    return this.toBnplTransactionDto(transaction);
  }

  async approveBnplTransaction(bnplId: string): Promise<BnplTransactionDto> {
    const transaction = await this.bnplTxnRepo.findById(bnplId);
    if (!transaction) {
      throw new Error(`BNPL transaction ${bnplId} not found`);
    }

    transaction.approve();
    await this.bnplTxnRepo.update(transaction);

    return this.toBnplTransactionDto(transaction);
  }

  async rejectBnplTransaction(bnplId: string): Promise<BnplTransactionDto> {
    const transaction = await this.bnplTxnRepo.findById(bnplId);
    if (!transaction) {
      throw new Error(`BNPL transaction ${bnplId} not found`);
    }

    transaction.reject();
    await this.bnplTxnRepo.update(transaction);

    return this.toBnplTransactionDto(transaction);
  }

  async activateBnplTransaction(bnplId: string): Promise<BnplTransactionDto> {
    const transaction = await this.bnplTxnRepo.findById(bnplId);
    if (!transaction) {
      throw new Error(`BNPL transaction ${bnplId} not found`);
    }

    transaction.activate();
    await this.bnplTxnRepo.update(transaction);

    return this.toBnplTransactionDto(transaction);
  }

  async completeBnplTransaction(bnplId: string): Promise<BnplTransactionDto> {
    const transaction = await this.bnplTxnRepo.findById(bnplId);
    if (!transaction) {
      throw new Error(`BNPL transaction ${bnplId} not found`);
    }

    transaction.complete();
    await this.bnplTxnRepo.update(transaction);

    return this.toBnplTransactionDto(transaction);
  }

  async cancelBnplTransaction(bnplId: string): Promise<BnplTransactionDto> {
    const transaction = await this.bnplTxnRepo.findById(bnplId);
    if (!transaction) {
      throw new Error(`BNPL transaction ${bnplId} not found`);
    }

    transaction.cancel();
    await this.bnplTxnRepo.update(transaction);

    return this.toBnplTransactionDto(transaction);
  }

  async getBnplTransaction(bnplId: string): Promise<BnplTransactionDto | null> {
    const transaction = await this.bnplTxnRepo.findById(bnplId);
    return transaction ? this.toBnplTransactionDto(transaction) : null;
  }

  async getBnplTransactionByIntentId(
    intentId: string
  ): Promise<BnplTransactionDto | null> {
    const transaction = await this.bnplTxnRepo.findByIntentId(intentId);
    return transaction ? this.toBnplTransactionDto(transaction) : null;
  }

  async getBnplTransactionsByOrderId(
    orderId: string
  ): Promise<BnplTransactionDto[]> {
    const transactions = await this.bnplTxnRepo.findByOrderId(orderId);
    return transactions.map((t) => this.toBnplTransactionDto(t));
  }

  private toBnplTransactionDto(
    transaction: BnplTransaction
  ): BnplTransactionDto {
    return {
      bnplId: transaction.bnplId,
      intentId: transaction.intentId,
      provider: transaction.provider,
      plan: transaction.plan,
      status: transaction.status,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
