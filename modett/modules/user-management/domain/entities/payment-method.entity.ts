import { UserId } from "../value-objects/user-id.vo";

export class PaymentMethod {
  private constructor(
    private readonly id: string,
    private readonly userId: UserId,
    private type: PaymentMethodType,
    private provider: PaymentProvider,
    private maskedNumber: string,
    private expiryMonth: number,
    private expiryYear: number,
    private cardholderName: string,
    private billingAddressId: string | null,
    private isDefault: boolean,
    private isActive: boolean,
    private providerTokens: ProviderTokens,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  // Factory methods
  static create(data: CreatePaymentMethodData): PaymentMethod {
    const paymentMethodId = crypto.randomUUID();
    const userId = UserId.fromString(data.userId);
    const now = new Date();

    return new PaymentMethod(
      paymentMethodId,
      userId,
      data.type,
      data.provider,
      data.maskedNumber,
      data.expiryMonth,
      data.expiryYear,
      data.cardholderName,
      data.billingAddressId || null,
      data.isDefault || false,
      true, // Active by default
      data.providerTokens,
      now,
      now
    );
  }

  static reconstitute(data: PaymentMethodEntityData): PaymentMethod {
    return new PaymentMethod(
      data.id,
      UserId.fromString(data.userId),
      data.type,
      data.provider,
      data.maskedNumber,
      data.expiryMonth,
      data.expiryYear,
      data.cardholderName,
      data.billingAddressId,
      data.isDefault,
      data.isActive,
      data.providerTokens,
      data.createdAt,
      data.updatedAt
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }
  getUserId(): UserId {
    return this.userId;
  }
  getType(): PaymentMethodType {
    return this.type;
  }
  getProvider(): PaymentProvider {
    return this.provider;
  }
  getMaskedNumber(): string {
    return this.maskedNumber;
  }
  getExpiryMonth(): number {
    return this.expiryMonth;
  }
  getExpiryYear(): number {
    return this.expiryYear;
  }
  getCardholderName(): string {
    return this.cardholderName;
  }
  getBillingAddressId(): string | null {
    return this.billingAddressId;
  }
  getIsDefault(): boolean {
    return this.isDefault;
  }
  getIsActive(): boolean {
    return this.isActive;
  }
  getProviderTokens(): ProviderTokens {
    return this.providerTokens;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business logic methods
  updateExpiryDate(month: number, year: number): void {
    if (this.expiryMonth === month && this.expiryYear === year) {
      return; // No change needed
    }

    if (month < 1 || month > 12) {
      throw new Error("Invalid expiry month");
    }

    if (year < new Date().getFullYear()) {
      throw new Error("Expiry year cannot be in the past");
    }

    this.expiryMonth = month;
    this.expiryYear = year;
    this.touch();
  }

  updateCardholderName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error("Cardholder name is required");
    }

    const trimmedName = newName.trim();
    if (this.cardholderName === trimmedName) {
      return; // No change needed
    }

    this.cardholderName = trimmedName;
    this.touch();
  }

  updateBillingAddress(addressId: string | null): void {
    if (this.billingAddressId === addressId) {
      return; // No change needed
    }

    this.billingAddressId = addressId;
    this.touch();
  }

  setAsDefault(): void {
    if (this.isDefault) {
      return; // Already default
    }

    this.isDefault = true;
    this.touch();
  }

  removeAsDefault(): void {
    if (!this.isDefault) {
      return; // Already not default
    }

    this.isDefault = false;
    this.touch();
  }

  activate(): void {
    if (this.isActive) {
      return; // Already active
    }

    this.isActive = true;
    this.touch();
  }

  deactivate(): void {
    if (!this.isActive) {
      return; // Already inactive
    }

    this.isActive = false;
    this.isDefault = false; // Inactive payment methods cannot be default
    this.touch();
  }

  updateProviderTokens(tokens: ProviderTokens): void {
    this.providerTokens = { ...tokens };
    this.touch();
  }

  // Validation methods
  isExpired(): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11

    if (this.expiryYear < currentYear) {
      return true;
    }

    if (this.expiryYear === currentYear && this.expiryMonth < currentMonth) {
      return true;
    }

    return false;
  }

  isExpiringThisMonth(): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return this.expiryYear === currentYear && this.expiryMonth === currentMonth;
  }

  isExpiringSoon(monthsAhead: number = 3): boolean {
    const now = new Date();
    const futureDate = new Date(now.setMonth(now.getMonth() + monthsAhead));
    const futureYear = futureDate.getFullYear();
    const futureMonth = futureDate.getMonth() + 1;

    if (this.expiryYear < futureYear) {
      return true;
    }

    if (this.expiryYear === futureYear && this.expiryMonth <= futureMonth) {
      return true;
    }

    return false;
  }

  canBeUsedForPayment(): boolean {
    return this.isActive && !this.isExpired();
  }

  belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  canBeDeleted(): boolean {
    // Business rule: Can always delete payment methods
    // The application should handle setting a new default if needed
    return true;
  }

  requiresBillingAddress(): boolean {
    return this.type === PaymentMethodType.CREDIT_CARD ||
           this.type === PaymentMethodType.DEBIT_CARD;
  }

  // Payment processing methods
  getDisplayName(): string {
    const typeDisplay = this.type.replace('_', ' ').toLowerCase();
    const capitalizedType = typeDisplay.charAt(0).toUpperCase() + typeDisplay.slice(1);

    return `${capitalizedType} ending in ${this.maskedNumber.slice(-4)}`;
  }

  getExpiryDisplay(): string {
    const month = this.expiryMonth.toString().padStart(2, '0');
    const year = this.expiryYear.toString().slice(-2);
    return `${month}/${year}`;
  }

  getCardBrand(): string {
    const firstDigit = this.maskedNumber.replace(/\*/g, '').charAt(0);

    switch (firstDigit) {
      case '4':
        return 'Visa';
      case '5':
        return 'Mastercard';
      case '3':
        return 'American Express';
      case '6':
        return 'Discover';
      default:
        return 'Unknown';
    }
  }

  isSecureTokenAvailable(): boolean {
    return !!this.providerTokens.paymentMethodToken;
  }

  getPaymentProcessingData(): PaymentProcessingData {
    if (!this.canBeUsedForPayment()) {
      throw new Error("Payment method cannot be used for payment");
    }

    return {
      paymentMethodId: this.id,
      provider: this.provider,
      tokens: this.providerTokens,
      type: this.type,
      billingAddressId: this.billingAddressId,
    };
  }

  // Security methods
  maskSensitiveData(): Partial<PaymentMethodEntityData> {
    return {
      id: this.id,
      userId: this.userId.getValue(),
      type: this.type,
      provider: this.provider,
      maskedNumber: this.maskedNumber,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cardholderName: this.cardholderName,
      billingAddressId: this.billingAddressId,
      isDefault: this.isDefault,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Intentionally exclude providerTokens for security
    };
  }

  // Internal methods
  private touch(): void {
    this.updatedAt = new Date();
  }

  // Convert to data for persistence
  toData(): PaymentMethodEntityData {
    return {
      id: this.id,
      userId: this.userId.getValue(),
      type: this.type,
      provider: this.provider,
      maskedNumber: this.maskedNumber,
      expiryMonth: this.expiryMonth,
      expiryYear: this.expiryYear,
      cardholderName: this.cardholderName,
      billingAddressId: this.billingAddressId,
      isDefault: this.isDefault,
      isActive: this.isActive,
      providerTokens: this.providerTokens,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  equals(other: PaymentMethod): boolean {
    return this.id === other.id;
  }
}

// Supporting types and enums
export enum PaymentMethodType {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  DIGITAL_WALLET = "digital_wallet",
  BANK_TRANSFER = "bank_transfer",
  BUY_NOW_PAY_LATER = "buy_now_pay_later",
}

export enum PaymentProvider {
  STRIPE = "stripe",
  PAYPAL = "paypal",
  SQUARE = "square",
  BRAINTREE = "braintree",
  ADYEN = "adyen",
  KLARNA = "klarna",
  AFTERPAY = "afterpay",
}

export interface ProviderTokens {
  paymentMethodToken?: string;
  customerId?: string;
  setupIntentId?: string;
  fingerprint?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentMethodData {
  userId: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  maskedNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  billingAddressId?: string;
  isDefault?: boolean;
  providerTokens: ProviderTokens;
}

export interface PaymentMethodEntityData {
  id: string;
  userId: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  maskedNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cardholderName: string;
  billingAddressId: string | null;
  isDefault: boolean;
  isActive: boolean;
  providerTokens: ProviderTokens;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentProcessingData {
  paymentMethodId: string;
  provider: PaymentProvider;
  tokens: ProviderTokens;
  type: PaymentMethodType;
  billingAddressId: string | null;
}