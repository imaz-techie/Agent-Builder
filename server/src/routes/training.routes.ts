import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  createDatasetSchema,
  startTrainingJobSchema,
  trainingQuerySchema,
} from "../validators/training.validator";
import {
  createDataset,
  getWorkspaceDatasets,
  startTrainingJob,
  getWorkspaceJobs,
  getJobDetails,
  getJobLogs,
  cancelJob,
  retryJob,
} from "../controllers/training.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/training/datasets:
 *   post:
 *     summary: Register Fine-Tuning Dataset
 *     tags:
 *       - Training Pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name: { type: "string", example: "Financial Q&A Dataset v1" }
 *               description: { type: "string", example: "1000 fine-tuning prompt-completion pairs" }
 *               version: { type: "string", example: "v1.0" }
 *               sampleCount: { type: "integer", example: 1000 }
 *     responses:
 *       201:
 *         description: Dataset registered
 *   get:
 *     summary: List Workspace Datasets
 *     tags:
 *       - Training Pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Datasets retrieved
 */
router.post(
  "/workspaces/:id/training/datasets",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(createDatasetSchema),
  asyncHandler(createDataset)
);

router.get(
  "/workspaces/:id/training/datasets",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getWorkspaceDatasets)
);

/**
 * @openapi
 * /workspaces/{id}/training/jobs:
 *   post:
 *     summary: Launch Fine-Tuning Training Job
 *     tags:
 *       - Training Pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobName
 *               - agentId
 *             properties:
 *               jobName: { type: "string", example: "Epoch 3 Fine-Tune Run" }
 *               agentId: { type: "string", format: "uuid", example: "11111111-1111-1111-1111-111111111111" }
 *               datasetId: { type: "string", format: "uuid", example: "22222222-2222-2222-2222-222222222222" }
 *               epochs: { type: "integer", example: 3 }
 *               learningRate: { type: "number", example: 0.0001 }
 *               batchSize: { type: "integer", example: 8 }
 *     responses:
 *       201:
 *         description: Training job queued
 *   get:
 *     summary: List Workspace Training Jobs
 *     tags:
 *       - Training Pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Training jobs retrieved
 */
router.post(
  "/workspaces/:id/training/jobs",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(startTrainingJobSchema),
  asyncHandler(startTrainingJob)
);

router.get(
  "/workspaces/:id/training/jobs",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(trainingQuerySchema),
  asyncHandler(getWorkspaceJobs)
);

/**
 * @openapi
 * /workspaces/{id}/training/jobs/{jobId}:
 *   get:
 *     summary: Get Job Details
 *     tags:
 *       - Training Pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Job details retrieved
 */
router.get(
  "/workspaces/:id/training/jobs/:jobId",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getJobDetails)
);

/**
 * @openapi
 * /workspaces/{id}/training/jobs/{jobId}/logs:
 *   get:
 *     summary: Stream Training Job Execution Logs
 *     tags:
 *       - Training Pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Training logs retrieved
 */
router.get(
  "/workspaces/:id/training/jobs/:jobId/logs",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getJobLogs)
);

/**
 * @openapi
 * /workspaces/{id}/training/jobs/{jobId}/cancel:
 *   post:
 *     summary: Cancel Training Job
 *     tags:
 *       - Training Pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Job cancelled
 */
router.post(
  "/workspaces/:id/training/jobs/:jobId/cancel",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(cancelJob)
);

/**
 * @openapi
 * /workspaces/{id}/training/jobs/{jobId}/retry:
 *   post:
 *     summary: Retry Training Job
 *     tags:
 *       - Training Pipeline
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       201:
 *         description: Job re-queued
 */
router.post(
  "/workspaces/:id/training/jobs/:jobId/retry",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(retryJob)
);

export default router;
