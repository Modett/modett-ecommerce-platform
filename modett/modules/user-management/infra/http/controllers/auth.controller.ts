import { FastifyRequest, FastifyReply } from 'fastify';
import {
  RegisterUserCommand,
  RegisterUserHandler,
  LoginUserCommand,
  LoginUserHandler
} from '../../../application/commands';
import { AuthenticationService } from '../../../application/services/authentication.service';

// Request DTOs
export interface RegisterUserRequest {
  email: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Response DTOs
export interface AuthResponse {
  success: boolean;
  data?: {
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
  };
  error?: string;
  errors?: string[];
}

export class AuthController {
  private registerHandler: RegisterUserHandler;
  private loginHandler: LoginUserHandler;

  constructor(authService: AuthenticationService) {
    this.registerHandler = new RegisterUserHandler(authService);
    this.loginHandler = new LoginUserHandler(authService);
  }

  async register(
    request: FastifyRequest<{ Body: RegisterUserRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Validate request body
      const { email, password, phone, firstName, lastName } = request.body;

      if (!email || !password) {
        reply.status(400).send({
          success: false,
          error: 'Email and password are required',
          errors: ['email', 'password']
        });
        return;
      }

      // Create command
      const command: RegisterUserCommand = {
        email,
        password,
        phone,
        firstName,
        lastName,
        timestamp: new Date()
      };

      // Execute command
      const result = await this.registerHandler.handle(command);

      if (result.success) {
        reply.status(201).send({
          success: true,
          data: result.data
        });
      } else {
        reply.status(400).send({
          success: false,
          error: result.error,
          errors: result.errors
        });
      }
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: 'Internal server error during registration'
      });
    }
  }

  async login(
    request: FastifyRequest<{ Body: LoginUserRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Validate request body
      const { email, password, rememberMe } = request.body;

      if (!email || !password) {
        reply.status(400).send({
          success: false,
          error: 'Email and password are required',
          errors: ['email', 'password']
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

      if (result.success) {
        reply.status(200).send({
          success: true,
          data: result.data
        });
      } else {
        reply.status(401).send({
          success: false,
          error: result.error,
          errors: result.errors
        });
      }
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: 'Internal server error during login'
      });
    }
  }

  async logout(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // For now, just return success - client should remove tokens
      reply.status(200).send({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: 'Internal server error during logout'
      });
    }
  }
}