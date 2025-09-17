import { PrismaClient, UserStatus as PrismaUserStatus } from "@prisma/client";
import { IUserRepository } from "../../../domain/repositories/iuser.repository";
import { User, UserStatus } from "../../../domain/entities/user.entity";
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
        status: this.mapStatusToPrisma(data.status),
        emailVerified: data.email_verified,
        phoneVerified: data.phone_verified,
        isGuest: data.is_guest,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
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
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
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
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
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
        status: this.mapStatusToPrisma(data.status),
        emailVerified: data.email_verified,
        phoneVerified: data.phone_verified,
        isGuest: data.is_guest,
        updatedAt: data.updated_at,
      },
    });
  }

  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.getValue() },
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
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
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
      orderBy: { createdAt: 'desc' },
    });

    return users.map(userData => User.fromDatabaseRow({
      user_id: userData.id,
      email: userData.email,
      password_hash: userData.passwordHash,
      phone: userData.phone,
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
    }));
  }

  async findGuestUsers(limit?: number, offset?: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isGuest: true },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return users.map(userData => User.fromDatabaseRow({
      user_id: userData.id,
      email: userData.email,
      password_hash: userData.passwordHash,
      phone: userData.phone,
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
    }));
  }

  async findUnverifiedUsers(limit?: number, offset?: number): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        emailVerified: false,
        isGuest: false,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });

    return users.map(userData => User.fromDatabaseRow({
      user_id: userData.id,
      email: userData.email,
      password_hash: userData.passwordHash,
      phone: userData.phone,
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
    }));
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
    const userIds = ids.map(id => id.getValue());

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    return users.map(userData => User.fromDatabaseRow({
      user_id: userData.id,
      email: userData.email,
      password_hash: userData.passwordHash,
      phone: userData.phone,
      status: this.mapStatusFromPrisma(userData.status),
      email_verified: userData.emailVerified,
      phone_verified: userData.phoneVerified,
      is_guest: userData.isGuest,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt,
    }));
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
}