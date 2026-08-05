import { Response } from "express";

export interface ApiResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export function sendApiResponse<T>({
  res,
  statusCode = 200,
  message = "Success",
  data = {} as T,
  meta = {},
}: ApiResponseOptions<T>) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
}
