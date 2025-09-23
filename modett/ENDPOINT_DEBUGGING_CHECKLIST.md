# User Management Endpoints - Debugging Checklist

## 🔐 Authentication Endpoints (9/9)
- [ ] **POST /auth/register**
  - Breakpoints: routes.ts:120, auth.controller.ts, authentication.service.ts, user.repository.ts
  - Key Learning: Domain object creation, password hashing, database persistence
  - Status: ⏳ Not Started | 🔄 In Progress | ✅ Completed | ❌ Error
  - Notes:

- [ ] **POST /auth/login**
  - Breakpoints: routes.ts:147, auth.controller.ts, authentication.service.ts, user.repository.ts
  - Key Learning: Authentication flow, JWT generation, password verification
  - Status: ⏳ Not Started | 🔄 In Progress | ✅ Completed | ❌ Error
  - Notes:

- [ ] **GET /users/me**
  - Breakpoints: routes.ts:314, auth.middleware.ts, users.controller.ts
  - Key Learning: Middleware authentication, token validation
  - Status: ⏳ Not Started | 🔄 In Progress | ✅ Completed | ❌ Error
  - Notes:

- [ ] **POST /auth/refresh-token**
  - Breakpoints: routes.ts:171, auth.controller.ts, authentication.service.ts
  - Key Learning: Token refresh mechanism
  - Status: ⏳ Not Started | 🔄 In Progress | ✅ Completed | ❌ Error
  - Notes:

- [ ] **POST /auth/change-password**
  - Breakpoints: routes.ts:262, auth.controller.ts, authentication.service.ts
  - Key Learning: Password validation, secure password change
  - Status: ⏳ Not Started | 🔄 In Progress | ✅ Completed | ❌ Error
  - Notes:

- [ ] **POST /auth/forgot-password**
  - Breakpoints: routes.ts:194, auth.controller.ts, authentication.service.ts
  - Key Learning: Password reset flow initiation
  - Status: ⏳ Not Started | 🔄 In Progress | ✅ Completed | ❌ Error
  - Notes:

- [ ] **POST /auth/reset-password**
  - Breakpoints: routes.ts:211, auth.controller.ts, authentication.service.ts
  - Key Learning: Token-based password reset
  - Status: ⏳ Not Started | 🔄 In Progress | ✅ Completed | ❌ Error
  - Notes:

- [ ] **POST /auth/verify-email**
  - Breakpoints: routes.ts:227, auth.controller.ts, verification.service.ts
  - Key Learning: Email verification process
  - Status: ⏳ Not Started | 🔄 In Progress | ✅ Completed | ❌ Error
  - Notes:

- [ ] **POST /auth/logout**
  - Breakpoints: routes.ts:155, auth.controller.ts, authentication.service.ts
  - Key Learning: Session cleanup, token invalidation
  - Status: ⏳ Not Started | 🔄 In Progress | ✅ Completed | ❌ Error
  - Notes:

## 👤 User Management Endpoints (0/2)
- [ ] **GET /users/:userId**
- [ ] **GET /users/me** (already covered above)

## 📝 Profile Management Endpoints (0/4)
- [ ] **GET /profile/me**
- [ ] **PUT /profile/me**
- [ ] **GET /users/:userId/profile**
- [ ] **PUT /users/:userId/profile**

## 🏠 Address Management Endpoints (0/8)
- [ ] **GET /addresses/me**
- [ ] **POST /addresses/me**
- [ ] **PUT /addresses/me/:addressId**
- [ ] **DELETE /addresses/me/:addressId**
- [ ] **GET /users/:userId/addresses**
- [ ] **POST /users/:userId/addresses**
- [ ] **PUT /users/:userId/addresses/:addressId**
- [ ] **DELETE /users/:userId/addresses/:addressId**

## 💳 Payment Method Endpoints (0/8)
- [ ] **GET /payment-methods/me**
- [ ] **POST /payment-methods/me**
- [ ] **PUT /payment-methods/me/:paymentMethodId**
- [ ] **DELETE /payment-methods/me/:paymentMethodId**
- [ ] **GET /users/:userId/payment-methods**
- [ ] **POST /users/:userId/payment-methods**
- [ ] **PUT /users/:userId/payment-methods/:paymentMethodId**
- [ ] **DELETE /users/:userId/payment-methods/:paymentMethodId**

## 🔗 Social Login Endpoints (0/6)
- [ ] **POST /auth/social/login**
- [ ] **GET /auth/social/:provider**
- [ ] **GET /auth/social/:provider/callback**
- [ ] **POST /social-accounts/me/link**
- [ ] **GET /social-accounts/me**
- [ ] **DELETE /social-accounts/me/:socialId**

---

## 📊 Learning Progress
**Total Endpoints**: 37
**Completed**: 0
**In Progress**: 0
**Remaining**: 37

## 🎯 Current Focus
**Phase**: Authentication Endpoints
**Current Endpoint**: POST /auth/register
**Next Steps**: Set breakpoints and test registration flow

## 🔍 Key Discoveries
1.
2.
3.

## ❓ Questions for Research
1.
2.
3.