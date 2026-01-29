import { FastifyReply, FastifyRequest } from "fastify";
import { SettingsService } from "../../../application/services/settings.service";

export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Debug logging
      console.log("[Settings Controller] GET /admin/settings");
      console.log("[Settings Controller] User:", request.user);
      console.log("[Settings Controller] Auth Header:", request.headers.authorization ? "Present" : "Missing");

      const settings = await this.settingsService.getAllSettings();

      // Group them for the frontend and convert to key-value format
      const grouped = settings.reduce(
        (acc: Record<string, Record<string, any>>, setting: any) => {
          if (!acc[setting.group]) acc[setting.group] = {};
          acc[setting.group][setting.key] = setting.value;
          return acc;
        },
        {} as Record<string, Record<string, any>>,
      );

      return reply.send({
        success: true,
        data: grouped,
      });
    } catch (error: any) {
      request.log.error("Error fetching settings:", error);
      return reply.status(500).send({
        success: false,
        error: error.message || "Failed to fetch settings",
      });
    }
  }

  async getPublic(request: FastifyRequest, reply: FastifyReply) {
    try {
      const settings = await this.settingsService.getPublicSettings();
      return reply.send(settings);
    } catch (error: any) {
      request.log.error("Error fetching public settings:", error);
      return reply.status(500).send({
        error: error.message || "Failed to fetch public settings",
      });
    }
  }

  async updateBulk(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log("[Settings Controller] PUT /admin/settings");
      console.log("[Settings Controller] Request body:", JSON.stringify(request.body, null, 2));
      console.log("[Settings Controller] User:", request.user);

      const { settings } = request.body as { settings: Array<{ key: string; value: any }> };

      if (!settings || !Array.isArray(settings)) {
        return reply.status(400).send({
          success: false,
          error: "Settings array is required",
        });
      }

      console.log("[Settings Controller] Updating", settings.length, "settings");
      await this.settingsService.updateSettings(settings);
      console.log("[Settings Controller] Settings updated successfully");

      return reply.send({ success: true });
    } catch (error: any) {
      console.error("[Settings Controller] Error updating settings:", error);
      request.log.error("Error updating settings:", error);
      return reply.status(500).send({
        success: false,
        error: error.message || "Failed to update settings",
      });
    }
  }
}
