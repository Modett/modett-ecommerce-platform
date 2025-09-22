import { FastifyRequest, FastifyReply } from 'fastify';
import {
  RegisterUserCommand,
  RegisterUserHandler,
  LoginUserCommand,
  LoginUserHandler
} from '../../../application';
import { AuthenticationService } from '../../../application/services/authentication.service';
import { generateAuthTokens, verifyRefreshToken } from '../middleware/auth.middleware';
import crypto from 'crypto';

// Constants for better maintainability
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
} as const;

const ERROR_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  INVALID_EMAIL: 'Invalid email format',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed login attempts',
  TOKEN_REQUIRED: 'Token is required',
  INVALID_TOKEN: 'Invalid or expired token',
  USER_NOT_FOUND: 'User not found',
  EMAIL_NOT_VERIFIED: 'Email verification required',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
  TOKEN_BLACKLISTED: 'Token has been revoked'
} as const;

const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: true,
  EMAIL_VERIFICATION_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_RESET_TOKEN_EXPIRY: 1 * 60 * 60 * 1000, // 1 hour
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000 // 7 days
} as const;

// Request DTOs
export interface RegisterUserRequest {
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms: boolean;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    fingerprint?: string;
  };
}

export interface LoginUserRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    fingerprint?: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Response DTOs
export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken?: string;
    user: {
      id: string;
      email: string;
      isGuest: boolean;
      emailVerified: boolean;
      phoneVerified: boolean;
      status: string;
    };
    expiresIn: number;
    tokenType: 'Bearer';
  };
  error?: string;
  errors?: string[];
}

export interface AuthActionResponse {
  success: boolean;
  data?: {
    message: string;
    action: string;
    requiresAction?: boolean;
    nextStep?: string;
  };
  error?: string;
  errors?: string[];
}

// Security and validation utilities
class AuthValidation {
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_SYMBOLS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      errors.push('Password contains common patterns that are not secure');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeStringInput(input?: string): string | undefined {
    if (!input) return input;
    return input.trim().replace(/\s+/g, ' ');
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static extractDeviceInfo(request: FastifyRequest): any {
    return {
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      fingerprint: request.headers['x-device-fingerprint'] || 'unknown'
    };
  }
}

// In-memory stores (should be replaced with Redis in production)
class AuthSecurityStore {
  private static failedAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();
  private static tokenBlacklist = new Set<string>();
  private static verificationTokens = new Map<string, { userId: string; email: string; expiresAt: Date }>();
  private static passwordResetTokens = new Map<string, { userId: string; expiresAt: Date }>();

  static recordFailedAttempt(email: string): void {
    const key = email.toLowerCase();
    const current = this.failedAttempts.get(key) || { count: 0, lastAttempt: new Date() };

    current.count += 1;
    current.lastAttempt = new Date();

    if (current.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      current.lockedUntil = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION);
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

  static storeVerificationToken(token: string, userId: string, email: string): void {
    this.verificationTokens.set(token, {
      userId,
      email,
      expiresAt: new Date(Date.now() + SECURITY_CONFIG.EMAIL_VERIFICATION_TOKEN_EXPIRY)
    });
  }

  static getVerificationToken(token: string): { userId: string; email: string } | null {
    const data = this.verificationTokens.get(token);
    if (!data || new Date() > data.expiresAt) {
      this.verificationTokens.delete(token);
      return null;
    }
    return { userId: data.userId, email: data.email };
  }

  static storePasswordResetToken(token: string, userId: string): void {
    this.passwordResetTokens.set(token, {
      userId,
      expiresAt: new Date(Date.now() + SECURITY_CONFIG.PASSWORD_RESET_TOKEN_EXPIRY)
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

export class AuthController {
  private registerHandler: RegisterUserHandler;
  private loginHandler: LoginUserHandler;

  constructor(authService: AuthenticationService) {
    this.registerHandler = new RegisterUserHandler(authService);
    this.loginHandler = new LoginUserHandler(authService);
  }

  private logSecurityEvent(event: string, details: any, request: FastifyRequest): void {
    console.warn(`[SECURITY] ${event}:`, {
      timestamp: new Date().toISOString(),
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      ...details
    });
  }

  private logError(method: string, error: any, context?: any): void {
    console.error(`AuthController.${method} error:`, {
      error: error.message || error,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  async register(
    request: FastifyRequest<{ Body: RegisterUserRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const rawData = request.body;
      const deviceInfo = AuthValidation.extractDeviceInfo(request);

      // Sanitize inputs
      const email = AuthValidation.sanitizeEmail(rawData.email || '');
      const firstName = AuthValidation.sanitizeStringInput(rawData.firstName);
      const lastName = AuthValidation.sanitizeStringInput(rawData.lastName);
      const phone = AuthValidation.sanitizeStringInput(rawData.phone);

      // Validate required fields
      const missingFields: string[] = [];
      if (!email) missingFields.push('email');
      if (!rawData.password) missingFields.push('password');

      if (missingFields.length > 0) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: 'Required fields are missing',
          errors: missingFields,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate email format
      if (!AuthValidation.validateEmail(email)) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.INVALID_EMAIL,
          errors: ['email'],
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate password strength
      const passwordValidation = AuthValidation.validatePassword(rawData.password);
      if (!passwordValidation.isValid) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.WEAK_PASSWORD,
          errors: passwordValidation.errors,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }



      // Create command
      const command: RegisterUserCommand = {
        email,
        password: rawData.password,
        phone,
        firstName,
        lastName,
        timestamp: new Date()
      };

      // Execute command
      const result = await this.registerHandler.handle(command);

      if (result.success && result.data) {
        // Generate email verification token
        const verificationToken = AuthValidation.generateSecureToken();
        AuthSecurityStore.storeVerificationToken(verificationToken, result.data.user.id, email);

        // Log security event
        this.logSecurityEvent('USER_REGISTERED', {
          userId: result.data.user.id,
          email: email,
          deviceInfo
        }, request);

        // TODO: Send verification email with token

        reply.status(HTTP_STATUS.CREATED).send({
          success: true,
          data: {
            userId: result.data.user.id,
            email: email,
            message: 'Registration successful'
          }
        });
      } else {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: result.error || 'Registration failed',
          errors: result.errors
        });
      }
    } catch (error) {
      this.logError('register', error, { email: request.body?.email });
      reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: `${ERROR_MESSAGES.INTERNAL_ERROR} during registration`
      });
    }
  }

  async login(
    request: FastifyRequest<{ Body: LoginUserRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { email: rawEmail, password, rememberMe } = request.body;
      const deviceInfo = AuthValidation.extractDeviceInfo(request);

      // Sanitize email
      const email = AuthValidation.sanitizeEmail(rawEmail || '');

      // Validate required fields
      if (!email || !password) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: 'Email and password are required',
          errors: ['email', 'password']
        });
        return;
      }

      // Validate email format
      if (!AuthValidation.validateEmail(email)) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.INVALID_EMAIL,
          errors: ['email'],
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if account is locked
      if (AuthSecurityStore.isAccountLocked(email)) {
        this.logSecurityEvent('LOGIN_ATTEMPT_ON_LOCKED_ACCOUNT', { email, deviceInfo }, request);

        reply.status(HTTP_STATUS.TOO_MANY_REQUESTS).send({
          success: false,
          error: ERROR_MESSAGES.ACCOUNT_LOCKED
        });
        return;
      }

      // Create command
      const command: LoginUserCommand = {
        email,
        password,
        rememberMe,
        timestamp: new Date()
      };

      // Execute command
      const result = await this.loginHandler.handle(command);

      if (result.success && result.data) {
        // Clear failed attempts on successful login
        AuthSecurityStore.clearFailedAttempts(email);

        // Generate tokens
        const tokens = generateAuthTokens({
          userId: result.data.user.id,
          email: result.data.user.email,
          status: 'active', // Default status since AuthResult doesn't include status
          isGuest: result.data.user.isGuest,
          emailVerified: result.data.user.emailVerified,
          phoneVerified: result.data.user.phoneVerified
        });

        // Log successful login
        this.logSecurityEvent('USER_LOGIN_SUCCESS', {
          userId: result.data.user.id,
          email,
          deviceInfo,
          rememberMe
        }, request);

        reply.status(HTTP_STATUS.OK).send({
          success: true,
          data: {
            accessToken: tokens.accessToken,
            refreshToken: rememberMe ? tokens.refreshToken : undefined,
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              isGuest: result.data.user.isGuest,
              emailVerified: result.data.user.emailVerified,
              phoneVerified: result.data.user.phoneVerified,
              status: 'active' // Default status since AuthResult doesn't include status
            },
            expiresIn: 15 * 60, // 15 minutes
            tokenType: 'Bearer' as const
          }
        });
      } else {
        // Record failed attempt
        AuthSecurityStore.recordFailedAttempt(email);

        // Log failed login attempt
        this.logSecurityEvent('USER_LOGIN_FAILED', {
          email,
          reason: result.error,
          deviceInfo
        }, request);

        reply.status(HTTP_STATUS.UNAUTHORIZED).send({
          success: false,
          error: ERROR_MESSAGES.INVALID_CREDENTIALS
        });
      }
    } catch (error) {
      this.logError('login', error, { email: request.body?.email });
      reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: `${ERROR_MESSAGES.INTERNAL_ERROR} during login`
      });
    }
  }

  async logout(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const authHeader = request.headers.authorization;
      const userId = (request as any).user?.userId;
      const deviceInfo = AuthValidation.extractDeviceInfo(request);

      // Extract token from Authorization header
      if (authHeader) {
        const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/);
        if (tokenMatch) {
          const token = tokenMatch[1];

          // Blacklist the token
          AuthSecurityStore.blacklistToken(token);

          // Log logout event
          if (userId) {
            this.logSecurityEvent('USER_LOGOUT', {
              userId,
              deviceInfo,
              tokenInvalidated: true
            }, request);
          }
        }
      }

      // TODO: In production, also:
      // 1. Remove refresh token from database
      // 2. Clear any server-side sessions
      // 3. Notify other sessions if needed

      reply.status(HTTP_STATUS.OK).send({
        success: true,
        data: {
          message: 'Logged out successfully',
          action: 'logout_complete'
        }
      });
    } catch (error) {
      this.logError('logout', error, { userId: (request as any).user?.userId });
      reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: `${ERROR_MESSAGES.INTERNAL_ERROR} during logout`
      });
    }
  }

  async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { refreshToken } = request.body;
      const deviceInfo = AuthValidation.extractDeviceInfo(request);

      if (!refreshToken) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.TOKEN_REQUIRED,
          errors: ['refreshToken']
        });
        return;
      }

      // Check if token is blacklisted
      if (AuthSecurityStore.isTokenBlacklisted(refreshToken)) {
        this.logSecurityEvent('BLACKLISTED_TOKEN_USED', { token: refreshToken.substring(0, 10) + '...', deviceInfo }, request);

        reply.status(HTTP_STATUS.UNAUTHORIZED).send({
          success: false,
          error: ERROR_MESSAGES.TOKEN_BLACKLISTED
        });
        return;
      }

      // Verify refresh token
      const tokenData = verifyRefreshToken(refreshToken);
      if (!tokenData) {
        reply.status(HTTP_STATUS.UNAUTHORIZED).send({
          success: false,
          error: ERROR_MESSAGES.INVALID_TOKEN
        });
        return;
      }

      // TODO: Fetch user data from database using tokenData.userId
      // For now, return placeholder data
      const userData = {
        userId: tokenData.userId,
        email: 'user@example.com', // TODO: Get from database
        status: 'active' as const,
        isGuest: false,
        emailVerified: true,
        phoneVerified: false
      };

      // Generate new tokens
      const tokens = generateAuthTokens(userData);

      // Blacklist old refresh token and use new one
      AuthSecurityStore.blacklistToken(refreshToken);

      // Log token refresh
      this.logSecurityEvent('TOKEN_REFRESHED', {
        userId: tokenData.userId,
        deviceInfo
      }, request);

      reply.status(HTTP_STATUS.OK).send({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: userData.userId,
            email: userData.email,
            isGuest: userData.isGuest,
            emailVerified: userData.emailVerified,
            phoneVerified: userData.phoneVerified,
            status: userData.status
          },
          expiresIn: 15 * 60, // 15 minutes
          tokenType: 'Bearer' as const
        }
      });
    } catch (error) {
      this.logError('refreshToken', error);
      reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: `${ERROR_MESSAGES.INTERNAL_ERROR} during token refresh`
      });
    }
  }

  async forgotPassword(
    request: FastifyRequest<{ Body: ForgotPasswordRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { email: rawEmail } = request.body;
      const deviceInfo = AuthValidation.extractDeviceInfo(request);

      // Sanitize email
      const email = AuthValidation.sanitizeEmail(rawEmail || '');

      if (!email) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.EMAIL_REQUIRED,
          errors: ['email']
        });
        return;
      }

      // Validate email format
      if (!AuthValidation.validateEmail(email)) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.INVALID_EMAIL,
          errors: ['email'],
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Check if user exists in database
      // For security, always return success even if email doesn't exist

      // Generate password reset token
      const resetToken = AuthValidation.generateSecureToken();
      const userId = 'temp-user-id'; // TODO: Get actual user ID from database
      AuthSecurityStore.storePasswordResetToken(resetToken, userId);

      // Log password reset request
      this.logSecurityEvent('PASSWORD_RESET_REQUESTED', {
        email,
        deviceInfo
      }, request);

      // TODO: Send password reset email with token

      reply.status(HTTP_STATUS.OK).send({
        success: true,
        data: {
          message: 'If an account with that email exists, password reset instructions have been sent.',
          action: 'password_reset_sent'
        }
      });
    } catch (error) {
      this.logError('forgotPassword', error, { email: request.body?.email });
      reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: `${ERROR_MESSAGES.INTERNAL_ERROR} during password reset request`
      });
    }
  }

  async resetPassword(
    request: FastifyRequest<{ Body: ResetPasswordRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { token, newPassword, confirmPassword } = request.body;
      const deviceInfo = AuthValidation.extractDeviceInfo(request);

      // Validate required fields
      if (!token || !newPassword || !confirmPassword) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: 'Token, new password, and confirmation are required',
          errors: ['token', 'newPassword', 'confirmPassword']
        });
        return;
      }

      // Validate password confirmation
      if (newPassword !== confirmPassword) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: 'Password confirmation does not match',
          errors: ['confirmPassword']
        });
        return;
      }

      // Validate password strength
      const passwordValidation = AuthValidation.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.WEAK_PASSWORD,
          errors: passwordValidation.errors,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify reset token
      const tokenData = AuthSecurityStore.getPasswordResetToken(token);
      if (!tokenData) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: 'Invalid or expired reset token'
        });
        return;
      }

      // TODO: Update user password in database
      // TODO: Invalidate all existing sessions for this user

      // Remove used token
      AuthSecurityStore.getPasswordResetToken(token); // This removes it due to expiry check

      // Log password reset
      this.logSecurityEvent('PASSWORD_RESET_COMPLETED', {
        userId: tokenData.userId,
        deviceInfo
      }, request);

      reply.status(HTTP_STATUS.OK).send({
        success: true,
        data: {
          message: 'Password has been reset successfully. Please log in with your new password.',
          action: 'password_reset_complete'
        }
      });
    } catch (error) {
      this.logError('resetPassword', error);
      reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: `${ERROR_MESSAGES.INTERNAL_ERROR} during password reset`
      });
    }
  }

  async verifyEmail(
    request: FastifyRequest<{ Body: VerifyEmailRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { token } = request.body;
      const deviceInfo = AuthValidation.extractDeviceInfo(request);

      if (!token) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.TOKEN_REQUIRED,
          errors: ['token']
        });
        return;
      }

      // Verify email verification token
      const tokenData = AuthSecurityStore.getVerificationToken(token);
      if (!tokenData) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: 'Invalid or expired verification token'
        });
        return;
      }

      // TODO: Update user email_verified status in database

      // Log email verification
      this.logSecurityEvent('EMAIL_VERIFIED', {
        userId: tokenData.userId,
        email: tokenData.email,
        deviceInfo
      }, request);

      reply.status(HTTP_STATUS.OK).send({
        success: true,
        data: {
          message: 'Email has been verified successfully. You can now access all features.',
          action: 'email_verified'
        }
      });
    } catch (error) {
      this.logError('verifyEmail', error);
      reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: `${ERROR_MESSAGES.INTERNAL_ERROR} during email verification`
      });
    }
  }

  async resendVerification(
    request: FastifyRequest<{ Body: ResendVerificationRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { email: rawEmail } = request.body;
      const deviceInfo = AuthValidation.extractDeviceInfo(request);

      // Sanitize email
      const email = AuthValidation.sanitizeEmail(rawEmail || '');

      if (!email) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.EMAIL_REQUIRED,
          errors: ['email']
        });
        return;
      }

      // Validate email format
      if (!AuthValidation.validateEmail(email)) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.INVALID_EMAIL,
          errors: ['email'],
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Check if user exists and email is not already verified

      // Generate new verification token
      const verificationToken = AuthValidation.generateSecureToken();
      const userId = 'temp-user-id'; // TODO: Get actual user ID from database
      AuthSecurityStore.storeVerificationToken(verificationToken, userId, email);

      // Log verification resend
      this.logSecurityEvent('VERIFICATION_EMAIL_RESENT', {
        email,
        deviceInfo
      }, request);

      // TODO: Send new verification email

      reply.status(HTTP_STATUS.OK).send({
        success: true,
        data: {
          message: 'Verification email has been sent. Please check your inbox.',
          action: 'verification_sent'
        }
      });
    } catch (error) {
      this.logError('resendVerification', error, { email: request.body?.email });
      reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: `${ERROR_MESSAGES.INTERNAL_ERROR} during verification resend`
      });
    }
  }

  async changePassword(
    request: FastifyRequest<{ Body: ChangePasswordRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { currentPassword, newPassword, confirmPassword } = request.body;
      const userId = (request as any).user?.userId;
      const deviceInfo = AuthValidation.extractDeviceInfo(request);

      if (!userId) {
        reply.status(HTTP_STATUS.UNAUTHORIZED).send({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Validate required fields
      if (!currentPassword || !newPassword || !confirmPassword) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: 'Current password, new password, and confirmation are required',
          errors: ['currentPassword', 'newPassword', 'confirmPassword']
        });
        return;
      }

      // Validate password confirmation
      if (newPassword !== confirmPassword) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: 'Password confirmation does not match',
          errors: ['confirmPassword']
        });
        return;
      }

      // Validate new password strength
      const passwordValidation = AuthValidation.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        reply.status(HTTP_STATUS.BAD_REQUEST).send({
          success: false,
          error: ERROR_MESSAGES.WEAK_PASSWORD,
          errors: passwordValidation.errors,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // TODO: Verify current password
      // TODO: Update password in database
      // TODO: Invalidate all other sessions

      // Log password change
      this.logSecurityEvent('PASSWORD_CHANGED', {
        userId,
        deviceInfo
      }, request);

      reply.status(HTTP_STATUS.OK).send({
        success: true,
        data: {
          message: 'Password has been changed successfully.',
          action: 'password_changed'
        }
      });
    } catch (error) {
      this.logError('changePassword', error, { userId: (request as any).user?.userId });
      reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
        success: false,
        error: `${ERROR_MESSAGES.INTERNAL_ERROR} during password change`
      });
    }
  }
}