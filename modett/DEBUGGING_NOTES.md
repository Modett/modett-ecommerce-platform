# User Management Module - Debugging Learning Notes

## 🎯 Debugging Session Progress

### ✅ Completed Endpoints:
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] GET /users/me
- [ ] GET /profile/me
- [ ] POST /addresses/me

### 📝 Key Learnings:

#### Architecture Patterns:
- **Clean Architecture**: Routes → Controllers → Services → Repositories → Database
- **Repository Pattern**: Data access abstraction in `infra/persistence/repositories/`
- **CQRS**: Commands vs Queries separation in `application/commands/` and `application/queries/`

#### Request Flow Understanding:
1. **Route Level**: Fastify schema validation and route binding
2. **Controller Level**: HTTP request/response handling and validation
3. **Service Level**: Business logic orchestration and domain object creation
4. **Repository Level**: Database operations using Prisma ORM

#### Authentication Flow:
- **Token Generation**: JWT creation in AuthenticationService
- **Middleware Processing**: Token validation in auth.middleware.ts
- **User Verification**: Domain validation in User entity and Email/Password value objects

#### Error Handling:
- **Validation Errors**: Schema validation at route level
- **Business Logic Errors**: Domain exceptions in services
- **Database Errors**: Prisma error handling in repositories

### 🔍 Debugging Tips Discovered:
1. Use F11 to step into domain value objects (Email.vo.ts, Password.vo.ts)
2. Watch Variables panel to see domain object transformations
3. Debug Console to inspect Prisma queries: `request.body`, `user.id.value`

### 🎓 Questions for Further Research:
1. How does UserId.fromString() work in address-management.service.ts:145?
2. What's the difference between User entity and UserProfile entity?
3. How does JWT refresh token mechanism work?

## 📊 Session Log Template:

### Session Date: ___________
**Endpoint Tested**:
**Breakpoints Set**:
- File:
- Line:
- Purpose:

**Key Discovery**:
**Next Steps**: