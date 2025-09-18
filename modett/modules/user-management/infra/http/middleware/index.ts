// Authentication middleware exports
export * from './auth.middleware';

// Re-export commonly used middleware functions
export {
  createAuthMiddleware,
  authenticateUser,
  optionalAuth,
  authenticateVerifiedUser,
  authenticateWithGuests,
  authenticateAdmin,
  generateAuthTokens,
  verifyRefreshToken
} from './auth.middleware';