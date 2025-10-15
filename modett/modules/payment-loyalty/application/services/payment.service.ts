import { PrismaClient } from "@prisma/client";
import { IPaymentIntentRepository } from "../../domain/repositories/payment-intent.repository.js";
import { IPaymentTransactionRepository } from "../../domain/repositories/payment-transaction.repository.js";
import { PaymentIntent } from "../../domain/entities/payment-intent.entity.js";
import { PaymentTransaction } from "../../domain/entities/payment-transaction.entity.js";
import { Money } from "../../domain/value-objects/money.vo.js";
import { PaymentTransactionType } from "../../domain/value-objects/payment-transaction-type.vo.js";

export interface CreatePaymentIntentDto {
  orderId: string;
  provider: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
  clientSecret?: string;
}

export interface ProcessPaymentDto {
  intentId: string;
  pspReference?: string;
}

export interface RefundPaymentDto {
  intentId: string;
  amount?: number; // Partial refund amount (if not provided, full refund)
  reason?: string;
}

export interface PaymentIntentDto {
  intentId: string;
  orderId: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  idempotencyKey?: string;
  clientSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransactionDto {
  txnId: string;
  intentId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  pspReference: string | null;
  failureReason: string | null;
  createdAt: Date;
}

export class PaymentService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly paymentIntentRepo: IPaymentIntentRepository,
    private readonly paymentTxnRepo: IPaymentTransactionRepository
  ) {}

  async createPaymentIntent(
    dto: CreatePaymentIntentDto
  ): Promise<PaymentIntentDto> {
    const intent = PaymentIntent.create({
      orderId: dto.orderId,
      provider: dto.provider,
      amount: dto.amount,
      currency: dto.currency || "USD",
      idempotencyKey: dto.idempotencyKey,
      clientSecret: dto.clientSecret,
    });

    await this.paymentIntentRepo.save(intent);

    return this.toPaymentIntentDto(intent);
  }

  async authorizePayment(dto: ProcessPaymentDto): Promise<PaymentIntentDto> {
    const intent = await this.paymentIntentRepo.findById(dto.intentId);
    if (!intent) {
      throw new Error(`Payment intent ${dto.intentId} not found`);
    }

    // Authorize the payment
    intent.authorize();

    // Create authorization transaction record
    const transaction = PaymentTransaction.create({
      txnId: crypto.randomUUID(),
      intentId: intent.intentId.getValue(),
      type: PaymentTransactionType.auth(),
      amount: intent.amount,
      status: "SUCCESS",
      pspReference: dto.pspReference || null,
      failureReason: null,
    });

    await this.prisma.$transaction([
      this.paymentIntentRepo.update(intent) as any,
      this.paymentTxnRepo.save(transaction) as any,
    ]);

    return this.toPaymentIntentDto(intent);
  }

  async capturePayment(
    intentId: string,
    pspReference?: string
  ): Promise<PaymentIntentDto> {
    const intent = await this.paymentIntentRepo.findById(intentId);
    if (!intent) {
      throw new Error(`Payment intent ${intentId} not found`);
    }

    // Capture the payment
    intent.capture();

    // Create capture transaction record
    const transaction = PaymentTransaction.create({
      txnId: crypto.randomUUID(),
      intentId: intent.intentId.getValue(),
      type: PaymentTransactionType.capture(),
      amount: intent.amount,
      status: "SUCCESS",
      pspReference: pspReference || null,
      failureReason: null,
    });

    await this.prisma.$transaction([
      this.paymentIntentRepo.update(intent) as any,
      this.paymentTxnRepo.save(transaction) as any,
    ]);

    return this.toPaymentIntentDto(intent);
  }

  async refundPayment(dto: RefundPaymentDto): Promise<PaymentIntentDto> {
    const intent = await this.paymentIntentRepo.findById(dto.intentId);
    if (!intent) {
      throw new Error(`Payment intent ${dto.intentId} not found`);
    }

    if (!intent.isCaptured()) {
      throw new Error(
        `Cannot refund payment with status ${intent.status.getValue()}`
      );
    }

    // Determine refund amount
    const refundAmount = dto.amount
      ? Money.fromAmount(dto.amount, intent.amount.getCurrency())
      : intent.amount;

    // Create refund transaction
    const refundTransaction = PaymentTransaction.create({
      txnId: crypto.randomUUID(),
      intentId: intent.intentId.getValue(),
      type: PaymentTransactionType.refund(),
      amount: refundAmount,
      status: "SUCCESS",
      pspReference: null,
      failureReason: null,
    });

    // Note: PaymentIntent doesn't have a refund() method in the entity
    // In a real implementation, we might cancel it or track refunds separately
    intent.cancel();

    await this.prisma.$transaction([
      this.paymentIntentRepo.update(intent) as any,
      this.paymentTxnRepo.save(refundTransaction) as any,
    ]);

    return this.toPaymentIntentDto(intent);
  }

  async cancelPayment(intentId: string): Promise<PaymentIntentDto> {
    const intent = await this.paymentIntentRepo.findById(intentId);
    if (!intent) {
      throw new Error(`Payment intent ${intentId} not found`);
    }

    intent.cancel();

    await this.paymentIntentRepo.update(intent);

    return this.toPaymentIntentDto(intent);
  }

  async failPayment(
    intentId: string,
    failureReason: string
  ): Promise<PaymentIntentDto> {
    const intent = await this.paymentIntentRepo.findById(intentId);
    if (!intent) {
      throw new Error(`Payment intent ${intentId} not found`);
    }

    intent.fail();

    // Create failed transaction record
    const transaction = PaymentTransaction.create({
      txnId: crypto.randomUUID(),
      intentId: intent.intentId.getValue(),
      type: PaymentTransactionType.capture(),
      amount: intent.amount,
      status: "FAILED",
      pspReference: null,
      failureReason: failureReason,
    });

    await this.prisma.$transaction([
      this.paymentIntentRepo.update(intent) as any,
      this.paymentTxnRepo.save(transaction) as any,
    ]);

    return this.toPaymentIntentDto(intent);
  }

  async getPaymentIntent(intentId: string): Promise<PaymentIntentDto | null> {
    const intent = await this.paymentIntentRepo.findById(intentId);
    return intent ? this.toPaymentIntentDto(intent) : null;
  }

  async getPaymentIntentByOrderId(
    orderId: string
  ): Promise<PaymentIntentDto | null> {
    const intents = await this.paymentIntentRepo.findByOrderId(orderId);
    return intents.length > 0 ? this.toPaymentIntentDto(intents[0]) : null;
  }

  async getPaymentTransactions(
    intentId: string
  ): Promise<PaymentTransactionDto[]> {
    const transactions = await this.paymentTxnRepo.findByIntentId(intentId);
    return transactions.map((txn) => this.toPaymentTransactionDto(txn));
  }

  private toPaymentIntentDto(intent: PaymentIntent): PaymentIntentDto {
    return {
      intentId: intent.intentId.getValue(),
      orderId: intent.orderId,
      provider: intent.provider,
      amount: intent.amount.getAmount(),
      currency: intent.amount.getCurrency().getValue(),
      status: intent.status.getValue(),
      idempotencyKey: intent.idempotencyKey,
      clientSecret: intent.clientSecret,
      createdAt: intent.createdAt,
      updatedAt: intent.updatedAt,
    };
  }

  private toPaymentTransactionDto(
    txn: PaymentTransaction
  ): PaymentTransactionDto {
    return {
      txnId: txn.txnId,
      intentId: txn.intentId,
      type: txn.type.getValue(),
      amount: txn.amount.getAmount(),
      currency: txn.amount.getCurrency().getValue(),
      status: txn.status,
      pspReference: txn.pspReference,
      failureReason: txn.failureReason,
      createdAt: txn.createdAt,
    };
  }
}
