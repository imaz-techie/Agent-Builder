import { createApp } from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";
import { connectDatabase, disconnectDatabase } from "./database";
import { initRealtime } from "./realtime/socket";
import http from "http";

async function startServer() {
  const app = createApp();

  // Attempt database connection asynchronously
  await connectDatabase();

  const server = http.createServer(app);
  const io = initRealtime(server);

  server.listen(config.port, () => {
    logger.info(
      `🚀 Agent Builder Backend API running in [${config.env}] mode on port ${config.port}`
    );
    logger.info(
      `📑 Swagger API Docs available at http://localhost:${config.port}/api-docs`
    );
    logger.info(`⚡ Socket.IO real-time server initialized`);
  });

  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      await io.close();
      logger.info("HTTP server closed.");
      await disconnectDatabase();
      logger.info("Database connection closed. Exiting process.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer().catch((error) => {
  logger.error("Failed to start server:", error);
  process.exit(1);
});
