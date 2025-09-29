import { randomBytes } from "crypto";

export class GuestToken {
  private readonly value: string;
  private static readonly TOKEN_LENGTH = 32;

  constructor(value?: string) {
    if (value) {
      if (!this.isValidGuestToken(value)) {
        throw new Error("Invalid guest token format");
      }
      this.value = value;
    } else {
      this.value = this.generateGuestToken();
    }
  }

  private isValidGuestToken(token: string): boolean {
    // Guest token should be a 64-character hex string (32 bytes)
    const tokenRegex = /^[a-f0-9]{64}$/i;
    return tokenRegex.test(token);
  }

  private generateGuestToken(): string {
    return randomBytes(GuestToken.TOKEN_LENGTH).toString("hex");
  }

  getValue(): string {
    return this.value;
  }

  equals(other: GuestToken): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  isExpired(expirationHours: number = 24): boolean {
    // This is a simple implementation - in a real system, you might
    // encode timestamp information in the token or store it separately
    return false; // For now, guest tokens don't expire based on the token itself
  }

  static generate(): GuestToken {
    return new GuestToken();
  }

  static fromString(value: string): GuestToken {
    return new GuestToken(value);
  }

  // Utility methods for guest token management
  getPrefix(length: number = 8): string {
    return this.value.substring(0, length);
  }

  getSuffix(length: number = 8): string {
    return this.value.substring(this.value.length - length);
  }

  getMasked(): string {
    const prefix = this.getPrefix(4);
    const suffix = this.getSuffix(4);
    return `${prefix}****${suffix}`;
  }
}