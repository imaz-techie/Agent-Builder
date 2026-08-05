import { Router } from "express";
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
import {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  me,
} from "../controllers/auth.controller";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user and create default workspace
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post("/auth/register", validate(registerSchema), asyncHandler(register));

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user credentials and return tokens
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/auth/login", validate(loginSchema), asyncHandler(login));

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user and invalidate refresh token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/auth/logout", validate(refreshTokenSchema), asyncHandler(logout));

/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Exchange refresh token for new access and refresh token pair
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 */
router.post("/auth/refresh-token", validate(refreshTokenSchema), asyncHandler(refreshTokens));

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset link/token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Reset link sent message
 */
router.post("/auth/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPassword));

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post("/auth/reset-password", validate(resetPasswordSchema), asyncHandler(resetPassword));

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 */
router.get("/auth/me", authenticate, asyncHandler(me));

export default router;
