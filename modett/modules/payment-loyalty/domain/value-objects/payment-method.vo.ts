export class PaymentMethodType {
  private constructor(private readonly value: string) {}

  static card(): PaymentMethodType {
    return new PaymentMethodType("card");
  }

  static payhere(): PaymentMethodType {
    return new PaymentMethodType("payhere");
  }

  static bankTransfer(): PaymentMethodType {
    return new PaymentMethodType("bank_transfer");
  }

  static giftCard(): PaymentMethodType {
    return new PaymentMethodType("gift_card");
  }

  static bnpl(): PaymentMethodType {
    return new PaymentMethodType("bnpl");
  }

  static loyaltyPoints(): PaymentMethodType {
    return new PaymentMethodType("loyalty_points");
  }

  static fromString(value: string): PaymentMethodType {
    const normalized = value.toLowerCase().trim();
    switch (normalized) {
      case "card":
        return PaymentMethodType.card();
      case "payhere":
        return PaymentMethodType.payhere();
      case "bank_transfer":
        return PaymentMethodType.bankTransfer();
      case "gift_card":
        return PaymentMethodType.giftCard();
      case "bnpl":
        return PaymentMethodType.bnpl();
      case "loyalty_points":
        return PaymentMethodType.loyaltyPoints();
      default:
        throw new Error(`Invalid payment method: ${value}`);
    }
  }

  getValue(): string {
    return this.value;
  }

  isCard(): boolean {
    return this.value === "card";
  }

  isPayhere(): boolean {
    return this.value === "payhere";
  }

  isPaypal(): boolean {
    return this.value === "paypal";
  }

  isBankTransfer(): boolean {
    return this.value === "bank_transfer";
  }

  isGiftCard(): boolean {
    return this.value === "gift_card";
  }

  isBnpl(): boolean {
    return this.value === "bnpl";
  }

  isLoyaltyPoints(): boolean {
    return this.value === "loyalty_points";
  }

  equals(other: PaymentMethodType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
