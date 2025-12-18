// Authentication middleware exports
export * from './auth.middleware';

// Role-based authorization middleware exports
export * from './require-role.middleware';

// Re-export commonly used middleware functions
export {
  createAuthMiddleware,
  authenticateUser,
  optionalAuth,
  authenticateVerifiedUser,
  authenticateWithGuests,
  generateAuthTokens,
  verifyRefreshToken,
  UserRole,
} from './auth.middleware';

export {
  requireRole,
  requireAdmin,
  requireStaffOrAdmin,
  requireVendor,
  requireOwnershipOrAdmin,
  requireOwnershipOrStaff,
  blockRoles,
} from './require-role.middleware';