import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

// Best-effort persistence to survive restarts (still a single-node store).
const STORE_PATH = path.resolve(process.cwd(), ".security-store.json");
const DEFAULT_TOKEN_TTL_SECONDS =
  Number(process.env.AUTH_TOKEN_BLACKLIST_TTL_SECONDS) || 7 * 24 * 60 * 60;

type StoredToken = { token: string; expiresAt: number };
type StoredEmailToken = { token: string; userId: string; email: string; expiresAt: number };

export class TokenBlacklistService {
  private static failedAttempts = new Map<
    string,
    { count: number; lastAttempt: Date; lockedUntil?: Date }
  >();
  private static tokenBlacklist = new Map<string, number>(); // token -> expiresAt
  private static verificationTokens = new Map<
    string,
    { userId: string; email: string; expiresAt: Date }
  >();
  private static passwordResetTokens = new Map<
    string,
    { userId: string; email: string; expiresAt: Date }
  >();

  private static initialized = false;

  private static loadFromDisk(): void {
    if (this.initialized) return;
    this.initialized = true;
    try {
      if (!fs.existsSync(STORE_PATH)) {
        return;
      }
      const raw = fs.readFileSync(STORE_PATH, "utf8");
      const parsed = JSON.parse(raw) as {
        failedAttempts?: Array<{
          email: string;
          count: number;
          lastAttempt: number;
          lockedUntil?: number;
        }>;
        blacklistedTokens?: StoredToken[];
        verificationTokens?: StoredEmailToken[];
        passwordResetTokens?: StoredEmailToken[];
      };

      parsed.failedAttempts?.forEach((fa) => {
        this.failedAttempts.set(fa.email, {
          count: fa.count,
          lastAttempt: new Date(fa.lastAttempt),
          lockedUntil: fa.lockedUntil ? new Date(fa.lockedUntil) : undefined,
        });
      });

      parsed.blacklistedTokens?.forEach((entry) => {
        if (entry.expiresAt > Date.now()) {
          this.tokenBlacklist.set(entry.token, entry.expiresAt);
        }
      });

      parsed.verificationTokens?.forEach((entry) => {
        if (entry.expiresAt > Date.now()) {
          this.verificationTokens.set(entry.token, {
            userId: entry.userId,
            email: entry.email,
            expiresAt: new Date(entry.expiresAt),
          });
        }
      });

      parsed.passwordResetTokens?.forEach((entry) => {
        if (entry.expiresAt > Date.now()) {
          this.passwordResetTokens.set(entry.token, {
            userId: entry.userId,
            email: entry.email,
            expiresAt: new Date(entry.expiresAt),
          });
        }
      });
    } catch (error) {
      console.warn("[SECURITY] Failed to load token store:", error);
    }
  }

  private static persistToDisk(): void {
    try {
      const payload = {
        failedAttempts: Array.from(this.failedAttempts.entries()).map(
          ([email, data]) => ({
            email,
            count: data.count,
            lastAttempt: data.lastAttempt.getTime(),
            lockedUntil: data.lockedUntil?.getTime(),
          })
        ),
        blacklistedTokens: Array.from(this.tokenBlacklist.entries()).map(
          ([token, expiresAt]) => ({ token, expiresAt })
        ),
        verificationTokens: Array.from(this.verificationTokens.entries()).map(
          ([token, data]) => ({
            token,
            userId: data.userId,
            email: data.email,
            expiresAt: data.expiresAt.getTime(),
          })
        ),
        passwordResetTokens: Array.from(this.passwordResetTokens.entries()).map(
          ([token, data]) => ({
            token,
            userId: data.userId,
            email: data.email,
            expiresAt: data.expiresAt.getTime(),
          })
        ),
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(payload, null, 2), "utf8");
    } catch (error) {
      console.warn("[SECURITY] Failed to persist token store:", error);
    }
  }

  static recordFailedAttempt(email: string): void {
    this.loadFromDisk();
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
    this.persistToDisk();
  }

  static clearFailedAttempts(email: string): void {
    this.loadFromDisk();
    this.failedAttempts.delete(email.toLowerCase());
    this.persistToDisk();
  }

  static isAccountLocked(email: string): boolean {
    this.loadFromDisk();
    const attempts = this.failedAttempts.get(email.toLowerCase());
    if (!attempts || !attempts.lockedUntil) return false;

    if (new Date() > attempts.lockedUntil) {
      this.clearFailedAttempts(email);
      return false;
    }

    return true;
  }

  private static getTokenExpiry(token: string): number {
    try {
      const decoded = jwt.decode(token) as { exp?: number } | null;
      if (decoded?.exp) {
        return decoded.exp * 1000;
      }
    } catch {
      // ignore decode errors, fall back to default
    }
    return Date.now() + DEFAULT_TOKEN_TTL_SECONDS * 1000;
  }

  static blacklistToken(token: string): void {
    this.loadFromDisk();
    const expiresAt = this.getTokenExpiry(token);
    this.tokenBlacklist.set(token, expiresAt);
    this.persistToDisk();
  }

  static isTokenBlacklisted(token: string): boolean {
    this.loadFromDisk();
    const expiresAt = this.tokenBlacklist.get(token);

    if (!expiresAt) return false;
    if (expiresAt < Date.now()) {
      this.tokenBlacklist.delete(token);
      this.persistToDisk();
      return false;
    }

    return true;
  }

  static storeVerificationToken(
    token: string,
    userId: string,
    email: string
  ): void {
    this.loadFromDisk();
    const EMAIL_VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
    this.verificationTokens.set(token, {
      userId,
      email,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_EXPIRY),
    });
    this.persistToDisk();
  }

  static getVerificationToken(
    token: string
  ): { userId: string; email: string } | null {
    this.loadFromDisk();
    const data = this.verificationTokens.get(token);
    if (!data || new Date() > data.expiresAt) {
      this.verificationTokens.delete(token);
      this.persistToDisk();
      return null;
    }
    return { userId: data.userId, email: data.email };
  }

  static storePasswordResetToken(token: string, userId: string, email: string): void {
    this.loadFromDisk();
    const PASSWORD_RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour
    this.passwordResetTokens.set(token, {
      userId,
      email,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_EXPIRY),
    });
    this.persistToDisk();
  }

  static getPasswordResetToken(token: string): { userId: string; email: string } | null {
    this.loadFromDisk();
    const data = this.passwordResetTokens.get(token);
    if (!data || new Date() > data.expiresAt) {
      this.passwordResetTokens.delete(token);
      this.persistToDisk();
      return null;
    }
    return { userId: data.userId, email: data.email };
  }
}
