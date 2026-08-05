import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  addUrlSourceSchema,
  knowledgeQuerySchema,
  searchChunksSchema,
} from "../validators/knowledge.validator";
import {
  uploadKnowledgeFile,
  addUrlSource,
  getWorkspaceKnowledgeFiles,
  getFileDetails,
  reindexFile,
  deleteFile,
  searchChunks,
} from "../controllers/knowledge.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/knowledge/upload:
 *   post:
 *     summary: Upload and index document file (PDF, DOCX, TXT, CSV, JSON, Markdown)
 *     tags:
 *       - Knowledge Base
 */
router.post(
  "/workspaces/:id/knowledge/upload",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  upload.single("file"),
  asyncHandler(uploadKnowledgeFile)
);

/**
 * @openapi
 * /workspaces/{id}/knowledge/url:
 *   post:
 *     summary: Ingest web URL document source
 *     tags:
 *       - Knowledge Base
 */
router.post(
  "/workspaces/:id/knowledge/url",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(addUrlSourceSchema),
  asyncHandler(addUrlSource)
);

/**
 * @openapi
 * /workspaces/{id}/knowledge:
 *   get:
 *     summary: List, search, and filter workspace knowledge files
 *     tags:
 *       - Knowledge Base
 */
router.get(
  "/workspaces/:id/knowledge",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(knowledgeQuerySchema),
  asyncHandler(getWorkspaceKnowledgeFiles)
);

/**
 * @openapi
 * /workspaces/{id}/knowledge/search:
 *   get:
 *     summary: Text similarity search across document chunks
 *     tags:
 *       - Knowledge Base
 */
router.get(
  "/workspaces/:id/knowledge/search",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(searchChunksSchema),
  asyncHandler(searchChunks)
);

/**
 * @openapi
 * /workspaces/{id}/knowledge/{fileId}:
 *   get:
 *     summary: Get document details and indexed chunks
 *   delete:
 *     summary: Delete document and stored chunks
 */
router.get(
  "/workspaces/:id/knowledge/:fileId",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getFileDetails)
);

router.delete(
  "/workspaces/:id/knowledge/:fileId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(deleteFile)
);

/**
 * @openapi
 * /workspaces/{id}/knowledge/{fileId}/reindex:
 *   post:
 *     summary: Reindex document content and regenerate chunks
 *     tags:
 *       - Knowledge Base
 */
router.post(
  "/workspaces/:id/knowledge/:fileId/reindex",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(reindexFile)
);

export default router;
