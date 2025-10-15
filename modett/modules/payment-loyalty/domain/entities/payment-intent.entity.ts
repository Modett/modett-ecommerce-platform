import { PaymentIntentId } from "../value-objects/payment-intent-id.vo";
import { PaymentIntentStatus } from "../value-objects/payment-intent-status.vo";
import { Money } from "../value-objects/money.vo";
import { Currency } from "../value-objects/currency.vo";

export interface CreatePaymentIntentData {
  orderId: string;
  provider: string;
  amount: number;
  currency: string;
  idempotencyKey?: string;
  clientSecret?: string;
}

export class PaymentIntent {
  private constructor(
    private readonly _intentId: PaymentIntentId,
    private readonly _orderId: string,
    private readonly _idempotencyKey: string | undefined,
    private readonly _provider: string,
    private _status: PaymentIntentStatus,
    private readonly _amount: Money,
    private _clientSecret: string | undefined,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(data: CreatePaymentIntentData): PaymentIntent {
    const intentId = PaymentIntentId.create();
    const currency = Currency.create(data.currency);
    const amount = Money.fromAmount(data.amount, currency);
    const now = new Date();

    return new PaymentIntent(
      intentId,
      data.orderId,
      data.idempotencyKey,
      data.provider,
      PaymentIntentStatus.requiresAction(),
      amount,
      data.clientSecret,
      now,
      now
    );
  }

  static reconstitute(data: {
    intentId: PaymentIntentId;
    orderId: string;
    idempotencyKey?: string;
    provider: string;
    status: PaymentIntentStatus;
    amount: Money;
    clientSecret?: string;
    createdAt: Date;
    updatedAt: Date;
  }): PaymentIntent {
    return new PaymentIntent(
      data.intentId,
      data.orderId,
      data.idempotencyKey,
      data.provider,
      data.status,
      data.amount,
      data.clientSecret,
      data.createdAt,
      data.updatedAt
    );
  }

  // Getters
  get intentId(): PaymentIntentId {
    return this._intentId;
  }

  get orderId(): string {
    return this._orderId;
  }

  get idempotencyKey(): string | undefined {
    return this._idempotencyKey;
  }

  get provider(): string {
    return this._provider;
  }

  get status(): PaymentIntentStatus {
    return this._status;
  }

  get amount(): Money {
    return this._amount;
  }

  get clientSecret(): string | undefined {
    return this._clientSecret;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  requiresAction(): boolean {
    return this._status.isRequiresAction();
  }

  isAuthorized(): boolean {
    return this._status.isAuthorized();
  }

  isCaptured(): boolean {
    return this._status.isCaptured();
  }

  isFailed(): boolean {
    return this._status.isFailed();
  }

  isCancelled(): boolean {
    return this._status.isCancelled();
  }

  canAuthorize(): boolean {
    return this._status.isRequiresAction();
  }

  canCapture(): boolean {
    return this._status.isAuthorized();
  }

  canCancel(): boolean {
    return !this._status.isCaptured() && !this._status.isFailed();
  }

  authorize(): void {
    if (!this.canAuthorize()) {
      throw new Error("Cannot authorize payment - invalid status");
    }
    this._status = PaymentIntentStatus.authorized();
    this._updatedAt = new Date();
  }

  capture(): void {
    if (!this.canCapture()) {
      throw new Error("Cannot capture payment - not authorized");
    }
    this._status = PaymentIntentStatus.captured();
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (!this.canCancel()) {
      throw new Error("Cannot cancel payment - already captured or failed");
    }
    this._status = PaymentIntentStatus.cancelled();
    this._updatedAt = new Date();
  }

  fail(): void {
    this._status = PaymentIntentStatus.failed();
    this._updatedAt = new Date();
  }

  updateClientSecret(clientSecret: string): void {
    this._clientSecret = clientSecret;
    this._updatedAt = new Date();
  }
}
