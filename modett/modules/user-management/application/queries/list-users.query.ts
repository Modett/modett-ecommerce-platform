import { IUserRepository } from "../../domain/repositories/iuser.repository";
import { UserRole, UserStatus } from "../../domain/entities/user.entity";
import {
  IQuery,
  IQueryHandler,
} from "./get-user-profile.query";
import { CommandResult } from "../commands/register-user.command";

export interface ListUsersQuery extends IQuery {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "email";
  sortOrder?: "asc" | "desc";
}

export interface ListUsersResult {
  users: Array<{
    userId: string;
    email: string;
    phone?: string;
    role: string;
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    isGuest: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ListUsersHandler
  implements IQueryHandler<ListUsersQuery, CommandResult<ListUsersResult>>
{
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(
    query: ListUsersQuery
  ): Promise<CommandResult<ListUsersResult>> {
    try {
      // Set defaults
      const page = query.page || 1;
      const limit = query.limit || 20;
      const sortBy = query.sortBy || "createdAt";
      const sortOrder = query.sortOrder || "desc";

      // Validate pagination
      if (page < 1) {
        return CommandResult.failure<ListUsersResult>(
          "Page number must be greater than 0",
          ["page"]
        );
      }

      if (limit < 1 || limit > 100) {
        return CommandResult.failure<ListUsersResult>(
          "Limit must be between 1 and 100",
          ["limit"]
        );
      }

      // Fetch users with filters
      const { users, total } = await this.userRepository.findAllWithFilters({
        search: query.search,
        role: query.role,
        status: query.status,
        emailVerified: query.emailVerified,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      // Map to result format
      const userDTOs = users.map((user) => ({
        userId: user.getId().getValue(),
        email: user.getEmail().getValue(),
        phone: user.getPhone()?.getValue() || undefined,
        role: user.getRole(),
        status: user.getStatus(),
        emailVerified: user.isEmailVerified(),
        phoneVerified: user.isPhoneVerified(),
        isGuest: user.getIsGuest(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
      }));

      const totalPages = Math.ceil(total / limit);

      const result: ListUsersResult = {
        users: userDTOs,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      };

      return CommandResult.success<ListUsersResult>(result);
    } catch (error) {
      console.error("[ListUsersHandler] Error:", error);

      if (error instanceof Error) {
        return CommandResult.failure<ListUsersResult>(
          "Failed to retrieve users list",
          [error.message]
        );
      }

      return CommandResult.failure<ListUsersResult>(
        "An unexpected error occurred while retrieving users"
      );
    }
  }
}
