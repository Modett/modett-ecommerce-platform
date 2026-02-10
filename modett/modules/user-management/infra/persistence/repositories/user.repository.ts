import {
  PrismaClient,
  UserStatus as PrismaUserStatus,
  UserRole as PrismaUserRole,
} from "@prisma/client";
import {
  IUserRepository,
  FindAllWithFiltersOptions,
  FindAllWithFiltersResult,
} from "../../../domain/repositories/iuser.repository";
import {
  User,
  UserStatus,
  UserRole,
} from "../../../domain/entities/user.entity";
import { UserId } from "../../../domain/value-objects/user-id.vo";
import { Email } from "../../../domain/value-objects/email.vo";

export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<void> {
    const data = user.toDatabaseRow();

    await this.prisma.user.create({
      data: {
        id: data.user_id,
        email: data.email,
        passwordHash: data.password_hash,
        phone: data.phone,
        role: this.mapRoleToPrisma(data.role),
        status: this.mapStatusToPrisma(data.status),
        emailVerified: data.email_verified,
        phoneVerified: data.phone_verified,
        isGuest: data.is_guest,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        twoFactorSecret: data.two_factor_secret,
        twoFactorEnabled: data.two_factor_enabled,
        twoFactorBackupCodes: data.two_factor_backup_codes,
        firstName: data.first_name,
        lastName: data.last_name,
      },
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
    });

    if (!userData) {
      return null;
    }

    return User.fromDatabaseRow({
      user_id: userData.id,
      email: userData.email,
      password_hash: userData.passwordHash,
      phone: userData.phone,
      role: this.mapRoleFromPrisma(userData.role),
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
      two_factor_enabled: userData.twoFactorEnabled,
      two_factor_secret: userData.twoFactorSecret,
      two_factor_backup_codes: userData.twoFactorBackupCodes,
    });
  }

  async findByEmail(email: Email): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email: email.getValue() },
    });

    if (!userData) {
      return null;
    }

    return User.fromDatabaseRow({
      user_id: userData.id,
      email: userData.email,
      password_hash: userData.passwordHash,
      phone: userData.phone,
      role: this.mapRoleFromPrisma(userData.role),
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
      two_factor_enabled: userData.twoFactorEnabled,
      two_factor_secret: userData.twoFactorSecret,
      two_factor_backup_codes: userData.twoFactorBackupCodes,
    });
  }

  async update(user: User): Promise<void> {
    const data = user.toDatabaseRow();

    await this.prisma.user.update({
      where: { id: data.user_id },
      data: {
        email: data.email,
        passwordHash: data.password_hash,
        phone: data.phone,
        role: this.mapRoleToPrisma(data.role),
        status: this.mapStatusToPrisma(data.status),
        emailVerified: data.email_verified,
        phoneVerified: data.phone_verified,
        isGuest: data.is_guest,
        updatedAt: data.updated_at,
        twoFactorSecret: data.two_factor_secret,
        twoFactorEnabled: data.two_factor_enabled,
        twoFactorBackupCodes: data.two_factor_backup_codes,
        firstName: data.first_name,
        lastName: data.last_name,
        title: data.title,
        dateOfBirth: data.date_of_birth,
        residentOf: data.resident_of,
        nationality: data.nationality,
      },
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.getValue() },
    });
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  async countByRole(role: UserRole): Promise<number> {
    return this.prisma.user.count({
      where: { role: this.mapRoleToPrisma(role) },
    });
  }

  async countNewUsers(since: Date): Promise<number> {
    return this.prisma.user.count({
      where: { createdAt: { gte: since } },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    const userData = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (!userData) {
      return null;
    }

    return User.fromDatabaseRow({
      user_id: userData.id,
      email: userData.email,
      password_hash: userData.passwordHash,
      phone: userData.phone,
      role: this.mapRoleFromPrisma(userData.role),
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
      two_factor_enabled: userData.twoFactorEnabled,
      two_factor_secret: userData.twoFactorSecret,
      two_factor_backup_codes: userData.twoFactorBackupCodes,
    });
  }

  async findActiveUsers(limit?: number, offset?: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        status: PrismaUserStatus.active,
        isGuest: false,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    return users.map((userData) =>
      User.fromDatabaseRow({
        user_id: userData.id,
        email: userData.email,
        password_hash: userData.passwordHash,
        phone: userData.phone,
        role: this.mapRoleFromPrisma(userData.role),
        status: this.mapStatusFromPrisma(userData.status),
        email_verified: userData.emailVerified,
        phone_verified: userData.phoneVerified,
        is_guest: userData.isGuest,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt,
        two_factor_enabled: userData.twoFactorEnabled,
        two_factor_secret: userData.twoFactorSecret,
        two_factor_backup_codes: userData.twoFactorBackupCodes,
      }),
    );
  }

  async findGuestUsers(limit?: number, offset?: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isGuest: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    return users.map((userData) =>
      User.fromDatabaseRow({
        user_id: userData.id,
        email: userData.email,
        password_hash: userData.passwordHash,
        phone: userData.phone,
        role: this.mapRoleFromPrisma(userData.role),
        status: this.mapStatusFromPrisma(userData.status),
        email_verified: userData.emailVerified,
        phone_verified: userData.phoneVerified,
        is_guest: userData.isGuest,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt,
        two_factor_enabled: userData.twoFactorEnabled,
        two_factor_secret: userData.twoFactorSecret,
        two_factor_backup_codes: userData.twoFactorBackupCodes,
      }),
    );
  }

  async findUnverifiedUsers(limit?: number, offset?: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        emailVerified: false,
        isGuest: false,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: "desc" },
    });

    return users.map((userData) =>
      User.fromDatabaseRow({
        user_id: userData.id,
        email: userData.email,
        password_hash: userData.passwordHash,
        phone: userData.phone,
        role: this.mapRoleFromPrisma(userData.role),
        status: this.mapStatusFromPrisma(userData.status),
        email_verified: userData.emailVerified,
        phone_verified: userData.phoneVerified,
        is_guest: userData.isGuest,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt,
        two_factor_enabled: userData.twoFactorEnabled,
        two_factor_secret: userData.twoFactorSecret,
        two_factor_backup_codes: userData.twoFactorBackupCodes,
      }),
    );
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.getValue() },
    });
    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { phone },
    });
    return count > 0;
  }

  async countActiveUsers(): Promise<number> {
    return await this.prisma.user.count({
      where: {
        status: PrismaUserStatus.active,
        isGuest: false,
      },
    });
  }

  async countGuestUsers(): Promise<number> {
    return await this.prisma.user.count({
      where: { isGuest: true },
    });
  }

  async findByIds(ids: UserId[]): Promise<User[]> {
    const userIds = ids.map((id) => id.getValue());

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    return users.map((userData) =>
      User.fromDatabaseRow({
        user_id: userData.id,
        email: userData.email,
        password_hash: userData.passwordHash,
        phone: userData.phone,
        role: this.mapRoleFromPrisma(userData.role),
        status: this.mapStatusFromPrisma(userData.status),
        email_verified: userData.emailVerified,
        phone_verified: userData.phoneVerified,
        is_guest: userData.isGuest,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt,
        two_factor_enabled: userData.twoFactorEnabled,
        two_factor_secret: userData.twoFactorSecret,
        two_factor_backup_codes: userData.twoFactorBackupCodes,
      }),
    );
  }

  async deleteInactiveSince(date: Date): Promise<number> {
    const result = await this.prisma.user.deleteMany({
      where: {
        status: PrismaUserStatus.inactive,
        updatedAt: { lt: date },
      },
    });
    return result.count;
  }

  async findAllWithFilters(
    options: FindAllWithFiltersOptions,
  ): Promise<FindAllWithFiltersResult> {
    const {
      search,
      role,
      status,
      emailVerified,
      page,
      limit,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    // Build where clause
    const where: any = {};

    // Search filter (email or phone contains search term)
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role filter
    if (role) {
      where.role = this.mapRoleToPrisma(role);
    }

    // Status filter
    if (status) {
      where.status = this.mapStatusToPrisma(status);
    }

    // Email verified filter
    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Execute query with pagination and count in parallel
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Map to domain entities
    const domainUsers = users.map((userData) =>
      User.fromDatabaseRow({
        user_id: userData.id,
        email: userData.email,
        password_hash: userData.passwordHash,
        phone: userData.phone,
        role: this.mapRoleFromPrisma(userData.role),
        status: this.mapStatusFromPrisma(userData.status),
        email_verified: userData.emailVerified,
        phone_verified: userData.phoneVerified,
        is_guest: userData.isGuest,
        created_at: userData.createdAt,
        updated_at: userData.updatedAt,
        two_factor_enabled: userData.twoFactorEnabled,
        two_factor_secret: userData.twoFactorSecret,
        two_factor_backup_codes: userData.twoFactorBackupCodes,
      }),
    );

    return { users: domainUsers, total };
  }

  // Helper methods to map between domain and Prisma enums
  private mapStatusToPrisma(status: UserStatus): PrismaUserStatus {
    switch (status) {
      case UserStatus.ACTIVE:
        return PrismaUserStatus.active;
      case UserStatus.INACTIVE:
        return PrismaUserStatus.inactive;
      case UserStatus.BLOCKED:
        return PrismaUserStatus.blocked;
      default:
        throw new Error(`Unknown user status: ${status}`);
    }
  }

  private mapStatusFromPrisma(status: PrismaUserStatus): UserStatus {
    switch (status) {
      case PrismaUserStatus.active:
        return UserStatus.ACTIVE;
      case PrismaUserStatus.inactive:
        return UserStatus.INACTIVE;
      case PrismaUserStatus.blocked:
        return UserStatus.BLOCKED;
      default:
        throw new Error(`Unknown Prisma user status: ${status}`);
    }
  }

  private mapRoleToPrisma(role: UserRole): PrismaUserRole {
    switch (role) {
      case UserRole.GUEST:
        return PrismaUserRole.GUEST;
      case UserRole.CUSTOMER:
        return PrismaUserRole.CUSTOMER;
      case UserRole.ADMIN:
        return PrismaUserRole.ADMIN;
      case UserRole.INVENTORY_STAFF:
        return PrismaUserRole.INVENTORY_STAFF;
      case UserRole.CUSTOMER_SERVICE:
        return PrismaUserRole.CUSTOMER_SERVICE;
      case UserRole.ANALYST:
        return PrismaUserRole.ANALYST;
      case UserRole.VENDOR:
        return PrismaUserRole.VENDOR;
      default:
        throw new Error(`Unknown user role: ${role}`);
    }
  }

  private mapRoleFromPrisma(role: PrismaUserRole): UserRole {
    switch (role) {
      case PrismaUserRole.GUEST:
        return UserRole.GUEST;
      case PrismaUserRole.CUSTOMER:
        return UserRole.CUSTOMER;
      case PrismaUserRole.ADMIN:
        return UserRole.ADMIN;
      case PrismaUserRole.INVENTORY_STAFF:
        return UserRole.INVENTORY_STAFF;
      case PrismaUserRole.CUSTOMER_SERVICE:
        return UserRole.CUSTOMER_SERVICE;
      case PrismaUserRole.ANALYST:
        return UserRole.ANALYST;
      case PrismaUserRole.VENDOR:
        return UserRole.VENDOR;
      default:
        throw new Error(`Unknown Prisma user role: ${role}`);
    }
  }
}
