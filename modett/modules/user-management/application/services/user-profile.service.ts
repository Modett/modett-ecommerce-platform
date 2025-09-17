import { IUserRepository } from '../../domain/repositories/iuser.repository';
import { IUserProfileRepository } from '../../domain/repositories/iuser-profile.repository';
import { IAddressRepository } from '../../domain/repositories/iaddress.repository';
import { IPaymentMethodRepository } from '../../domain/repositories/ipayment-method.repository';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { UserId } from '../../domain/value-objects/user-id.vo';

export interface UserProfileDto {
  userId: string;
  defaultAddressId?: string;
  defaultPaymentMethodId?: string;
  prefs: Record<string, any>;
  locale?: string;
  currency?: string;
  stylePreferences: Record<string, any>;
  preferredSizes: Record<string, any>;
}

export interface UpdateUserProfileDto {
  defaultAddressId?: string;
  defaultPaymentMethodId?: string;
  prefs?: Record<string, any>;
  locale?: string;
  currency?: string;
  stylePreferences?: Record<string, any>;
  preferredSizes?: Record<string, any>;
}

export interface UserProfileWithDetails {
  profile: UserProfileDto;
  defaultAddress?: {
    id: string;
    type: string;
    addressLine1: string;
    city: string;
    country: string;
    isDefault: boolean;
  };
  defaultPaymentMethod?: {
    id: string;
    type: string;
    brand?: string;
    last4?: string;
    isDefault: boolean;
  };
}

export class UserProfileService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly addressRepository: IAddressRepository,
    private readonly paymentMethodRepository: IPaymentMethodRepository
  ) {}

  async getUserProfile(userId: string): Promise<UserProfileDto | null> {
    const userIdVo = UserId.fromString(userId);

    // Verify user exists
    const user = await this.userRepository.findById(userIdVo);
    if (!user) {
      throw new Error('User not found');
    }

    const profile = await this.userProfileRepository.findByUserId(userIdVo);

    if (!profile) {
      // Create a default profile if none exists
      return this.createDefaultProfile(userId);
    }

    return this.mapToDto(profile);
  }

  async getUserProfileWithDetails(userId: string): Promise<UserProfileWithDetails> {
    const userIdVo = UserId.fromString(userId);

    const profileDto = await this.getUserProfile(userId);
    if (!profileDto) {
      throw new Error('Profile not found');
    }

    const result: UserProfileWithDetails = {
      profile: profileDto,
    };

    // Get default address details
    if (profileDto.defaultAddressId) {
      const address = await this.addressRepository.findById(profileDto.defaultAddressId);
      if (address) {
        const addressData = address.getAddressValue().toData();
        result.defaultAddress = {
          id: address.getId(),
          type: address.getType().toString(),
          addressLine1: addressData.addressLine1,
          city: addressData.city,
          country: addressData.country,
          isDefault: address.getIsDefault(),
        };
      }
    }

    // Get default payment method details
    if (profileDto.defaultPaymentMethodId) {
      const paymentMethod = await this.paymentMethodRepository.findById(profileDto.defaultPaymentMethodId);
      if (paymentMethod) {
        result.defaultPaymentMethod = {
          id: paymentMethod.getId(),
          type: paymentMethod.getType(),
          brand: paymentMethod.getBrand(),
          last4: paymentMethod.getLast4(),
          isDefault: paymentMethod.getIsDefault(),
        };
      }
    }

    return result;
  }

  async updateUserProfile(userId: string, dto: UpdateUserProfileDto): Promise<UserProfileDto> {
    const userIdVo = UserId.fromString(userId);

    // Verify user exists
    const user = await this.userRepository.findById(userIdVo);
    if (!user) {
      throw new Error('User not found');
    }

    let profile = await this.userProfileRepository.findByUserId(userIdVo);

    if (!profile) {
      // Create profile if it doesn't exist
      profile = UserProfile.create({
        userId: userId,
        prefs: dto.prefs || {},
        stylePreferences: dto.stylePreferences || {},
        preferredSizes: dto.preferredSizes || {},
        locale: dto.locale,
        currency: dto.currency,
        defaultAddressId: dto.defaultAddressId,
        defaultPaymentMethodId: dto.defaultPaymentMethodId,
      });

      await this.userProfileRepository.save(profile);
    } else {
      // Update existing profile
      if (dto.defaultAddressId !== undefined) {
        if (dto.defaultAddressId) {
          await this.validateAddressBelongsToUser(dto.defaultAddressId, userIdVo);
          profile.updateDefaultAddress(dto.defaultAddressId);
        } else {
          profile.clearDefaultAddress();
        }
      }

      if (dto.defaultPaymentMethodId !== undefined) {
        if (dto.defaultPaymentMethodId) {
          await this.validatePaymentMethodBelongsToUser(dto.defaultPaymentMethodId, userIdVo);
          profile.updateDefaultPaymentMethod(dto.defaultPaymentMethodId);
        } else {
          profile.clearDefaultPaymentMethod();
        }
      }

      if (dto.prefs !== undefined) {
        profile.updatePreferences(dto.prefs);
      }

      if (dto.locale !== undefined) {
        profile.updateLocale(dto.locale);
      }

      if (dto.currency !== undefined) {
        profile.updateCurrency(dto.currency);
      }

      if (dto.stylePreferences !== undefined) {
        profile.updateStylePreferences(dto.stylePreferences);
      }

      if (dto.preferredSizes !== undefined) {
        profile.updatePreferredSizes(dto.preferredSizes);
      }

      await this.userProfileRepository.update(profile);
    }

    return this.mapToDto(profile);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    const userIdVo = UserId.fromString(userId);

    await this.validateAddressBelongsToUser(addressId, userIdVo);

    let profile = await this.userProfileRepository.findByUserId(userIdVo);

    if (!profile) {
      profile = UserProfile.create({
        userId: userId,
        prefs: {},
        stylePreferences: {},
        preferredSizes: {},
        defaultAddressId: addressId,
      });

      await this.userProfileRepository.save(profile);
    } else {
      profile.updateDefaultAddress(addressId);
      await this.userProfileRepository.update(profile);
    }
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    const userIdVo = UserId.fromString(userId);

    await this.validatePaymentMethodBelongsToUser(paymentMethodId, userIdVo);

    let profile = await this.userProfileRepository.findByUserId(userIdVo);

    if (!profile) {
      profile = UserProfile.create({
        userId: userId,
        prefs: {},
        stylePreferences: {},
        preferredSizes: {},
        defaultPaymentMethodId: paymentMethodId,
      });

      await this.userProfileRepository.save(profile);
    } else {
      profile.updateDefaultPaymentMethod(paymentMethodId);
      await this.userProfileRepository.update(profile);
    }
  }

  async updatePreferences(userId: string, prefs: Record<string, any>): Promise<UserProfileDto> {
    return this.updateUserProfile(userId, { prefs });
  }

  async updateStylePreferences(userId: string, stylePreferences: Record<string, any>): Promise<UserProfileDto> {
    return this.updateUserProfile(userId, { stylePreferences });
  }

  async updatePreferredSizes(userId: string, preferredSizes: Record<string, any>): Promise<UserProfileDto> {
    return this.updateUserProfile(userId, { preferredSizes });
  }

  async updateLocaleAndCurrency(userId: string, locale?: string, currency?: string): Promise<UserProfileDto> {
    return this.updateUserProfile(userId, { locale, currency });
  }

  async deleteUserProfile(userId: string): Promise<void> {
    const userIdVo = UserId.fromString(userId);

    const profile = await this.userProfileRepository.findByUserId(userIdVo);

    if (profile) {
      await this.userProfileRepository.delete(userIdVo);
    }
  }

  async getProfileStatistics(): Promise<{
    totalProfiles: number;
    profilesWithDefaultAddress: number;
    profilesWithDefaultPaymentMethod: number;
    topLocales: Array<{ locale: string; count: number }>;
    topCurrencies: Array<{ currency: string; count: number }>;
  }> {
    // This would typically be implemented as a repository method
    // For now, returning a placeholder
    return {
      totalProfiles: 0,
      profilesWithDefaultAddress: 0,
      profilesWithDefaultPaymentMethod: 0,
      topLocales: [],
      topCurrencies: [],
    };
  }

  async getUserPreference(userId: string, key: string): Promise<any> {
    const profile = await this.getUserProfile(userId);

    if (!profile) {
      return null;
    }

    return profile.prefs[key] || null;
  }

  async setUserPreference(userId: string, key: string, value: any): Promise<void> {
    const profile = await this.getUserProfile(userId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    const updatedPrefs = { ...profile.prefs, [key]: value };

    await this.updateUserProfile(userId, { prefs: updatedPrefs });
  }

  async removeUserPreference(userId: string, key: string): Promise<void> {
    const profile = await this.getUserProfile(userId);

    if (!profile) {
      return;
    }

    const updatedPrefs = { ...profile.prefs };
    delete updatedPrefs[key];

    await this.updateUserProfile(userId, { prefs: updatedPrefs });
  }

  async bulkUpdatePreferences(userId: string, preferences: Record<string, any>): Promise<UserProfileDto> {
    const profile = await this.getUserProfile(userId);

    if (!profile) {
      throw new Error('Profile not found');
    }

    const updatedPrefs = { ...profile.prefs, ...preferences };

    return this.updateUserProfile(userId, { prefs: updatedPrefs });
  }

  private async createDefaultProfile(userId: string): Promise<UserProfileDto> {
    const userIdVo = UserId.fromString(userId);

    const profile = UserProfile.create({
      userId: userId,
      prefs: {},
      stylePreferences: {},
      preferredSizes: {},
    });

    await this.userProfileRepository.save(profile);

    return this.mapToDto(profile);
  }

  private async validateAddressBelongsToUser(addressId: string, userId: UserId): Promise<void> {
    const address = await this.addressRepository.findById(addressId);

    if (!address) {
      throw new Error('Address not found');
    }

    if (!address.belongsToUser(userId)) {
      throw new Error('Address does not belong to user');
    }
  }

  private async validatePaymentMethodBelongsToUser(paymentMethodId: string, userId: UserId): Promise<void> {
    const paymentMethod = await this.paymentMethodRepository.findById(paymentMethodId);

    if (!paymentMethod) {
      throw new Error('Payment method not found');
    }

    if (!paymentMethod.belongsToUser(userId)) {
      throw new Error('Payment method does not belong to user');
    }
  }

  private mapToDto(profile: UserProfile): UserProfileDto {
    return {
      userId: profile.getUserId().getValue(),
      defaultAddressId: profile.getDefaultAddressId(),
      defaultPaymentMethodId: profile.getDefaultPaymentMethodId(),
      prefs: profile.getPrefs(),
      locale: profile.getLocale(),
      currency: profile.getCurrency(),
      stylePreferences: profile.getStylePreferences(),
      preferredSizes: profile.getPreferredSizes(),
    };
  }
}