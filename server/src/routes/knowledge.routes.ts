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
  deleteFile,
  reindexFile,
  searchChunks,
} from "../controllers/knowledge.controller";

const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB limit
const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/knowledge/upload:
 *   post:
 *     summary: Upload Document for RAG Ingestion
 *     tags:
 *       - Knowledge Base RAG
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       201:
 *         description: File uploaded
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
 *     summary: Ingest Web Page URL
 *     tags:
 *       - Knowledge Base RAG
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       201:
 *         description: URL ingested
 */
router.post(
  "/workspaces/:id/knowledge/url",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(addUrlSourceSchema),
  asyncHandler(addUrlSource)
);

/**
 * @openapi
 * /workspaces/{id}/knowledge/files:
 *   get:
 *     summary: List Knowledge Base Files
 *     tags:
 *       - Knowledge Base RAG
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Files retrieved
 */
router.get(
  "/workspaces/:id/knowledge/files",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(knowledgeQuerySchema),
  asyncHandler(getWorkspaceKnowledgeFiles)
);

router.get(
  "/workspaces/:id/knowledge",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(knowledgeQuerySchema),
  asyncHandler(getWorkspaceKnowledgeFiles)
);

/**
 * Search Chunks (Placed BEFORE parametric :fileId route to prevent route collision)
 */
/**
 * @openapi
 * /workspaces/{id}/knowledge/search:
 *   get:
 *     summary: Search Chunks (GET)
 *     tags:
 *       - Knowledge Base RAG
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *       - name: query
 *         in: query
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Search results
 *   post:
 *     summary: Search Chunks (POST)
 *     tags:
 *       - Knowledge Base RAG
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: Search results
 */
router.get(
  "/workspaces/:id/knowledge/search",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(searchChunks)
);

router.post(
  "/workspaces/:id/knowledge/search",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(searchChunksSchema),
  asyncHandler(searchChunks)
);

/**
 * Parametric File Details & Actions
 */
router.get(
  "/workspaces/:id/knowledge/files/:fileId",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getFileDetails)
);

router.get(
  "/workspaces/:id/knowledge/:fileId",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getFileDetails)
);

router.delete(
  "/workspaces/:id/knowledge/files/:fileId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(deleteFile)
);

router.delete(
  "/workspaces/:id/knowledge/:fileId",
  requireWorkspaceMember(WorkspaceRole.ADMIN),
  asyncHandler(deleteFile)
);

router.post(
  "/workspaces/:id/knowledge/files/:fileId/reindex",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(reindexFile)
);

export default router;
