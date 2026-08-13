# Implementation Plan - Phase 2: Authentication System & RBAC

This plan outlines the implementation of **Phase 2 (Authentication System & Role-Based Access Control)** for the Agent Builder backend using Clean Architecture (Controllers, Services, Repositories, Validators, DTOs, Routes, and Tests).

---

## User Review Required

> [!IMPORTANT]
> - **Prisma Schema Expansion**: Updating `server/prisma/schema.prisma` with models: `User`, `Workspace`, `WorkspaceMember`, `Session`, `RefreshToken`, `PasswordResetToken`, `EmailVerificationToken`, `AuditLog`.
> - **Authentication Flow**: Dual-token architecture (Short-lived Access Token + Long-lived Refresh Token in DB).
> - **RBAC Permissions**: Middlewares `authenticate` and `authorize([Role])` / `requirePermission(...)`.
> - **Frontend Compatibility**: Frontend login and registration pages ([LoginPage.tsx](file:///d:/Imaz/Imaz%20Projects/Agent%20Builder/src/pages/LoginPage.tsx) & [RegisterPage.tsx](file:///d:/Imaz/Imaz%20Projects/Agent%20Builder/src/pages/RegisterPage.tsx)) will remain operational via mock data by default and connect seamlessly to backend REST endpoints when `VITE_USE_API=true`.

---

## Proposed Changes & Clean Architecture Breakdown

### 1. Database & Prisma Schema (`server/prisma/schema.prisma`)
Add complete relational models for Auth & RBAC:
- `User`: Email, hashed password, name, avatarUrl, role enum (`ADMIN`, `DEVELOPER`, `VIEWER`, `WORKSPACE_OWNER`), email verification status.
- `Workspace` & `WorkspaceMember`: Organizational context for multi-tenant users.
- `Session`: Active user logins.
- `RefreshToken`: Stored hashed refresh tokens for secure token rotation.
- `PasswordResetToken`: Hashed reset tokens with expiration timestamps.
- `EmailVerificationToken`: Token for verifying user email.
- `AuditLog`: Action logs for security events.

### 2. Validation Schemas (`server/src/validators/auth.validator.ts`)
Zod validation schemas for:
- `registerSchema`: `email`, `password` (min 8 chars, 1 uppercase, 1 number), `name`.
- `loginSchema`: `email`, `password`.
- `refreshTokenSchema`: `refreshToken`.
- `forgotPasswordSchema`: `email`.
- `resetPasswordSchema`: `token`, `newPassword`.

### 3. DTOs & Interfaces (`server/src/interfaces/auth.interface.ts`)
Type definitions for `RegisterDTO`, `LoginDTO`, `AuthResponse`, `TokenPayload`, `UserResponse`.

### 4. Repository Layer (`server/src/repositories/user.repository.ts`, `auth.repository.ts`)
Database access methods using Prisma:
- `findByEmail`, `findById`, `create`, `update`, `saveRefreshToken`, `deleteRefreshToken`, `createResetToken`, `findResetToken`.

### 5. Service Layer (`server/src/services/auth.service.ts`)
Business logic:
- `register`: Hash password, generate tokens, create user + default workspace.
- `login`: Validate credentials, issue Access & Refresh tokens.
- `logout`: Revoke active refresh tokens.
- `refreshTokens`: Verify refresh token and issue new token pair (rotation).
- `forgotPassword`: Generate password reset token.
- `resetPassword`: Consume token & update password.

### 6. Controller Layer (`server/src/controllers/auth.controller.ts`)
Express request handling for authentication routes.

### 7. Auth & Authorization Middlewares (`server/src/middlewares/auth.middleware.ts`)
- `authenticate`: Extracts Bearer token from header, verifies JWT, attaches `req.user`.
- `authorize(...roles)`: Verifies if `req.user.role` matches allowed roles.

### 8. Routes & OpenAPI Docs (`server/src/routes/auth.routes.ts`)
Exposed REST Endpoints:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/auth/me` (Authenticated profile endpoint)

### 9. Tests (`server/tests/auth.test.ts`)
Integration tests covering registration, login, token refresh, and protected route access.

---

## Verification Plan

### Automated Tests
1. Run `npx prisma generate` in `server/`.
2. Execute Jest test suite: `npm test` verifying `/auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/me`, and 401 unauthorized access checks.
3. Verify `npm run build` compiles cleanly.

### Manual API Verification
- Test registration endpoint returning JWT token payload.
- Test protected `GET /auth/me` endpoint with `Authorization: Bearer <token>`.
