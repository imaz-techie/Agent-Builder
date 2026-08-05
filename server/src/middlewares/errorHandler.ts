import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { logger } from "../utils/logger";
import {
  isDbConnectionError,
  logDbUnavailableOnce,
} from "../database";

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (isDbConnectionError(err)) {
    logDbUnavailableOnce();
    return res.status(503).json({
      success: false,
      message:
        "Database is currently unavailable. Please try again once PostgreSQL is reachable.",
      errors: [],
    });
  }

  // Malformed JSON request bodies (body-parser SyntaxError) are client errors.
  const isJsonParseError =
    err instanceof SyntaxError &&
    (err as Error & { type?: string; status?: number }).type ===
      "entity.parse.failed" &&
    (err as Error & { type?: string; status?: number }).status === 400;

  if (isJsonParseError) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
      errors: [],
    });
  }

  // Expected client errors (validation, auth, forbidden, 404, rate-limit) are
  // handled responses, not server failures - keep them out of the error logs.
  const isClientError = err instanceof ApiError && err.statusCode < 500;

  if (!isClientError) {
    logger.error(`[Error] ${req.method} ${req.url}: ${err.message}`, {
      stack: err.stack,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Fallback for unhandled internal server errors
  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Something went wrong",
    errors: [],
  });
}
