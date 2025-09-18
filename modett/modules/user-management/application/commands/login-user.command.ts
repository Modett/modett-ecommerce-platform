import { AuthenticationService, LoginCredentials, AuthResult } from '../services/authentication.service';
import { ICommand, ICommandHandler, CommandResult } from './register-user.command';

export interface LoginUserCommand extends ICommand {
  email: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: {
    userAgent?: string;
    ip?: string;
    fingerprint?: string;
  };
}

export class LoginUserHandler implements ICommandHandler<LoginUserCommand, CommandResult<AuthResult>> {
  constructor(
    private readonly authService: AuthenticationService
  ) {}

  async handle(command: LoginUserCommand): Promise<CommandResult<AuthResult>> {
    try {
      // Validate command
      if (!command.email || !command.password) {
        return CommandResult.failure<AuthResult>(
          'Email and password are required',
          ['email', 'password']
        );
      }

      // Prepare login credentials
      const loginCredentials: LoginCredentials = {
        email: command.email,
        password: command.password
      };

      // Authenticate user through authentication service
      const authResult = await this.authService.login(loginCredentials);

      return CommandResult.success<AuthResult>(authResult);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<AuthResult>(
          'User authentication failed',
          [error.message]
        );
      }

      return CommandResult.failure<AuthResult>(
        'An unexpected error occurred during authentication'
      );
    }
  }
}