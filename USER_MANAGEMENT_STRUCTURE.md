# User Management Module - Project Structure

## 🏗️ Architecture Overview

**Module**: User Management & Authentication  
**Database**: PostgreSQL with Prisma ORM  
**Framework**: Fastify (TypeScript)  
**Patterns**: Clean Architecture, Domain-Driven Design, CQRS

---

## 📁 User Management Module Structure

```
modett-ecommerce-platform/
├── README.md
├── package.json
├── tsconfig.json
├── .env
├── .env.example
├── .gitignore
└── modett/
    ├── prisma/
    │   ├── schema.prisma              # User-focused database schema
    │   ├── seed.ts                    # User data seeding
    │   └── migrations/                # User table migrations
    │
    ├── modules/
    │   ├── common/
    │   │   └── infra/
    │   │       └── db/
    │   │           └── client.ts      # Shared Prisma Client
    │   │
    │   └── user-management/           # 👤 USER MANAGEMENT MODULE
    │       ├── domain/                # 🧠 Business Logic Layer
    │       │   ├── entities/
    │       │   │   ├── user.entity.ts           # Core User business entity
    │       │   │   ├── user-profile.entity.ts   # User profile entity
    │       │   │   ├── social-login.entity.ts   # Social auth entity
    │       │   │   ├── address.entity.ts        # User address entity
    │       │   │   └── payment-method.entity.ts # Payment method entity
    │       │   ├── value-objects/
    │       │   │   ├── password.vo.ts           # Password validation object
    │       │   │   ├── email.vo.ts              # Email validation object
    │       │   │   └── phone.vo.ts              # Phone validation object
    │       │   └── repositories/                # Repository interfaces
    │       │       ├── iuser.repository.ts
    │       │       ├── iuser-profile.repository.ts
    │       │       ├── iaddress.repository.ts
    │       │       └── ipayment-method.repository.ts
    │       │
    │       ├── application/           # 🔄 Use Cases & Business Rules
    │       │   ├── commands/          # Write operations (CQRS)
    │       │   │   ├── create-user.command.ts
    │       │   │   ├── update-user.command.ts
    │       │   │   ├── delete-user.command.ts
    │       │   │   ├── activate-user.command.ts
    │       │   │   ├── deactivate-user.command.ts
    │       │   │   ├── change-password.command.ts
    │       │   │   ├── create-user-profile.command.ts
    │       │   │   ├── update-user-profile.command.ts
    │       │   │   ├── add-social-login.command.ts
    │       │   │   ├── remove-social-login.command.ts
    │       │   │   ├── add-address.command.ts
    │       │   │   ├── update-address.command.ts
    │       │   │   ├── delete-address.command.ts
    │       │   │   ├── set-default-address.command.ts
    │       │   │   ├── add-payment-method.command.ts
    │       │   │   ├── update-payment-method.command.ts
    │       │   │   ├── delete-payment-method.command.ts
    │       │   │   └── set-default-payment-method.command.ts
    │       │   ├── queries/           # Read operations (CQRS)
    │       │   │   ├── get-user.query.ts
    │       │   │   ├── get-user-by-email.query.ts
    │       │   │   ├── get-user-profile.query.ts
    │       │   │   ├── list-users.query.ts
    │       │   │   ├── search-users.query.ts
    │       │   │   ├── get-user-addresses.query.ts
    │       │   │   ├── get-default-address.query.ts
    │       │   │   ├── get-user-payment-methods.query.ts
    │       │   │   ├── get-default-payment-method.query.ts
    │       │   │   ├── get-social-logins.query.ts
    │       │   │   └── verify-user-credentials.query.ts
    │       │   ├── handlers/          # Command & Query handlers
    │       │   │   ├── command-handlers/
    │       │   │   │   ├── create-user.handler.ts
    │       │   │   │   ├── update-user.handler.ts
    │       │   │   │   ├── delete-user.handler.ts
    │       │   │   │   ├── change-password.handler.ts
    │       │   │   │   ├── user-profile.handler.ts
    │       │   │   │   ├── social-login.handler.ts
    │       │   │   │   ├── address.handler.ts
    │       │   │   │   └── payment-method.handler.ts
    │       │   │   └── query-handlers/
    │       │   │       ├── get-user.handler.ts
    │       │   │       ├── list-users.handler.ts
    │       │   │       ├── search-users.handler.ts
    │       │   │       ├── get-user-profile.handler.ts
    │       │   │       ├── get-addresses.handler.ts
    │       │   │       ├── get-payment-methods.handler.ts
    │       │   │       ├── get-social-logins.handler.ts
    │       │   │       └── verify-credentials.handler.ts
    │       │   ├── services/          # Domain services
    │       │   │   ├── auth.service.ts
    │       │   │   ├── password.service.ts
    │       │   │   ├── user-validation.service.ts
    │       │   │   └── social-auth.service.ts
    │       │   └── dto/               # Data Transfer Objects
    │       │       ├── auth/
    │       │       │   ├── login.dto.ts
    │       │       │   ├── register.dto.ts
    │       │       │   ├── change-password.dto.ts
    │       │       │   └── reset-password.dto.ts
    │       │       ├── user/
    │       │       │   ├── create-user.dto.ts
    │       │       │   ├── update-user.dto.ts
    │       │       │   ├── user-response.dto.ts
    │       │       │   └── user-list.dto.ts
    │       │       ├── profile/
    │       │       │   ├── create-user-profile.dto.ts
    │       │       │   ├── update-user-profile.dto.ts
    │       │       │   └── user-profile-response.dto.ts
    │       │       ├── social/
    │       │       │   ├── social-login.dto.ts
    │       │       │   ├── oauth-callback.dto.ts
    │       │       │   └── social-auth-response.dto.ts
    │       │       ├── address/
    │       │       │   ├── create-address.dto.ts
    │       │       │   ├── update-address.dto.ts
    │       │       │   └── address-response.dto.ts
    │       │       └── payment/
    │       │           ├── add-payment-method.dto.ts
    │       │           ├── update-payment-method.dto.ts
    │       │           └── payment-method-response.dto.ts
    │       │
    │       └── infra/                 # 🔧 Infrastructure Layer
    │           ├── persistence/       # Database implementations
    │           │   ├── user.repository.ts
    │           │   ├── user-profile.repository.ts
    │           │   ├── address.repository.ts
    │           │   └── payment-method.repository.ts
    │           ├── controllers/       # HTTP endpoints
    │           │   ├── auth.controller.ts
    │           │   ├── user.controller.ts
    │           │   ├── user-profile.controller.ts
    │           │   ├── address.controller.ts
    │           │   ├── payment-method.controller.ts
    │           │   └── social-auth.controller.ts
    │           ├── middleware/        # User-specific middleware
    │           │   ├── auth.middleware.ts
    │           │   ├── role.middleware.ts
    │           │   └── user-validation.middleware.ts
    │           └── providers/         # External service integrations
    │               ├── oauth/
    │               │   ├── google.provider.ts
    │               │   ├── facebook.provider.ts
    │               │   └── apple.provider.ts
    │               ├── email/
    │               │   └── email.provider.ts
    │               └── sms/
    │                   └── sms.provider.ts
    │
    ├── src/                          # 🚀 Main Application
    │   ├── main.ts                   # Application entry point
    │   ├── app.ts                    # Fastify app setup
    │   ├── server.ts                 # Server configuration
    │   ├── routes/                   # User-related routes
    │   │   ├── index.ts
    │   │   ├── auth.routes.ts
    │   │   ├── user.routes.ts
    │   │   ├── profile.routes.ts
    │   │   ├── address.routes.ts
    │   │   ├── payment-method.routes.ts
    │   │   └── social-auth.routes.ts
    │   ├── middleware/               # Global middleware
    │   │   ├── auth.middleware.ts
    │   │   ├── validation.middleware.ts
    │   │   ├── logging.middleware.ts
    │   │   └── error.middleware.ts
    │   └── plugins/                  # Fastify plugins
    │       ├── cors.plugin.ts
    │       ├── helmet.plugin.ts
    │       ├── swagger.plugin.ts
    │       └── rate-limit.plugin.ts
    │
    └── scripts/                      # 🛠️ Development Scripts
        ├── dev.sh                    # Development startup
        ├── build.sh                  # Production build
        ├── migrate.ts                # Database migration
        └── seed.ts                   # User data seeding
```

---

## 🎯 User Management Features

### **🔐 Authentication & Authorization**

- ✅ User registration with email verification
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Password reset functionality
- ✅ Role-based access control (admin, customer)
- ✅ Account activation/deactivation
- ✅ Session management

### **👤 User Profile Management**

- ✅ Extended user profiles with personal information
- ✅ Profile picture upload and management
- ✅ Personal preferences storage (JSON)
- ✅ Contact information management
- ✅ Account settings and privacy controls

### **🌐 Social Authentication**

- ✅ Google OAuth integration
- ✅ Facebook OAuth integration
- ✅ Apple Sign-In integration
- ✅ Multiple social accounts per user
- ✅ Account linking and unlinking
- ✅ Social profile data synchronization

### **📍 Address Management**

- ✅ Multiple addresses per user
- ✅ Address types (shipping, billing)
- ✅ Default address selection
- ✅ Address validation
- ✅ International address support

### **💳 Payment Method Management**

- ✅ Multiple payment methods per user
- ✅ Secure payment data storage
- ✅ Default payment method selection
- ✅ Payment method validation
- ✅ Integration with payment providers

---

## 📊 Database Schema (User Module)

### **Core User Tables**

```sql
-- Users table
CREATE TABLE users (
    id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR UNIQUE NOT NULL,
    password    VARCHAR NOT NULL,
    name        VARCHAR NOT NULL,
    role        VARCHAR DEFAULT 'customer',
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMP DEFAULT now(),
    updated_at  TIMESTAMP DEFAULT now()
);

-- User profiles table
CREATE TABLE user_profiles (
    id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     VARCHAR UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name  VARCHAR,
    last_name   VARCHAR,
    phone       VARCHAR,
    birth_date  TIMESTAMP,
    gender      VARCHAR,
    preferences JSON,
    avatar      VARCHAR,
    created_at  TIMESTAMP DEFAULT now(),
    updated_at  TIMESTAMP DEFAULT now()
);

-- Social logins table
CREATE TABLE social_logins (
    id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    provider    VARCHAR NOT NULL, -- google, facebook, apple
    provider_id VARCHAR NOT NULL,
    email       VARCHAR,
    name        VARCHAR,
    created_at  TIMESTAMP DEFAULT now(),
    UNIQUE(provider, provider_id)
);

-- Addresses table
CREATE TABLE addresses (
    id          VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR DEFAULT 'shipping', -- shipping, billing
    name        VARCHAR,
    street      VARCHAR NOT NULL,
    city        VARCHAR NOT NULL,
    state       VARCHAR NOT NULL,
    zip         VARCHAR NOT NULL,
    country     VARCHAR NOT NULL,
    is_default  BOOLEAN DEFAULT false,
    created_at  TIMESTAMP DEFAULT now(),
    updated_at  TIMESTAMP DEFAULT now()
);

-- Payment methods table
CREATE TABLE payment_methods (
    id           VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      VARCHAR REFERENCES users(id) ON DELETE CASCADE,
    type         VARCHAR NOT NULL, -- card, paypal, bank_transfer
    provider     VARCHAR NOT NULL, -- stripe, paypal, razorpay
    last4        VARCHAR,
    brand        VARCHAR,
    expiry_month INTEGER,
    expiry_year  INTEGER,
    is_default   BOOLEAN DEFAULT false,
    metadata     JSON,
    created_at   TIMESTAMP DEFAULT now(),
    updated_at   TIMESTAMP DEFAULT now()
);
```

---

## 🛠️ Technology Stack

### **Core Technologies**

- **Fastify**: High-performance web framework
- **TypeScript**: Type-safe development
- **Prisma**: Modern database toolkit and ORM
- **PostgreSQL**: Primary database
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

### **Development Tools**

- **Zod**: Runtime type validation
- **Pino**: High-performance logging
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting

### **External Integrations**

- **OAuth Providers**: Google, Facebook, Apple
- **Email Service**: SendGrid/AWS SES
- **SMS Service**: Twilio/AWS SNS

---

## 🚀 API Endpoints

### **Authentication Routes**

```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
POST   /api/auth/refresh           # Refresh JWT token
POST   /api/auth/forgot-password   # Password reset request
POST   /api/auth/reset-password    # Password reset confirmation
POST   /api/auth/change-password   # Change password
```

### **User Management Routes**

```
GET    /api/users                  # List users (admin)
GET    /api/users/:id              # Get user details
PUT    /api/users/:id              # Update user
DELETE /api/users/:id              # Delete user
POST   /api/users/:id/activate     # Activate user
POST   /api/users/:id/deactivate   # Deactivate user
```

### **User Profile Routes**

```
GET    /api/users/:id/profile      # Get user profile
POST   /api/users/:id/profile      # Create user profile
PUT    /api/users/:id/profile      # Update user profile
DELETE /api/users/:id/profile      # Delete user profile
POST   /api/users/:id/avatar       # Upload profile picture
```

### **Social Authentication Routes**

```
GET    /api/auth/google            # Google OAuth login
GET    /api/auth/google/callback   # Google OAuth callback
GET    /api/auth/facebook          # Facebook OAuth login
GET    /api/auth/facebook/callback # Facebook OAuth callback
GET    /api/auth/apple             # Apple Sign-In
GET    /api/auth/apple/callback    # Apple Sign-In callback
```

### **Address Management Routes**

```
GET    /api/users/:id/addresses         # Get user addresses
POST   /api/users/:id/addresses         # Add new address
PUT    /api/users/:id/addresses/:id     # Update address
DELETE /api/users/:id/addresses/:id     # Delete address
POST   /api/users/:id/addresses/:id/default # Set default address
```

### **Payment Method Routes**

```
GET    /api/users/:id/payment-methods         # Get payment methods
POST   /api/users/:id/payment-methods         # Add payment method
PUT    /api/users/:id/payment-methods/:id     # Update payment method
DELETE /api/users/:id/payment-methods/:id     # Delete payment method
POST   /api/users/:id/payment-methods/:id/default # Set default payment
```

---

## 🔧 Getting Started

### **Prerequisites**

- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (for sessions)

### **Installation**

```bash
# Clone repository
git clone https://github.com/Modett/modett-ecommerce-platform.git
cd modett-ecommerce-platform

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed

# Start development server
npm run dev
```

### **Environment Variables**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/modett_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRE="7d"

# OAuth (Google)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OAuth (Facebook)
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"

# OAuth (Apple)
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_TEAM_ID="your-apple-team-id"
APPLE_KEY_ID="your-apple-key-id"
APPLE_PRIVATE_KEY="your-apple-private-key"
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test -- user.service.test.ts

# Run tests in watch mode
npm run test:watch
```

---

## 📈 Security Features

### **Authentication Security**

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT token with expiration
- ✅ Refresh token rotation
- ✅ Rate limiting on auth endpoints
- ✅ Account lockout after failed attempts

### **Data Security**

- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure headers with Helmet

### **OAuth Security**

- ✅ State parameter validation
- ✅ PKCE for mobile apps
- ✅ Secure callback URLs
- ✅ Token validation
- ✅ Account linking security

---

**Module**: User Management  
**Last Updated**: September 15, 2025  
**Version**: 1.0.0  
**Author**: Modett Development Team
