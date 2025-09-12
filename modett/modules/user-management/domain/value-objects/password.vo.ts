import * as crypto from 'crypto';

  export class Password {
    private constructor(private readonly hashedValue: string) {}

    static createFromPlain(plainPassword: string): Password {
      if (!plainPassword) {
        throw new Error('Password is required');
      }

      if (plainPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (plainPassword.length > 128) {
        throw new Error('Password is too long');
      }

      // Check password strength
      if (!this.isPasswordStrong(plainPassword)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter,       
  and one number');
      }

      const hashed = this.hashPassword(plainPassword);
      return new Password(hashed);
    }

    static createFromHash(hashedPassword: string): Password {
      if (!hashedPassword) {
        throw new Error('Hashed password is required');
      }
      return new Password(hashedPassword);
    }

    private static isPasswordStrong(password: string): boolean {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);

      return hasUppercase && hasLowercase && hasNumber;
    }

    private static hashPassword(password: string): string {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex');
      return `${salt}:${hash}`;
    }

    verify(plainPassword: string): boolean {
      const [salt, hash] = this.hashedValue.split(':');
      const verifyHash = crypto.pbkdf2Sync(plainPassword, salt, 10000, 64, 'sha256').toString('hex');     
      return hash === verifyHash;
    }

    getHashedValue(): string {
      return this.hashedValue;
    }

    equals(other: Password): boolean {
      return this.hashedValue === other.hashedValue;
    }
  }