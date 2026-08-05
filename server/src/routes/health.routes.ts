import { Router } from "express";
import { getHealth } from "../controllers/health.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: System Health Check
 *     description: Checks operational status of backend API server, database connectivity, and uptime.
 *     tags:
 *       - System Health
 *     responses:
 *       200:
 *         description: Server is healthy and operational
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Health check successful"
 *               data:
 *                 status: "healthy"
 *                 uptime: 124.52
 *                 timestamp: "2026-08-05T12:00:00.000Z"
 *                 database: "connected"
 *               meta: {}
 */
router.get("/health", asyncHandler(getHealth));

export default router;
