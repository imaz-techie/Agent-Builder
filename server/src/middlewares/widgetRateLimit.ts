import rateLimit from "express-rate-limit";

export const widgetRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many widget requests from this IP, please try again later",
    errors: [],
  },
});
