import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { sendApiResponse } from "../utils/apiResponse";

function requestMeta(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip;
  return {
    ipAddress: ip || null,
    userAgent: req.headers["user-agent"] || null,
  };
}

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body, requestMeta(req));
  return sendApiResponse({
    res,
    statusCode: 201,
    message: "User registered successfully",
    data: result,
  });
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body, requestMeta(req));
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
  const result = await authService.refreshTokens(refreshToken, requestMeta(req));
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

export async function updateMe(req: Request, res: Response) {
  const user = await authService.updateProfile(req.user!.id, req.body);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Profile updated successfully",
    data: { user },
  });
}

export async function changePassword(req: Request, res: Response) {
  await authService.changePassword(req.user!.id, req.body);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Password changed successfully",
    data: {},
  });
}

export async function enableTwoFactor(req: Request, res: Response) {
  const { password } = req.body;
  const result = await authService.enableTwoFactor(req.user!.id, password);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Two-factor setup initialized. Confirm with a code to enable it.",
    data: result,
  });
}

export async function confirmTwoFactor(req: Request, res: Response) {
  const { totpCode } = req.body;
  const user = await authService.confirmTwoFactor(req.user!.id, totpCode);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Two-factor authentication enabled",
    data: { user },
  });
}

export async function disableTwoFactor(req: Request, res: Response) {
  const { totpCode } = req.body;
  const user = await authService.disableTwoFactor(req.user!.id, totpCode);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Two-factor authentication disabled",
    data: { user },
  });
}

export async function getSessions(req: Request, res: Response) {
  const sessions = await authService.getSessions(req.user!.id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Active sessions retrieved",
    data: { sessions },
  });
}

export async function revokeSession(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  await authService.revokeSession(req.user!.id, id);
  return sendApiResponse({
    res,
    statusCode: 200,
    message: "Session revoked successfully",
    data: {},
  });
}
