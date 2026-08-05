import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendApiResponse } from "../utils/apiResponse";

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body);
  return sendApiResponse({
    res,
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Login successful",
    data: result,
  });
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Logged out successfully",
    data: {},
  });
}

export async function refreshTokens(req: Request, res: Response) {
  const { refreshToken } = req.body;
  const result = await authService.refreshTokens(refreshToken);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Tokens refreshed successfully",
    data: result,
  });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: result.message,
    data: result.resetToken ? { resetToken: result.resetToken } : {},
  });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Password has been reset successfully",
    data: {},
  });
}

export async function me(req: Request, res: Response) {
  const user = await authService.getCurrentUser(req.user!.id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Current user profile fetched",
    data: { user },
  });
}
