export type SettingsGroup =
  | "general"
  | "appearance"
  | "shipping"
  | "inventory"
  | "account";

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  group: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsResponse {
  success: boolean;
  data: Record<string, Record<string, any>>;
  // Structure: { "general": { "store_name": "Modett" }, "shipping": { ... } }
  error?: string;
}

export interface UpdateSettingRequest {
  key: string;
  value: any;
  group?: string;
}

export interface UpdateSettingsResponse {
  success: boolean;
  error?: string;
}
