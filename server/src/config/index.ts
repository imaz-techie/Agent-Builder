import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  jwt: {
    secret: process.env.JWT_SECRET || "default_jwt_secret_key_change_me",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "default_jwt_refresh_secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
  groqApiKey: process.env.GROQ_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
};
