// Controllers
export * from './controllers';

// Middleware
export * from './middleware/auth.middleware';

// Routes
export * from './routes';

// Re-exports for convenience
export { registerUserManagementRoutes } from './routes';

// Type definitions for the module
export interface UserManagementHttpModule {
  registerRoutes: typeof registerUserManagementRoutes;
}

// Default export
const userManagementHttpModule: UserManagementHttpModule = {
  registerRoutes: registerUserManagementRoutes
};

export default userManagementHttpModule;