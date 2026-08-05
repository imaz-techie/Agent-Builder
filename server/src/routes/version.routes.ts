import { Router } from "express";
import { getVersion } from "../controllers/version.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * @openapi
 * /version:
 *   get:
 *     summary: System Version Information
 *     description: Returns API release version, environment mode, and platform details.
 *     tags:
 *       - System Health
 *     responses:
 *       200:
 *         description: API version information retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Version retrieved"
 *               data:
 *                 version: "1.0.0"
 *                 environment: "development"
 *               meta: {}
 */
router.get("/version", asyncHandler(getVersion));

export default router;
