import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getVersion } from "../controllers/version.controller";

const router = Router();

/**
 * @openapi
 * /version:
 *   get:
 *     summary: System version information
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: API version details
 */
router.get("/version", asyncHandler(getVersion));

export default router;
