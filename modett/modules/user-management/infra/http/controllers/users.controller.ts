import { FastifyRequest, FastifyReply } from "fastify";
import {
  GetUserProfileQuery,
  GetUserProfileHandler,
  GetUserDetailsQuery,
  GetUserDetailsHandler,
} from "../../../application";
import { UserProfileService } from "../../../application/services/user-profile.service";
import { IUserRepository } from "../../../domain/repositories/iuser.repository";
import { IAddressRepository } from "../../../domain/repositories/iaddress.repository";

// Response DTOs
export interface UserResponse {
  success: boolean;
  data?: {
    userId: string;
    email?: string;
    profile?: {
      defaultAddressId?: string;
      defaultPaymentMethodId?: string;
      preferences: Record<string, any>;
      locale?: string;
      currency?: string;
      stylePreferences: Record<string, any>;
      preferredSizes: Record<string, any>;
    };
  };
  error?: string;
  errors?: string[];
}

export class UsersController {
  private getProfileHandler: GetUserProfileHandler;
  private getUserDetailsHandler: GetUserDetailsHandler;

  constructor(
    userProfileService: UserProfileService,
    userRepository: IUserRepository,
    addressRepository: IAddressRepository
  ) {
    this.getProfileHandler = new GetUserProfileHandler(userProfileService);
    this.getUserDetailsHandler = new GetUserDetailsHandler(userRepository, addressRepository);
  }

  async getUser(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { userId } = request.params;

      if (!userId) {
        reply.status(400).send({
          success: false,
          error: "User ID is required",
          errors: ["userId"],
        });
        return;
      }

      // Create query to get user profile
      const query: GetUserProfileQuery = {
        userId,
        timestamp: new Date(),
      };

      // Execute query
      const result = await this.getProfileHandler.handle(query);

      if (result.success && result.data) {
        reply.status(200).send({
          success: true,
          data: {
            userId: result.data.userId,
            profile: {
              defaultAddressId: result.data.defaultAddressId,
              defaultPaymentMethodId: result.data.defaultPaymentMethodId,
              preferences: result.data.preferences,
              locale: result.data.locale,
              currency: result.data.currency,
              stylePreferences: result.data.stylePreferences,
              preferredSizes: result.data.preferredSizes,
            },
          },
        });
      } else {
        const statusCode = result.error?.includes("not found") ? 404 : 400;
        reply.status(statusCode).send({
          success: false,
          error: result.error || "User not found",
          errors: result.errors,
        });
      }
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: "Internal server error while retrieving user",
      });
    }
  }

  async getCurrentUser(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Extract user info from JWT token (assuming middleware sets it)
      const userId = (request as any).user?.userId;

      if (!userId) {
        reply.status(401).send({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      // Create query to get user details
      const query: GetUserDetailsQuery = {
        userId,
        timestamp: new Date(),
      };

      // Execute query
      const result = await this.getUserDetailsHandler.handle(query);

      if (result.success && result.data) {
        reply.status(200).send({
          success: true,
          data: {
            userId: result.data.userId,
            email: result.data.email,
            phone: result.data.phone,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            status: result.data.status,
            emailVerified: result.data.emailVerified,
            phoneVerified: result.data.phoneVerified,
            isGuest: result.data.isGuest,
            createdAt: result.data.createdAt,
            updatedAt: result.data.updatedAt,
          },
        });
      } else {
        const statusCode = result.error?.includes("not found") ? 404 : 400;
        reply.status(statusCode).send({
          success: false,
          error: result.error || "User not found",
          errors: result.errors,
        });
      }
    } catch (error) {
      reply.status(500).send({
        success: false,
        error: "Internal server error while retrieving current user",
      });
    }
  }
}
