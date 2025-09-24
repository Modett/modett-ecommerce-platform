// In-memory stores for security (should be replaced with Redis in production)
export class TokenBlacklistService {
  private static failedAttempts = new Map<
    string,
    { count: number; lastAttempt: Date; lockedUntil?: Date }
  >();
  private static tokenBlacklist = new Set<string>();
  private static verificationTokens = new Map<
    string,
    { userId: string; email: string; expiresAt: Date }
  >();
  private static passwordResetTokens = new Map<
    string,
    { userId: string; expiresAt: Date }
  >();

  static recordFailedAttempt(email: string): void {
    const key = email.toLowerCase();
    const current = this.failedAttempts.get(key) || {
      count: 0,
      lastAttempt: new Date(),
    };

    current.count += 1;
    current.lastAttempt = new Date();

    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

    if (current.count >= MAX_LOGIN_ATTEMPTS) {
      current.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
    }

    this.failedAttempts.set(key, current);
  }

  static clearFailedAttempts(email: string): void {
    this.failedAttempts.delete(email.toLowerCase());
  }

  static isAccountLocked(email: string): boolean {
    const attempts = this.failedAttempts.get(email.toLowerCase());
    if (!attempts || !attempts.lockedUntil) return false;

    if (new Date() > attempts.lockedUntil) {
      this.clearFailedAttempts(email);
      return false;
    }

    return true;
  }

  static blacklistToken(token: string): void {
    this.tokenBlacklist.add(token);
  }

  static isTokenBlacklisted(token: string): boolean {
    return this.tokenBlacklist.has(token);
  }

  static storeVerificationToken(
    token: string,
    userId: string,
    email: string
  ): void {
    const EMAIL_VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
    this.verificationTokens.set(token, {
      userId,
      email,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY),
    });
  }

  static getVerificationToken(
    token: string
  ): { userId: string; email: string } | null {
    const data = this.verificationTokens.get(token);
    if (!data || new Date() > data.expiresAt) {
      this.verificationTokens.delete(token);
      return null;
    }
    return { userId: data.userId, email: data.email };
  }

  static storePasswordResetToken(token: string, userId: string): void {
    const PASSWORD_RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour
    this.passwordResetTokens.set(token, {
      userId,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY),
    });
  }

  static getPasswordResetToken(token: string): { userId: string } | null {
    const data = this.passwordResetTokens.get(token);
    if (!data || new Date() > data.expiresAt) {
      this.passwordResetTokens.delete(token);
      return null;
    }
    return { userId: data.userId };
  }
}