import { FastifyRequest, FastifyReply } from 'fastify';
import {
  UpdateProfileCommand,
  UpdateProfileHandler,
  GetUserProfileQuery,
  GetUserProfileHandler
} from '../../../application';
import { UserProfileService } from '../../../application/services/user-profile.service';

// Request DTOs
export interface UpdateProfileRequest {
  defaultAddressId?: string;
  defaultPaymentMethodId?: string;
  preferences?: Record<string, any>;
  locale?: string;
  currency?: string;
  stylePreferences?: Record<string, any>;
  preferredSizes?: Record<string, any>;
}

// Response DTOs
export interface ProfileResponse {
  success: boolean;
  data?: {
    userId: string;
    defaultAddressId?: string;
    defaultPaymentMethodId?: string;
    preferences: Record<string, any>;
    locale?: string;
    currency?: string;
    stylePreferences: Record<string, any>;
    preferredSizes: Record<string, any>;
  };
  error?: string;
  errors?: string[];
}

export interface UpdateProfileResponse {
  success: boolean;
  data?: {
    userId: string;
    updated: boolean;
    message: string;
  };
  error?: string;
  errors?: string[];
}

export class ProfileController {
  private getProfileHandler: GetUserProfileHandler;
  private updateProfileHandler: UpdateProfileHandler;

  constructor(userProfileService: UserProfileService) {
    this.getProfileHandler = new GetUserProfileHandler(userProfileService);
    this.updateProfileHandler = new UpdateProfileHandler(userProfileService);
  }

  async getProfile(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { userId } = request.params;

      if (!userId) {
        reply.status(400).send({
          success: false,
          error: 'User ID is required',
          errors: ['userId']
        });
        return;
      }

      // Create query
      const query: GetUserProfileQuery = {
        userId,
        timestamp: new Date()
      };

      // Execute query
      const result = await this.getProfileHandler.handle(query);

      if (result.success) {
        reply.status(200).send({
          success: true,
          data: result.data
        });
      } else {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        reply.status(statusCode).send({
          success: false,
          error: result.error,
          errors: result.errors
        });
      }
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: 'Internal server error while retrieving profile'
      });
    }
  }

  async updateProfile(
    request: FastifyRequest<{
      Params: { userId: string };
      Body: UpdateProfileRequest;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { userId } = request.params;
      const {
        defaultAddressId,
        defaultPaymentMethodId,
        preferences,
        locale,
        currency,
        stylePreferences,
        preferredSizes
      } = request.body;

      if (!userId) {
        reply.status(400).send({
          success: false,
          error: 'User ID is required',
          errors: ['userId']
        });
        return;
      }

      // Create command
      const command: UpdateProfileCommand = {
        userId,
        defaultAddressId,
        defaultPaymentMethodId,
        preferences,
        locale,
        currency,
        stylePreferences,
        preferredSizes,
        timestamp: new Date()
      };

      // Execute command
      const result = await this.updateProfileHandler.handle(command);

      if (result.success) {
        reply.status(200).send({
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
        error: 'Internal server error while updating profile'
      });
    }
  }

  async getCurrentUserProfile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Extract user ID from JWT token (assuming middleware sets it)
      const userId = (request as any).user?.userId;

      if (!userId) {
        reply.status(401).send({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Create query
      const query: GetUserProfileQuery = {
        userId,
        timestamp: new Date()
      };

      // Execute query
      const result = await this.getProfileHandler.handle(query);

      if (result.success) {
        reply.status(200).send({
          success: true,
          data: result.data
        });
      } else {
        const statusCode = result.error?.includes('not found') ? 404 : 400;
        reply.status(statusCode).send({
          success: false,
          error: result.error,
          errors: result.errors
        });
      }
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: 'Internal server error while retrieving current user profile'
      });
    }
  }

  async updateCurrentUserProfile(
    request: FastifyRequest<{ Body: UpdateProfileRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Extract user ID from JWT token (assuming middleware sets it)
      const userId = (request as any).user?.userId;

      if (!userId) {
        reply.status(401).send({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const {
        defaultAddressId,
        defaultPaymentMethodId,
        preferences,
        locale,
        currency,
        stylePreferences,
        preferredSizes
      } = request.body;

      // Create command
      const command: UpdateProfileCommand = {
        userId,
        defaultAddressId,
        defaultPaymentMethodId,
        preferences,
        locale,
        currency,
        stylePreferences,
        preferredSizes,
        timestamp: new Date()
      };

      // Execute command
      const result = await this.updateProfileHandler.handle(command);

      if (result.success) {
        reply.status(200).send({
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
        error: 'Internal server error while updating current user profile'
      });
    }
  }
}