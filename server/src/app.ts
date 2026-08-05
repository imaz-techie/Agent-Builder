import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config } from "./config";
import { requestLogger } from "./middlewares/requestLogger";
import { globalErrorHandler } from "./middlewares/errorHandler";
import { globalRateLimiter } from "./middlewares/rateLimiter";
import routes from "./routes";
import { setupSwagger } from "./docs/swagger";
import { handleStripeWebhook } from "./controllers/billing.controller";

export function createApp(): Express {
  const app = express();

  // Core Security & Optimization Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging & Rate Limiting
  app.use(requestLogger);
  app.use(globalRateLimiter);

  // Swagger OpenAPI Specs
  setupSwagger(app);

  // Public Stripe Webhook (no auth - signature verified by Stripe in production)
  app.post("/webhooks/stripe", handleStripeWebhook);

  // System Routes (Root level /health and /version)
  app.use("/", routes);

  // API v1 Prefixed Routes
  app.use(config.apiPrefix, routes);

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
      errors: [],
    });
  });

  // Global Error Handler Middleware
  app.use(globalErrorHandler);

  return app;
}
