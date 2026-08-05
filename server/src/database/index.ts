import { Prisma, PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export let isDbConnected = false;

let dbUnavailableLogged = false;

export function isDbConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1000", "P1001", "P1002", "P1003"].includes(error.code);
  }
  return (
    error instanceof Error &&
    /Can't reach database server|Connection refused|ECONNREFUSED|ENOTFOUND/.test(
      error.message
    )
  );
}

export function logDbUnavailableOnce(): void {
  if (!dbUnavailableLogged) {
    dbUnavailableLogged = true;
    logger.warn(
      "⚠️ Database offline: requests that require the database will return 503 until PostgreSQL is reachable."
    );
  }
}

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: [],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    isDbConnected = true;
    dbUnavailableLogged = false;
    logger.info("Successfully connected to PostgreSQL database via Prisma");
  } catch (error) {
    isDbConnected = false;
    logger.info(
      "ℹ️ Database notice: PostgreSQL server at localhost:5432 is currently offline. Backend running in standalone API mode."
    );
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
  } catch {
    // Silent disconnect handle
  }
}
