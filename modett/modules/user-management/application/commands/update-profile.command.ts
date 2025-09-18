import { UserProfileService } from '../services/user-profile.service';
import { ICommand, ICommandHandler, CommandResult } from './register-user.command';

export interface UpdateProfileCommand extends ICommand {
  userId: string;
  defaultAddressId?: string;
  defaultPaymentMethodId?: string;
  preferences?: Record<string, any>;
  locale?: string;
  currency?: string;
  stylePreferences?: Record<string, any>;
  preferredSizes?: Record<string, any>;
}

export interface UpdateProfileResult {
  userId: string;
  updated: boolean;
  message: string;
}

export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand, CommandResult<UpdateProfileResult>> {
  constructor(
    private readonly userProfileService: UserProfileService
  ) {}

  async handle(command: UpdateProfileCommand): Promise<CommandResult<UpdateProfileResult>> {
    try {
      // Validate command
      if (!command.userId) {
        return CommandResult.failure<UpdateProfileResult>(
          'User ID is required',
          ['userId']
        );
      }

      // Update profile through service
      const updatedProfile = await this.userProfileService.updateUserProfile(
        command.userId,
        {
          defaultAddressId: command.defaultAddressId,
          defaultPaymentMethodId: command.defaultPaymentMethodId,
          prefs: command.preferences,
          locale: command.locale,
          currency: command.currency,
          stylePreferences: command.stylePreferences,
          preferredSizes: command.preferredSizes
        }
      );

      const result: UpdateProfileResult = {
        userId: command.userId,
        updated: true,
        message: 'Profile updated successfully'
      };

      return CommandResult.success<UpdateProfileResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<UpdateProfileResult>(
          'Profile update failed',
          [error.message]
        );
      }

      return CommandResult.failure<UpdateProfileResult>(
        'An unexpected error occurred during profile update'
      );
    }
  }
}