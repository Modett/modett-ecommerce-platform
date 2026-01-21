import { PrismaClient, SystemSetting } from "@prisma/client";

export class SettingsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<SystemSetting[]> {
    return this.prisma.systemSetting.findMany({
      orderBy: { group: "asc" },
    });
  }

  async findByGroup(group: string): Promise<SystemSetting[]> {
    return this.prisma.systemSetting.findMany({
      where: { group },
      orderBy: { key: "asc" },
    });
  }

  async findPublic(): Promise<SystemSetting[]> {
    return this.prisma.systemSetting.findMany({
      where: { isPublic: true },
    });
  }

  async findByKey(key: string): Promise<SystemSetting | null> {
    return this.prisma.systemSetting.findUnique({
      where: { key },
    });
  }

  async upsert(data: {
    group: string;
    key: string;
    value: string;
    type: string;
    isPublic?: boolean;
    description?: string;
  }): Promise<SystemSetting> {
    return this.prisma.systemSetting.upsert({
      where: { key: data.key },
      create: {
        group: data.group,
        key: data.key,
        value: data.value,
        type: data.type,
        isPublic: data.isPublic ?? false,
        description: data.description,
      },
      update: {
        value: data.value,
        type: data.type,
        isPublic: data.isPublic, // Update public status if provided
        group: data.group,
      },
    });
  }

  async updateValue(key: string, value: string): Promise<SystemSetting> {
    return this.prisma.systemSetting.update({
      where: { key },
      data: { value },
    });
  }
}
