import { Request, Response } from "express";
import { sendApiResponse } from "../utils/apiResponse";
import { config } from "../config";

export function getVersion(req: Request, res: Response) {
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Version check successful",
    data: {
      name: "Agent Builder REST API",
      version: "1.0.0",
      environment: config.env,
      apiPrefix: config.apiPrefix,
    },
  });
}
