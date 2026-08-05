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
 *     summary: Perform Hybrid RAG Search & Generate Document Citations
 *     description: Combines vector dot product similarity and keyword matching to build LLM context windows with document citations.
 *     tags:
 *       - RAG Engine
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
 *               - query
 *             properties:
 *               query: { type: "string", example: "What is the company refund policy?" }
 *               topK: { type: "integer", example: 3 }
 *               maxTokensContext: { type: "integer", example: 2048 }
 *     responses:
 *       200:
 *         description: RAG context and citations generated
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
 *     summary: Generate 1536-Dimensional Text Vector Embedding
 *     tags:
 *       - RAG Engine
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
 *               - text
 *             properties:
 *               text: { type: "string", example: "Hello Vector Embedding" }
 *     responses:
 *       200:
 *         description: Embedding vector generated
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
 *     summary: List RAG Query History Logs
 *     tags:
 *       - RAG Engine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: "string" }
 *     responses:
 *       200:
 *         description: RAG query logs retrieved
 */
router.get(
  "/workspaces/:id/rag/logs",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getRagLogs)
);

export default router;
