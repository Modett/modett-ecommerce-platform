import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { IUserRepository } from '../../domain/repositories/iuser.repository.js';
import { IPasswordHasherService, PasswordHasherService } from './password-hasher.service.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { UserId } from '../../domain/value-objects/user-id.vo.js';
import { User } from '../../domain/entities/user.entity.js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    isGuest: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterUserData {
  email: string;
  password: string;
  phone?: string;
}

export class AuthenticationService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasherService,
    config: {
      accessTokenSecret: string;
      refreshTokenSecret: string;
      accessTokenExpiresIn?: string;
      refreshTokenExpiresIn?: string;
    }
  ) {
    if (!config.accessTokenSecret || !config.refreshTokenSecret) {
      throw new Error('JWT secrets are required');
    }
    this.accessTokenSecret = config.accessTokenSecret;
    this.refreshTokenSecret = config.refreshTokenSecret;
    this.accessTokenExpiresIn = config.accessTokenExpiresIn || '15m';
    this.refreshTokenExpiresIn = config.refreshTokenExpiresIn || '7d';
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const email = Email.fromString(credentials.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.getIsGuest()) {
      throw new Error('Guest users cannot login with password');
    }

    const passwordHash = user.getPasswordHash();
    if (!passwordHash) {
      throw new Error('User has no password set');
    }

    const isPasswordValid = await this.passwordHasher.verify(
      credentials.password,
      passwordHash
    );

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    if (user.getStatus() === 'blocked') {
      throw new Error('Account is blocked');
    }

    if (user.getStatus() === 'inactive') {
      throw new Error('Account is inactive');
    }

    return this.generateAuthResult(user);
  }

  async loginAsGuest(email?: string): Promise<AuthResult> {
    let user: User;

    if (email) {
      const emailVo = Email.fromString(email);
      const existingUser = await this.userRepository.findByEmail(emailVo);

      if (existingUser && !existingUser.getIsGuest()) {
        throw new Error('Email already registered as regular user');
      }

      if (existingUser) {
        user = existingUser;
      } else {
        user = User.create({
          email: email,
          passwordHash: "", // Guest users don't have passwords
          isGuest: true,
        });
        await this.userRepository.save(user);
      }
    } else {
      const guestEmail = this.generateGuestEmail();
      user = User.create({
        email: guestEmail,
        passwordHash: "", // Guest users don't have passwords
        isGuest: true,
      });
      await this.userRepository.save(user);
    }

    return this.generateAuthResult(user);
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResult> {
    try {
      const payload = jwt.verify(refreshToken, this.refreshTokenSecret) as TokenPayload;

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const userId = UserId.fromString(payload.userId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.getStatus() === 'blocked') {
        throw new Error('Account is blocked');
      }

      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getTokenExpirationTime(this.accessTokenExpiresIn),
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const payload = jwt.verify(token, this.accessTokenSecret) as TokenPayload;

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      const userId = UserId.fromString(payload.userId);
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.getStatus() === 'blocked') {
        throw new Error('Account is blocked');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    const userIdVo = UserId.fromString(userId);
    const user = await this.userRepository.findById(userIdVo);

    if (!user) {
      throw new Error('User not found');
    }

    // Validate refresh token if provided
    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, this.refreshTokenSecret) as TokenPayload;
        if (payload.type !== 'refresh' || payload.userId !== userId) {
          throw new Error('Invalid refresh token');
        }
      } catch (error) {
        throw new Error('Invalid refresh token');
      }
    }

    // Update user's last logout timestamp
    user.recordLogout();
    await this.userRepository.update(user);

    // Note: In a production system with token blacklisting, you would:
    // 1. Add the refresh token to a blacklist/revoked tokens table
    // 2. Optionally invalidate all user sessions
    // 3. Clear any server-side session data
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const userIdVo = UserId.fromString(userId);
    const user = await this.userRepository.findById(userIdVo);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.getIsGuest()) {
      throw new Error('Guest users cannot change password');
    }

    const currentPasswordHash = user.getPasswordHash();
    if (!currentPasswordHash) {
      throw new Error('User has no password set');
    }

    const isCurrentPasswordValid = await this.passwordHasher.verify(
      currentPassword,
      currentPasswordHash
    );

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const passwordValidation = this.passwordHasher.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password is not strong enough: ${passwordValidation.feedback.join(', ')}`);
    }

    const newPasswordHash = await this.passwordHasher.hash(newPassword);
    if (!newPasswordHash) {
      throw new Error('Failed to hash password');
    }
    user.updatePassword(newPasswordHash);

    await this.userRepository.update(user);
  }

  async register(userData: RegisterUserData): Promise<AuthResult> {
    const email = new Email(userData.email);

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser && !existingUser.getIsGuest()) {
      throw new Error('User already exists with this email');
    }

    // Validate password strength
    const passwordValidation = this.passwordHasher.validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password is not strong enough: ${passwordValidation.feedback.join(', ')}`);
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(userData.password);
    if (!passwordHash) {
      throw new Error('Failed to hash password');
    }

    // Create or convert user
    let user: User;
    if (existingUser && existingUser.getIsGuest()) {
      // Convert guest to regular user
      existingUser.convertFromGuest(userData.email, passwordHash);
      if (userData.phone) {
        existingUser.updatePhone(userData.phone);
      }
      user = existingUser;
      await this.userRepository.update(user);
    } else {
      // Create new user
      user = User.create({
        email: userData.email,
        passwordHash,
        phone: userData.phone,
        isGuest: false,
      });
      await this.userRepository.save(user);
    }

    return this.generateAuthResult(user);
  }

  async initiatePasswordReset(email: string): Promise<{ exists: boolean; token?: string; userId?: string }> {
    const emailVo = Email.fromString(email);
    const user = await this.userRepository.findByEmail(emailVo);

    if (!user || user.getIsGuest()) {
      // For security, don't reveal if email exists
      return { exists: false };
    }

    // Generate a secure reset token (in production, store this in database with expiry)
    const resetToken = this.generateSecureToken();

    // TODO: In production, store token in database with expiry (1 hour)
    // await this.userRepository.storePasswordResetToken(user.getId(), resetToken, expiresAt);

    return { exists: true, token: resetToken, userId: user.getId().toString() };
  }

  async resetPassword(email: string, newPassword: string): Promise<void> {
    const emailVo = Email.fromString(email);
    const user = await this.userRepository.findByEmail(emailVo);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.getIsGuest()) {
      throw new Error('Guest users cannot reset password');
    }

    const passwordValidation = this.passwordHasher.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password is not strong enough: ${passwordValidation.feedback.join(', ')}`);
    }

    const newPasswordHash = await this.passwordHasher.hash(newPassword);
    if (!newPasswordHash) {
      throw new Error('Failed to hash password');
    }
    user.updatePassword(newPasswordHash);

    await this.userRepository.update(user);
  }

  async getUserByEmail(email: string): Promise<{ userId: string; emailVerified: boolean } | null> {
    const emailVo = Email.fromString(email);
    const user = await this.userRepository.findByEmail(emailVo);

    if (!user || user.getIsGuest()) {
      return null;
    }

    return {
      userId: user.getId().toString(),
      emailVerified: user.isEmailVerified()
    };
  }

  async verifyEmail(userId: string): Promise<void> {
    const userIdVo = UserId.fromString(userId);
    const user = await this.userRepository.findById(userIdVo);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified()) {
      throw new Error('Email is already verified');
    }

    user.verifyEmail();
    await this.userRepository.update(user);
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateAuthResult(user: User): AuthResult {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.getId().getValue(),
        email: user.getEmail().getValue(),
        isGuest: user.getIsGuest(),
        emailVerified: user.isEmailVerified(),
        phoneVerified: user.isPhoneVerified(),
      },
      expiresIn: this.getTokenExpirationTime(this.accessTokenExpiresIn),
    };
  }

  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.getId().getValue(),
      email: user.getEmail().getValue(),
      type: 'access',
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiresIn,
    } as SignOptions);
  }

  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.getId().getValue(),
      email: user.getEmail().getValue(),
      type: 'refresh',
    };

    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    } as SignOptions);
  }

  private generateGuestEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `guest_${timestamp}_${random}@modett.com`;
  }

  private getTokenExpirationTime(expiresIn: string): number {
    // Convert expires in string to seconds
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 900; // 15 minutes default
    }
  }
}