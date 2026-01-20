import { User, UserRole, UserStatus } from "../entities/user.entity";
import { UserId } from "../value-objects/user-id.vo";
import { Email } from "../value-objects/email.vo";

export interface FindAllWithFiltersOptions {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  page: number;
  limit: number;
  sortBy?: "createdAt" | "email";
  sortOrder?: "asc" | "desc";
}

export interface FindAllWithFiltersResult {
  users: User[];
  total: number;
}

export interface IUserRepository {
  // Core CRUD operations
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  update(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
  count(): Promise<number>;
  countByRole(role: UserRole): Promise<number>;
  countNewUsers(since: Date): Promise<number>;

  // Query operations
  findByPhone(phone: string): Promise<User | null>;
  findActiveUsers(limit?: number, offset?: number): Promise<User[]>;
  findGuestUsers(limit?: number, offset?: number): Promise<User[]>;
  findUnverifiedUsers(limit?: number, offset?: number): Promise<User[]>;
  findAllWithFilters(
    options: FindAllWithFiltersOptions
  ): Promise<FindAllWithFiltersResult>;

  // Business operations
  existsByEmail(email: Email): Promise<boolean>;
  existsByPhone(phone: string): Promise<boolean>;
  countActiveUsers(): Promise<number>;
  countGuestUsers(): Promise<number>;

  // Batch operations
  findByIds(ids: UserId[]): Promise<User[]>;
  deleteInactiveSince(date: Date): Promise<number>;
}
