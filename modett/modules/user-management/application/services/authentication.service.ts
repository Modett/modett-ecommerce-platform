import * as jwt from 'jsonwebtoken';
import { IUserRepository } from '../../domain/repositories/iuser.repository';
import { IPasswordHasherService } from './password-hasher.service';
import { Email } from '../../domain/value-objects/email.vo';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { User } from '../../domain/entities/user.entity';

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

    if (user.getStatus().toString() === 'blocked') {
      throw new Error('Account is blocked');
    }

    if (user.getStatus().toString() === 'inactive') {
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
          isGuest: true,
        });
        await this.userRepository.save(user);
      }
    } else {
      const guestEmail = this.generateGuestEmail();
      user = User.create({
        email: guestEmail,
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

      if (user.getStatus().toString() === 'blocked') {
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

      if (user.getStatus().toString() === 'blocked') {
        throw new Error('Account is blocked');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  async logout(userId: string): Promise<void> {
    // In a full implementation, you might want to invalidate tokens
    // by maintaining a blacklist or using a different token strategy
    // For now, we'll just validate the user exists
    const userIdVo = UserId.fromString(userId);
    const user = await this.userRepository.findById(userIdVo);

    if (!user) {
      throw new Error('User not found');
    }
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
    user.updatePassword(newPasswordHash);

    await this.userRepository.update(user);
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
    user.updatePassword(newPasswordHash);

    await this.userRepository.update(user);
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
        emailVerified: user.getEmailVerified(),
        phoneVerified: user.getPhoneVerified(),
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
    });
  }

  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.getId().getValue(),
      email: user.getEmail().getValue(),
      type: 'refresh',
    };

    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiresIn,
    });
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