import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  ragQuerySchema,
  generateEmbeddingsSchema,
} from "../validators/rag.validator";
import {
  queryRag,
  generateEmbeddings,
  getRagLogs,
} from "../controllers/rag.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * @openapi
 * /workspaces/{id}/rag/query:
 *   post:
 *     summary: Perform hybrid search RAG context retrieval and generate document citations
 *     tags:
 *       - RAG Engine
 */
router.post(
  "/workspaces/:id/rag/query",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(ragQuerySchema),
  asyncHandler(queryRag)
);

/**
 * @openapi
 * /workspaces/{id}/rag/embeddings:
 *   post:
 *     summary: Generate 1536-dimensional text vector embedding
 *     tags:
 *       - RAG Engine
 */
router.post(
  "/workspaces/:id/rag/embeddings",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  validate(generateEmbeddingsSchema),
  asyncHandler(generateEmbeddings)
);

/**
 * @openapi
 * /workspaces/{id}/rag/logs:
 *   get:
 *     summary: View RAG query history logs and metrics
 *     tags:
 *       - RAG Engine
 */
router.get(
  "/workspaces/:id/rag/logs",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getRagLogs)
);

export default router;
