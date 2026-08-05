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
 * Datasets
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
 * Training Jobs
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

router.get(
  "/workspaces/:id/training/jobs/:jobId",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getJobDetails)
);

router.get(
  "/workspaces/:id/training/jobs/:jobId/logs",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getJobLogs)
);

router.post(
  "/workspaces/:id/training/jobs/:jobId/cancel",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(cancelJob)
);

router.post(
  "/workspaces/:id/training/jobs/:jobId/retry",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(retryJob)
);

export default router;
