import { Router } from "express";
import healthRouter from "./health.routes";
import versionRouter from "./version.routes";
import authRouter from "./auth.routes";
import workspaceRouter from "./workspace.routes";
import apiKeyRouter from "./apiKey.routes";
import agentRouter from "./agent.routes";
import knowledgeRouter from "./knowledge.routes";
import trainingRouter from "./training.routes";
import promptRouter from "./prompt.routes";
import llmRouter from "./llm.routes";
import ragRouter from "./rag.routes";
import chatRouter from "./chat.routes";
import analyticsRouter from "./analytics.routes";
import deploymentRouter from "./deployment.routes";
import widgetRouter from "./widget.routes";
import billingRouter from "./billing.routes";
import notificationRouter from "./notification.routes";
import adminRouter from "./admin.routes";

const router = Router();

// Root system endpoints
router.use("/", healthRouter);
router.use("/", versionRouter);

// Authentication Endpoints
router.use("/", authRouter);

// Workspace & Team Management
router.use("/", workspaceRouter);
router.use("/", apiKeyRouter);

// Agent Management
router.use("/", agentRouter);

// Knowledge Base RAG Storage
router.use("/", knowledgeRouter);

// Fine-Tuning Training Pipeline
router.use("/", trainingRouter);

// Prompt Studio & Playground
router.use("/", promptRouter);

// Universal LLM Provider Layer
router.use("/", llmRouter);

// RAG Retrieval Engine & Citation Engine
router.use("/", ragRouter);

// Chat & Agent Execution Engine
router.use("/", chatRouter);

// Analytics System & Audit Telemetry
router.use("/", analyticsRouter);

// Deployment Manager & Embed Widget
router.use("/", deploymentRouter);
router.use("/", widgetRouter);

// Billing & Subscriptions
router.use("/", billingRouter);

// Notifications
router.use("/", notificationRouter);

// Admin Platform Management
router.use("/", adminRouter);

export default router;
