import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import type { LoginCredentials, RegisterCredentials, ForgotPasswordDto } from "@/types/auth.types";
import { QUERY_KEYS } from "@/constants/api.constants";

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
