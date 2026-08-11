import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  me,
  updateMe,
  changePassword,
  enableTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  getSessions,
  revokeSession,
} from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  enableTwoFactorSchema,
  totpCodeSchema,
} from "../validators/auth.validator";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register New User Account
 *     description: Creates a new user account, provisions a default workspace, and returns JWT access and refresh tokens.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email: { type: "string", format: "email", example: "developer@example.com" }
 *               password: { type: "string", format: "password", example: "SecurePass123!" }
 *               name: { type: "string", example: "Jane Developer" }
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Email already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post("/auth/register", validate(registerSchema), asyncHandler(register));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates user credentials and issues new JWT access and refresh tokens.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email: { type: "string", format: "email", example: "developer@example.com" }
 *               password: { type: "string", format: "password", example: "SecurePass123!" }
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 */
router.post("/auth/login", validate(loginSchema), asyncHandler(login));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: User Logout
 *     description: Revokes active refresh token and terminates session.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 */
router.post("/auth/logout", authenticate, asyncHandler(logout));

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh Access Token
 *     description: Exchange valid refresh token for a fresh JWT access token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1Ni..." }
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.post("/auth/refresh-token", validate(refreshTokenSchema), asyncHandler(refreshTokens));

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request Password Reset
 *     description: Sends password reset instructions token to specified email address.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email: { type: "string", format: "email", example: "developer@example.com" }
 *     responses:
 *       200:
 *         description: Password reset email queued
 */
router.post("/auth/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPassword));

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset User Password
 *     description: Resets account password using valid reset token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token: { type: "string", example: "reset-token-uuid-1234" }
 *               newPassword: { type: "string", format: "password", example: "NewSecurePass123!" }
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post("/auth/reset-password", validate(resetPasswordSchema), asyncHandler(resetPassword));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get Current User Profile
 *     description: Retrieves profile details of currently authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 */
router.get("/auth/me", authenticate, asyncHandler(me));

/**
 * @openapi
 * /auth/me:
 *   patch:
 *     summary: Update Current User Profile
 *     description: Updates name and/or avatar of the currently authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: "string", example: "Jane Developer" }
 *               avatarUrl: { type: "string", example: "https://example.com/avatar.png" }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch("/auth/me", authenticate, validate(updateProfileSchema), asyncHandler(updateMe));

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Change User Password
 *     description: Verifies current password, updates to new password, and revokes all active sessions.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword: { type: "string", example: "OldPass123!" }
 *               newPassword: { type: "string", example: "NewPass456!" }
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post("/auth/change-password", authenticate, validate(changePasswordSchema), asyncHandler(changePassword));

/**
 * @openapi
 * /auth/2fa/enable:
 *   post:
 *     summary: Initialize Two-Factor Authentication
 *     description: Verifies password and returns a TOTP secret + otpauth URL for the authenticator app.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password: { type: "string", example: "SecurePass123!" }
 *     responses:
 *       200:
 *         description: 2FA setup initialized
 */
router.post("/auth/2fa/enable", authenticate, validate(enableTwoFactorSchema), asyncHandler(enableTwoFactor));

/**
 * @openapi
 * /auth/2fa/confirm:
 *   post:
 *     summary: Confirm and Enable Two-Factor Authentication
 *     description: Verifies the TOTP code generated from the setup secret and enables 2FA on the account.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totpCode
 *             properties:
 *               totpCode: { type: "string", example: "123456" }
 *     responses:
 *       200:
 *         description: Two-factor authentication enabled
 */
router.post("/auth/2fa/confirm", authenticate, validate(totpCodeSchema), asyncHandler(confirmTwoFactor));

/**
 * @openapi
 * /auth/2fa/disable:
 *   post:
 *     summary: Disable Two-Factor Authentication
 *     description: Verifies the current TOTP code and disables 2FA on the account.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - totpCode
 *             properties:
 *               totpCode: { type: "string", example: "123456" }
 *     responses:
 *       200:
 *         description: Two-factor authentication disabled
 */
router.post("/auth/2fa/disable", authenticate, validate(totpCodeSchema), asyncHandler(disableTwoFactor));

/**
 * @openapi
 * /auth/sessions:
 *   get:
 *     summary: List Active Login Sessions
 *     description: Returns active sessions (refresh tokens) for the authenticated user.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions retrieved
 */
router.get("/auth/sessions", authenticate, asyncHandler(getSessions));

/**
 * @openapi
 * /auth/sessions/{id}:
 *   delete:
 *     summary: Revoke Login Session
 *     description: Revokes a specific active session, invalidating its refresh token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Session revoked successfully
 */
router.delete("/auth/sessions/:id", authenticate, asyncHandler(revokeSession));

export default router;
