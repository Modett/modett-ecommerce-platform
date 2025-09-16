import { UserId } from '../value-objects/user-id.vo';
  import { Email } from '../value-objects/email.vo';
  import { Phone } from '../value-objects/phone.vo';
  import { Password } from '../value-objects/password.vo';

  export class User {
    private constructor(
      private readonly id: UserId,
      private email: Email,
      private passwordHash: string,
      private phone: Phone | null,
      private status: UserStatus,
      private emailVerified: boolean,
      private phoneVerified: boolean,
      private isGuest: boolean,
      private readonly createdAt: Date,
      private updatedAt: Date
    ) {}

    // Factory methods for creation
    static create(data: CreateUserData): User {
      const userId = UserId.create();
      const email = new Email(data.email);
      const phone = data.phone ? new Phone(data.phone) : null;
      const now = new Date();

      return new User(
        userId,
        email,
        data.passwordHash, // Should already be hashed by password service
        phone,
        UserStatus.ACTIVE,
        false, // Email not verified initially
        false, // Phone not verified initially
        data.isGuest || false,
        now,
        now
      );
    }

    static createGuest(): User {
      const userId = UserId.create();
      const guestEmail = new
  Email(`guest-${userId.getValue()}@temp.modett.com`);
      const now = new Date();

      return new User(
        userId,
        guestEmail,
        '', // No password for guest
        null,
        UserStatus.ACTIVE,
        false,
        false,
        true, // Is guest
        now,
        now
      );
    }

    static reconstitute(data: UserData): User {
      return new User(
        UserId.fromString(data.id),
        new Email(data.email),
        data.passwordHash,
        data.phone ? new Phone(data.phone) : null,
        data.status,
        data.emailVerified,
        data.phoneVerified,
        data.isGuest,
        data.createdAt,
        data.updatedAt
      );
    }

    // Getters
    getId(): UserId { return this.id; }
    getEmail(): Email { return this.email; }
    getPasswordHash(): string { return this.passwordHash; }
    getPhone(): Phone | null { return this.phone; }
    getStatus(): UserStatus { return this.status; }
    isEmailVerified(): boolean { return this.emailVerified; }
    isPhoneVerified(): boolean { return this.phoneVerified; }
    getIsGuest(): boolean { return this.isGuest; }
    getCreatedAt(): Date { return this.createdAt; }
    getUpdatedAt(): Date { return this.updatedAt; }

    // Business logic methods
    updateEmail(newEmail: string): void {
      const email = new Email(newEmail);

      if (this.email.equals(email)) {
        return; // No change needed
      }

      this.email = email;
      this.emailVerified = false; // Reset verification when email changes
      this.touch();
    }

    updatePhone(newPhone: string | null): void {
      const phone = newPhone ? new Phone(newPhone) : null;

      if (this.phone?.equals(phone) || (!this.phone && !phone)) {
        return; // No change needed
      }

      this.phone = phone;
      this.phoneVerified = false; // Reset verification when phone changes
      this.touch();
    }

    updatePassword(newPasswordHash: string): void {
      if (!newPasswordHash) {
        throw new Error('Password hash is required');
      }

      this.passwordHash = newPasswordHash;
      this.touch();
    }

    verifyEmail(): void {
      if (this.emailVerified) {
        throw new Error('Email is already verified');
      }

      this.emailVerified = true;
      this.touch();
    }

    verifyPhone(): void {
      if (!this.phone) {
        throw new Error('Cannot verify phone: no phone number set');
      }

      if (this.phoneVerified) {
        throw new Error('Phone is already verified');
      }

      this.phoneVerified = true;
      this.touch();
    }

    activate(): void {
      if (this.status === UserStatus.ACTIVE) {
        return;
      }

      this.status = UserStatus.ACTIVE;
      this.touch();
    }

    deactivate(): void {
      if (this.status === UserStatus.INACTIVE) {
        return;
      }

      this.status = UserStatus.INACTIVE;
      this.touch();
    }

    block(reason?: string): void {
      if (this.status === UserStatus.BLOCKED) {
        return;
      }

      this.status = UserStatus.BLOCKED;
      this.touch();

      // Could emit domain event here for audit logging
      // this.addDomainEvent(new UserBlockedEvent(this.id, reason));
    }

    unblock(): void {
      if (this.status !== UserStatus.BLOCKED) {
        throw new Error('User is not blocked');
      }

      this.status = UserStatus.ACTIVE;
      this.touch();
    }

    convertFromGuest(email: string, passwordHash: string): void {
      if (!this.isGuest) {
        throw new Error('User is not a guest');
      }

      this.email = new Email(email);
      this.passwordHash = passwordHash;
      this.isGuest = false;
      this.emailVerified = false; // New email needs verification
      this.touch();
    }

    // Validation methods
    canLogin(): boolean {
      return this.status === UserStatus.ACTIVE && !this.isGuest;
    }

    canPlaceOrder(): boolean {
      return this.status === UserStatus.ACTIVE;
    }

    requiresEmailVerification(): boolean {
      return !this.emailVerified && !this.isGuest;
    }

    hasCompleteProfile(): boolean {
      return this.emailVerified && !!this.phone && this.phoneVerified;
    }

    // Internal methods
    private touch(): void {
      this.updatedAt = new Date();
    }

    // Convert to data for persistence
    toData(): UserData {
      return {
        id: this.id.getValue(),
        email: this.email.getValue(),
        passwordHash: this.passwordHash,
        phone: this.phone?.getValue() || null,
        status: this.status,
        emailVerified: this.emailVerified,
        phoneVerified: this.phoneVerified,
        isGuest: this.isGuest,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }

    equals(other: User): boolean {
      return this.id.equals(other.id);
    }
  }

  // Supporting types and enums
  export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BLOCKED = 'blocked'
  }

  export interface CreateUserData {
    email: string;
    passwordHash: string;
    phone?: string;
    isGuest?: boolean;
  }

  export interface UserData {
    id: string;
    email: string;
    passwordHash: string;
    phone: string | null;
    status: UserStatus;
    emailVerified: boolean;
    phoneVerified: boolean;
    isGuest: boolean;
    createdAt: Date;
    updatedAt: Date;
  }