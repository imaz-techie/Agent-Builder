import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/auth.middleware";
import { requireWorkspaceMember } from "../middlewares/workspace.middleware";
import { WorkspaceRole } from "@prisma/client";
import {
  createSessionSchema,
  sendMessageSchema,
} from "../validators/chat.validator";
import {
  createSession,
  getWorkspaceSessions,
  getSessionMessages,
  sendMessage,
  streamMessage,
} from "../controllers/chat.controller";

const router = Router();

router.use("/workspaces", authenticate);

/**
 * Conversation Sessions
 */
router.post(
  "/workspaces/:id/chat/sessions",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(createSessionSchema),
  asyncHandler(createSession)
);

router.get(
  "/workspaces/:id/chat/sessions",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getWorkspaceSessions)
);

router.get(
  "/workspaces/:id/chat/sessions/:sessionId/messages",
  requireWorkspaceMember(WorkspaceRole.VIEWER),
  asyncHandler(getSessionMessages)
);

/**
 * Chat Messaging Endpoints
 */
router.post(
  "/workspaces/:id/chat/messages",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  validate(sendMessageSchema),
  asyncHandler(sendMessage)
);

router.get(
  "/workspaces/:id/chat/stream",
  requireWorkspaceMember(WorkspaceRole.MEMBER),
  asyncHandler(streamMessage)
);

export default router;
