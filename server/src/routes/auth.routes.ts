import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  me,
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

export default router;
