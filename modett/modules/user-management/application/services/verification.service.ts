import { IUserRepository } from '../../domain/repositories/iuser.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { Phone } from '../../domain/value-objects/phone.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';

export interface EmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

export interface SmsService {
  sendVerificationSms(phone: string, code: string): Promise<void>;
}

export interface VerificationToken {
  token: string;
  expiresAt: Date;
  type: 'email_verification' | 'phone_verification' | 'password_reset';
}

export interface VerificationResult {
  success: boolean;
  message: string;
}

export class VerificationService {
  private readonly tokenStore: Map<string, VerificationToken> = new Map();
  private readonly EMAIL_TOKEN_EXPIRY_HOURS = 24;
  private readonly PHONE_CODE_EXPIRY_MINUTES = 10;
  private readonly PASSWORD_RESET_EXPIRY_HOURS = 1;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService?: EmailService,
    private readonly smsService?: SmsService
  ) {}

  async sendEmailVerification(userId: string): Promise<VerificationResult> {
    if (!this.emailService) {
      throw new Error('Email service not configured');
    }

    const userIdVo = UserId.fromString(userId);
    const user = await this.userRepository.findById(userIdVo);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified()) {
      return {
        success: false,
        message: 'Email is already verified',
      };
    }

    const token = this.generateEmailToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.EMAIL_TOKEN_EXPIRY_HOURS);

    const verificationToken: VerificationToken = {
      token,
      expiresAt,
      type: 'email_verification',
    };

    const key = this.createTokenKey(userId, 'email_verification');
    this.tokenStore.set(key, verificationToken);

    try {
      await this.emailService.sendVerificationEmail(
        user.getEmail().getValue(),
        token
      );

      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      this.tokenStore.delete(key);
      throw new Error('Failed to send verification email');
    }
  }

  async verifyEmail(userId: string, token: string): Promise<VerificationResult> {
    const userIdVo = UserId.fromString(userId);
    const user = await this.userRepository.findById(userIdVo);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified()) {
      return {
        success: false,
        message: 'Email is already verified',
      };
    }

    const key = this.createTokenKey(userId, 'email_verification');
    const verificationToken = this.tokenStore.get(key);

    if (!verificationToken) {
      return {
        success: false,
        message: 'Invalid or expired verification token',
      };
    }

    if (verificationToken.token !== token) {
      return {
        success: false,
        message: 'Invalid verification token',
      };
    }

    if (new Date() > verificationToken.expiresAt) {
      this.tokenStore.delete(key);
      return {
        success: false,
        message: 'Verification token has expired',
      };
    }

    user.verifyEmail();
    await this.userRepository.update(user);
    this.tokenStore.delete(key);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async sendPhoneVerification(userId: string): Promise<VerificationResult> {
    if (!this.smsService) {
      throw new Error('SMS service not configured');
    }

    const userIdVo = UserId.fromString(userId);
    const user = await this.userRepository.findById(userIdVo);

    if (!user) {
      throw new Error('User not found');
    }

    const phoneObject = user.getPhone();
    if (!phoneObject) {
      throw new Error('User has no phone number');
    }

    const phoneNumber = phoneObject.getValue();

    if (user.isPhoneVerified()) {
      return {
        success: false,
        message: 'Phone is already verified',
      };
    }

    const code = this.generatePhoneCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.PHONE_CODE_EXPIRY_MINUTES);

    const verificationToken: VerificationToken = {
      token: code,
      expiresAt,
      type: 'phone_verification',
    };

    const key = this.createTokenKey(userId, 'phone_verification');
    this.tokenStore.set(key, verificationToken);

    try {
      await this.smsService.sendVerificationSms(phoneNumber, code);

      return {
        success: true,
        message: 'Verification code sent successfully',
      };
    } catch (error) {
      this.tokenStore.delete(key);
      throw new Error('Failed to send verification SMS');
    }
  }

  async verifyPhone(userId: string, code: string): Promise<VerificationResult> {
    const userIdVo = UserId.fromString(userId);
    const user = await this.userRepository.findById(userIdVo);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isPhoneVerified()) {
      return {
        success: false,
        message: 'Phone is already verified',
      };
    }

    const key = this.createTokenKey(userId, 'phone_verification');
    const verificationToken = this.tokenStore.get(key);

    if (!verificationToken) {
      return {
        success: false,
        message: 'Invalid or expired verification code',
      };
    }

    if (verificationToken.token !== code) {
      return {
        success: false,
        message: 'Invalid verification code',
      };
    }

    if (new Date() > verificationToken.expiresAt) {
      this.tokenStore.delete(key);
      return {
        success: false,
        message: 'Verification code has expired',
      };
    }

    user.verifyPhone();
    await this.userRepository.update(user);
    this.tokenStore.delete(key);

    return {
      success: true,
      message: 'Phone verified successfully',
    };
  }

  async sendPasswordResetEmail(email: string): Promise<VerificationResult> {
    if (!this.emailService) {
      throw new Error('Email service not configured');
    }

    const emailVo = Email.fromString(email);
    const user = await this.userRepository.findByEmail(emailVo);

    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      };
    }

    if (user.getIsGuest()) {
      return {
        success: false,
        message: 'Guest users cannot reset password',
      };
    }

    const token = this.generateEmailToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + this.PASSWORD_RESET_EXPIRY_HOURS);

    const verificationToken: VerificationToken = {
      token,
      expiresAt,
      type: 'password_reset',
    };

    const key = this.createTokenKey(user.getId().getValue(), 'password_reset');
    this.tokenStore.set(key, verificationToken);

    try {
      await this.emailService.sendPasswordResetEmail(email, token);

      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      this.tokenStore.delete(key);
      throw new Error('Failed to send password reset email');
    }
  }

  async validatePasswordResetToken(email: string, token: string): Promise<string | null> {
    const emailVo = Email.fromString(email);
    const user = await this.userRepository.findByEmail(emailVo);

    if (!user) {
      return null;
    }

    const key = this.createTokenKey(user.getId().getValue(), 'password_reset');
    const verificationToken = this.tokenStore.get(key);

    if (!verificationToken) {
      return null;
    }

    if (verificationToken.token !== token) {
      return null;
    }

    if (new Date() > verificationToken.expiresAt) {
      this.tokenStore.delete(key);
      return null;
    }

    return user.getId().getValue();
  }

  async consumePasswordResetToken(userId: string, token: string): Promise<boolean> {
    const key = this.createTokenKey(userId, 'password_reset');
    const verificationToken = this.tokenStore.get(key);

    if (!verificationToken) {
      return false;
    }

    if (verificationToken.token !== token) {
      return false;
    }

    if (new Date() > verificationToken.expiresAt) {
      this.tokenStore.delete(key);
      return false;
    }

    this.tokenStore.delete(key);
    return true;
  }

  async resendVerification(userId: string, type: 'email' | 'phone'): Promise<VerificationResult> {
    // Clear existing verification token
    const key = this.createTokenKey(userId, `${type}_verification` as any);
    this.tokenStore.delete(key);

    if (type === 'email') {
      return this.sendEmailVerification(userId);
    } else {
      return this.sendPhoneVerification(userId);
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    for (const [key, token] of this.tokenStore.entries()) {
      if (now > token.expiresAt) {
        this.tokenStore.delete(key);
      }
    }
  }

  private generateEmailToken(): string {
    // Generate a secure random token for email verification
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < 32; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return token;
  }

  private generatePhoneCode(): string {
    // Generate a 6-digit numeric code for phone verification
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private createTokenKey(userId: string, type: string): string {
    return `${userId}:${type}`;
  }
}