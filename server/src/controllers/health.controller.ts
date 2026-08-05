import { Request, Response } from "express";
import { sendApiResponse } from "../utils/apiResponse";
import { prisma, isDbConnected } from "../database";

export async function getHealth(req: Request, res: Response) {
  let dbStatus = "unavailable";
  if (isDbConnected) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch {
      dbStatus = "unavailable";
    }
  }

  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Health check successful",
    data: {
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbStatus,
    },
  });
}
