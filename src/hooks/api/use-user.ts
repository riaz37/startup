"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendVerificationRequest,
} from "@/types";
import { userService } from "@/lib/services";

// Hook for fetching user profile
export function useUserProfile() {
  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => userService.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}

// Hook for updating user profile (mutation)
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: UpdateProfileRequest) =>
      userService.updateProfile(profileData),
    onSuccess: (data) => {
      // Update the user profile in cache
      queryClient.setQueryData(["user", "profile"], data);
    },
  });
}

// Hook for changing password (mutation)
export function useChangePassword() {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordRequest) =>
      userService.changePassword(passwordData),
  });
}

// Hook for forgot password (mutation)
export function useForgotPassword() {
  return useMutation({
    mutationFn: (forgotPasswordData: ForgotPasswordRequest) =>
      userService.forgotPassword(forgotPasswordData),
  });
}

// Hook for resetting password (mutation)
export function useResetPassword() {
  return useMutation({
    mutationFn: (resetPasswordData: ResetPasswordRequest) =>
      userService.resetPassword(resetPasswordData),
  });
}

// Hook for resending verification email (mutation)
export function useResendVerification() {
  return useMutation({
    mutationFn: (resendVerificationData: ResendVerificationRequest) =>
      userService.resendVerification(resendVerificationData),
  });
}
