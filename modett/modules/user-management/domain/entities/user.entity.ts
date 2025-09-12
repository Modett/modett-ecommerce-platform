import { UserId } from "../value-objects/user-id.vo";
import { Email } from "../value-objects/email.vo";
import { Phone } from "../value-objects/phone.vo";
import { Password } from "../value-objects/password.vo";

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

export interface CreateUserProps {
  email: Email;
  password: Password;
  phone?: Phone;
  isGuest?: boolean;
}

export class User {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _password: Password,
    private _phone?: Phone,
    private _status: UserStatus = UserStatus.ACTIVE,
    private _emailVerified: boolean = false,
    private _phoneVerified: boolean = false,
    private _isGuest: boolean = false,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {}

  static create(props: CreateUserProps, id?: UserId): User {
    const userId = id || UserId.create();

    return new User(
      userId,
      props.email,
      props.password,
      props.phone,
      UserStatus.ACTIVE,
      false,
      false,
      props.isGuest || false
    );
  }

  static createGuest(email: Email, id?: UserId): User {
    const dummyPassword = Password.createFromHash("guest_placeholder");
    const userId = id || UserId.create();

    return new User(
      userId,
      email,
      dummyPassword,
      undefined,
      UserStatus.ACTIVE,
      false,
      false,
      true
    );
  }

  // Getters
  get id(): UserId {
    return this._id;
  }
  get email(): Email {
    return this._email;
  }
  get password(): Password {
    return this._password;
  }
  get phone(): Phone | undefined {
    return this._phone;
  }
  get status(): UserStatus {
    return this._status;
  }
  get emailVerified(): boolean {
    return this._emailVerified;
  }
  get phoneVerified(): boolean {
    return this._phoneVerified;
  }
  get isGuest(): boolean {
    return this._isGuest;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  changeEmail(newEmail: Email): void {
    this._email = newEmail;
    this._emailVerified = false;
    this._updatedAt = new Date();
  }

  changePassword(newPassword: Password): void {
    this._password = newPassword;
    this._updatedAt = new Date();
  }

  updatePhone(newPhone?: Phone): void {
    this._phone = newPhone;
    if (newPhone) {
      this._phoneVerified = false;
    }
    this._updatedAt = new Date();
  }

  verifyEmail(): void {
    this._emailVerified = true;
    this._updatedAt = new Date();
  }

  verifyPhone(): void {
    if (!this._phone) {
      throw new Error("Cannot verify phone: no phone number set");
    }
    this._phoneVerified = true;
    this._updatedAt = new Date();
  }

  convertGuestToRegular(password: Password): void {
    if (!this._isGuest) {
      throw new Error("User is not a guest");
    }
    this._password = password;
    this._isGuest = false;
    this._updatedAt = new Date();
  }

  block(): void {
    this._status = UserStatus.BLOCKED;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._status = UserStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._status = UserStatus.INACTIVE;
    this._updatedAt = new Date();
  }
}
