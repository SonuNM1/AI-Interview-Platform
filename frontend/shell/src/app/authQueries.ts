import { useMutation } from "@tanstack/react-query";
import {
  login,
  register,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
} from "@/services/auth.api";

// Login mutation.

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

// Registration mutation.
export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

// Email verification mutation.
export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}

// Resend OTP mutation.
export function useResendOTP() {
  return useMutation({
    mutationFn: resendOTP,
  });
}

// forgot password mutation 

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword
  })
}

// reset password mutation 

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPassword,
  });
}