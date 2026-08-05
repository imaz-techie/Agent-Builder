import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getHealth } from "../controllers/health.controller";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System health check endpoint
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Health status details
 */
router.get("/health", asyncHandler(getHealth));

export default router;
