import { SettingsRepository } from "../../infra/persistence/repositories/settings.repository";
import { SystemSetting } from "@prisma/client";

export class SettingsService {
  constructor(private readonly repository: SettingsRepository) {}

  async getAllSettings(): Promise<SystemSetting[]> {
    return this.repository.findAll();
  }

  async getPublicSettings(): Promise<Record<string, any>> {
    const settings = await this.repository.findPublic();
    return this.transformSettings(settings);
  }

  async getSettingsByGroup(group: string): Promise<Record<string, any>> {
    const settings = await this.repository.findByGroup(group);
    return this.transformSettings(settings);
  }

  async updateSettings(
    updates: Array<{ key: string; value: any }>,
  ): Promise<void> {
    console.log("[SettingsService] updateSettings called with:", updates);

    for (const update of updates) {
      console.log(`[SettingsService] Processing update for key: ${update.key}, value:`, update.value);

      // Convert value to string based on type logic if needed,
      // but for now we assume the controller passes stringified values or we stringify here
      const stringValue =
        typeof update.value === "string"
          ? update.value
          : JSON.stringify(update.value);

      console.log(`[SettingsService] Updating ${update.key} with stringValue:`, stringValue);
      await this.repository.updateValue(update.key, stringValue);
      console.log(`[SettingsService] Successfully updated ${update.key}`);
    }

    console.log("[SettingsService] All settings updated successfully");
  }

  // Typed getters for commonly used settings
  async getShippingRates(): Promise<{
    colombo: number;
    suburbs: number;
    freeThreshold: number;
  }> {
    const colombo = await this.repository.findByKey("shipping_rate_colombo");
    const suburbs = await this.repository.findByKey("shipping_rate_suburbs");
    const threshold = await this.repository.findByKey(
      "free_shipping_threshold",
    );

    return {
      colombo: colombo ? parseFloat(colombo.value) : 250.0,
      suburbs: suburbs ? parseFloat(suburbs.value) : 250.0,
      freeThreshold: threshold ? parseFloat(threshold.value) : 5000,
    };
  }

  private transformSettings(settings: SystemSetting[]): Record<string, any> {
    const result: Record<string, any> = {};
    for (const setting of settings) {
      // Parse JSON typed values
      if (setting.type === "json") {
        try {
          result[setting.key] = JSON.parse(setting.value);
        } catch (e) {
          result[setting.key] = setting.value;
        }
      } else if (setting.type === "number") {
        result[setting.key] = Number(setting.value);
      } else if (setting.type === "boolean") {
        result[setting.key] = setting.value === "true";
      } else {
        result[setting.key] = setting.value;
      }
    }
    return result;
  }
}
