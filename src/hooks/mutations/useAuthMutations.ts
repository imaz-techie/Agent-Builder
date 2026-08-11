import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import type {
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordDto,
  UpdateProfileDto,
  ChangePasswordDto,
} from "@/types/auth.types";
import { QUERY_KEYS, STORAGE_KEYS } from "@/constants/api.constants";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      toast.success("Welcome back!", {
        description: `Logged in as ${data.user.email}`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
    onError: (error: Error) => {
      toast.error("Login failed", {
        description: error.message || "Invalid credentials provided.",
      });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: (data) => {
      toast.success("Account created successfully!", {
        description: `Welcome to Agent Builder, ${data.user.name}`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
    onError: (error: Error) => {
      toast.error("Registration failed", {
        description: error.message || "Could not complete registration.",
      });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.info("Logged out successfully");
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => authService.forgotPassword(data),
    onSuccess: () => {
      toast.success("Password reset email sent!", {
        description: "Please check your inbox for further instructions.",
      });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => authService.updateProfile(dto),
    onSuccess: (user) => {
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
    onError: (error: Error) => {
      toast.error("Failed to update profile", { description: error.message });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => authService.changePassword(dto),
    onSuccess: () => {
      toast.success("Password changed", {
        description: "Please sign in again with your new password.",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to change password", { description: error.message });
    },
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authService.revokeSession(sessionId),
    onSuccess: () => {
      toast.success("Session revoked");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSIONS });
    },
    onError: (error: Error) => {
      toast.error("Failed to revoke session", { description: error.message });
    },
  });
}

export function useEnableTwoFactorMutation() {
  return useMutation({
    mutationFn: (password: string) => authService.enableTwoFactor(password),
    onError: (error: Error) => {
      toast.error("Failed to enable two-factor authentication", {
        description: error.message,
      });
    },
  });
}

export function useConfirmTwoFactorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (totpCode: string) => authService.confirmTwoFactor(totpCode),
    onSuccess: (user) => {
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      toast.success("Two-factor authentication enabled");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
    onError: (error: Error) => {
      toast.error("Failed to verify code", { description: error.message });
    },
  });
}

export function useDisableTwoFactorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (totpCode: string) => authService.disableTwoFactor(totpCode),
    onSuccess: (user) => {
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      toast.success("Two-factor authentication disabled");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
    },
    onError: (error: Error) => {
      toast.error("Failed to disable two-factor authentication", {
        description: error.message,
      });
    },
  });
}
