// Import first to ensure availability
import { registerUserManagementRoutes } from './routes';

// Controllers
export * from './controllers';

// Middleware
export * from './middleware/auth.middleware';

// Routes
export * from './routes';

// Re-exports for convenience
export { registerUserManagementRoutes };

// Type definitions for the module
export interface UserManagementHttpModule {
  registerRoutes: typeof registerUserManagementRoutes;
}

// Default export
const userManagementHttpModule: UserManagementHttpModule = {
  registerRoutes: registerUserManagementRoutes
};

export default userManagementHttpModule;