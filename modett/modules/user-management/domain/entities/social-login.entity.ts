import { UserId } from "../value-objects/user-id.vo";

export class SocialLogin {
  private constructor(
    private readonly id: string,
    private readonly userId: UserId,
    private provider: SocialProvider,
    private providerUserId: string,
    private providerEmail: string | null,
    private providerDisplayName: string | null,
    private providerAvatarUrl: string | null,
    private accessToken: string | null,
    private refreshToken: string | null,
    private tokenExpiresAt: Date | null,
    private isActive: boolean,
    private metadata: SocialLoginMetadata,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  // Factory methods
  static create(data: CreateSocialLoginData): SocialLogin {
    const socialLoginId = crypto.randomUUID();
    const userId = UserId.fromString(data.userId);
    const now = new Date();

    return new SocialLogin(
      socialLoginId,
      userId,
      data.provider,
      data.providerUserId,
      data.providerEmail || null,
      data.providerDisplayName || null,
      data.providerAvatarUrl || null,
      data.accessToken || null,
      data.refreshToken || null,
      data.tokenExpiresAt || null,
      true, // Active by default
      data.metadata || {},
      now,
      now
    );
  }

  static reconstitute(data: SocialLoginEntityData): SocialLogin {
    return new SocialLogin(
      data.id,
      UserId.fromString(data.userId),
      data.provider,
      data.providerUserId,
      data.providerEmail,
      data.providerDisplayName,
      data.providerAvatarUrl,
      data.accessToken,
      data.refreshToken,
      data.tokenExpiresAt,
      data.isActive,
      data.metadata,
      data.createdAt,
      data.updatedAt
    );
  }

  // Getters
  getId(): string {
    return this.id;
  }
  getUserId(): UserId {
    return this.userId;
  }
  getProvider(): SocialProvider {
    return this.provider;
  }
  getProviderUserId(): string {
    return this.providerUserId;
  }
  getProviderEmail(): string | null {
    return this.providerEmail;
  }
  getProviderDisplayName(): string | null {
    return this.providerDisplayName;
  }
  getProviderAvatarUrl(): string | null {
    return this.providerAvatarUrl;
  }
  getAccessToken(): string | null {
    return this.accessToken;
  }
  getRefreshToken(): string | null {
    return this.refreshToken;
  }
  getTokenExpiresAt(): Date | null {
    return this.tokenExpiresAt;
  }
  getIsActive(): boolean {
    return this.isActive;
  }
  getMetadata(): SocialLoginMetadata {
    return this.metadata;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business logic methods
  updateTokens(tokens: TokenUpdateData): void {
    let hasChanges = false;

    if (tokens.accessToken && tokens.accessToken !== this.accessToken) {
      this.accessToken = tokens.accessToken;
      hasChanges = true;
    }

    if (tokens.refreshToken && tokens.refreshToken !== this.refreshToken) {
      this.refreshToken = tokens.refreshToken;
      hasChanges = true;
    }

    if (tokens.expiresAt &&
        (!this.tokenExpiresAt || tokens.expiresAt.getTime() !== this.tokenExpiresAt.getTime())) {
      this.tokenExpiresAt = tokens.expiresAt;
      hasChanges = true;
    }

    if (hasChanges) {
      this.touch();
    }
  }

  updateProfile(profile: ProfileUpdateData): void {
    let hasChanges = false;

    if (profile.email !== undefined && profile.email !== this.providerEmail) {
      this.providerEmail = profile.email;
      hasChanges = true;
    }

    if (profile.displayName !== undefined && profile.displayName !== this.providerDisplayName) {
      this.providerDisplayName = profile.displayName;
      hasChanges = true;
    }

    if (profile.avatarUrl !== undefined && profile.avatarUrl !== this.providerAvatarUrl) {
      this.providerAvatarUrl = profile.avatarUrl;
      hasChanges = true;
    }

    if (hasChanges) {
      this.touch();
    }
  }

  updateMetadata(newMetadata: Partial<SocialLoginMetadata>): void {
    const updatedMetadata = { ...this.metadata, ...newMetadata };

    if (JSON.stringify(updatedMetadata) !== JSON.stringify(this.metadata)) {
      this.metadata = updatedMetadata;
      this.touch();
    }
  }

  activate(): void {
    if (this.isActive) {
      return; // Already active
    }

    this.isActive = true;
    this.touch();
  }

  deactivate(): void {
    if (!this.isActive) {
      return; // Already inactive
    }

    this.isActive = false;
    this.touch();
  }

  revokeTokens(): void {
    let hasChanges = false;

    if (this.accessToken) {
      this.accessToken = null;
      hasChanges = true;
    }

    if (this.refreshToken) {
      this.refreshToken = null;
      hasChanges = true;
    }

    if (this.tokenExpiresAt) {
      this.tokenExpiresAt = null;
      hasChanges = true;
    }

    if (hasChanges) {
      this.touch();
    }
  }

  // Validation methods
  hasValidTokens(): boolean {
    if (!this.accessToken) {
      return false;
    }

    if (this.tokenExpiresAt && this.tokenExpiresAt <= new Date()) {
      return false;
    }

    return true;
  }

  isTokenExpired(): boolean {
    if (!this.tokenExpiresAt) {
      return false; // No expiry set, assume valid
    }

    return this.tokenExpiresAt <= new Date();
  }

  isTokenExpiringSoon(minutesAhead: number = 30): boolean {
    if (!this.tokenExpiresAt) {
      return false;
    }

    const expiryThreshold = new Date(Date.now() + (minutesAhead * 60 * 1000));
    return this.tokenExpiresAt <= expiryThreshold;
  }

  canRefreshToken(): boolean {
    return !!this.refreshToken && this.isActive;
  }

  belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  canBeUsedForAuthentication(): boolean {
    return this.isActive && (this.hasValidTokens() || this.canRefreshToken());
  }

  canBeDeleted(): boolean {
    // Business rule: Social logins can always be deleted
    // The application should handle ensuring at least one login method remains
    return true;
  }

  // Provider-specific methods
  getProviderDisplayInfo(): ProviderDisplayInfo {
    return {
      provider: this.provider,
      displayName: this.getDisplayName(),
      avatarUrl: this.providerAvatarUrl,
      email: this.providerEmail,
      isConnected: this.isActive && this.hasValidTokens(),
    };
  }

  getDisplayName(): string {
    if (this.providerDisplayName) {
      return this.providerDisplayName;
    }

    if (this.providerEmail) {
      return this.providerEmail;
    }

    return `${this.provider} User (${this.providerUserId.substring(0, 8)}...)`;
  }

  getProviderSpecificData(): Record<string, any> {
    const baseData = {
      provider: this.provider,
      providerId: this.providerUserId,
      email: this.providerEmail,
      displayName: this.providerDisplayName,
      avatarUrl: this.providerAvatarUrl,
    };

    // Add provider-specific metadata
    switch (this.provider) {
      case SocialProvider.GOOGLE:
        return {
          ...baseData,
          googleId: this.providerUserId,
          verified: this.metadata.emailVerified || false,
          locale: this.metadata.locale,
        };

      case SocialProvider.FACEBOOK:
        return {
          ...baseData,
          facebookId: this.providerUserId,
          locale: this.metadata.locale,
          timezone: this.metadata.timezone,
        };

      case SocialProvider.APPLE:
        return {
          ...baseData,
          appleId: this.providerUserId,
          realUserStatus: this.metadata.realUserStatus,
        };

      case SocialProvider.TWITTER:
        return {
          ...baseData,
          twitterId: this.providerUserId,
          username: this.metadata.username,
          verified: this.metadata.verified || false,
        };

      default:
        return baseData;
    }
  }

  // Token management methods
  getTokenInfo(): TokenInfo | null {
    if (!this.accessToken) {
      return null;
    }

    return {
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      expiresAt: this.tokenExpiresAt,
      isExpired: this.isTokenExpired(),
      isExpiringSoon: this.isTokenExpiringSoon(),
      canRefresh: this.canRefreshToken(),
    };
  }

  // Security methods
  maskSensitiveData(): Partial<SocialLoginEntityData> {
    return {
      id: this.id,
      userId: this.userId.getValue(),
      provider: this.provider,
      providerUserId: this.providerUserId,
      providerEmail: this.providerEmail,
      providerDisplayName: this.providerDisplayName,
      providerAvatarUrl: this.providerAvatarUrl,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      // Intentionally exclude tokens and sensitive metadata
      metadata: {
        locale: this.metadata.locale,
        timezone: this.metadata.timezone,
        // Exclude sensitive fields like real_user_status, etc.
      },
    };
  }

  // OAuth flow helpers
  isFromOAuthFlow(): boolean {
    return !!this.accessToken;
  }

  requiresReauthorization(): boolean {
    return !this.isActive || this.isTokenExpired() && !this.canRefreshToken();
  }

  // Internal methods
  private touch(): void {
    this.updatedAt = new Date();
  }

  // Convert to data for persistence
  toData(): SocialLoginEntityData {
    return {
      id: this.id,
      userId: this.userId.getValue(),
      provider: this.provider,
      providerUserId: this.providerUserId,
      providerEmail: this.providerEmail,
      providerDisplayName: this.providerDisplayName,
      providerAvatarUrl: this.providerAvatarUrl,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiresAt: this.tokenExpiresAt,
      isActive: this.isActive,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  equals(other: SocialLogin): boolean {
    return this.id === other.id;
  }

  // For finding duplicate connections
  isSameProviderConnection(provider: SocialProvider, providerUserId: string): boolean {
    return this.provider === provider && this.providerUserId === providerUserId;
  }
}

// Supporting types and enums
export enum SocialProvider {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  APPLE = "apple",
  TWITTER = "twitter",
  LINKEDIN = "linkedin",
  GITHUB = "github",
  MICROSOFT = "microsoft",
}

export interface SocialLoginMetadata {
  locale?: string;
  timezone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  realUserStatus?: string; // Apple-specific
  username?: string; // Twitter/GitHub-specific
  verified?: boolean; // Twitter-specific
  profileUrl?: string;
  [key: string]: any;
}

export interface CreateSocialLoginData {
  userId: string;
  provider: SocialProvider;
  providerUserId: string;
  providerEmail?: string;
  providerDisplayName?: string;
  providerAvatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  metadata?: SocialLoginMetadata;
}

export interface SocialLoginEntityData {
  id: string;
  userId: string;
  provider: SocialProvider;
  providerUserId: string;
  providerEmail: string | null;
  providerDisplayName: string | null;
  providerAvatarUrl: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  isActive: boolean;
  metadata: SocialLoginMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenUpdateData {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface ProfileUpdateData {
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface ProviderDisplayInfo {
  provider: SocialProvider;
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  isConnected: boolean;
}

export interface TokenInfo {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  expiresAt: Date | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  canRefresh: boolean;
}