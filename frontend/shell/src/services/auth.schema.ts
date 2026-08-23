import { z } from "zod";

// Login form validation.
export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// Registration form validation.
export const registerSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(["CANDIDATE", "RECRUITER", "MENTOR"]),
});

// forgot password form 

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email")
})

// reset password form 

export const resetPasswordSchema = z.object({
  email: z.email("Enter a valid email"), 
  otp: z.string().length(6, "OTP must be 6 digits"), 
  newPassword: z.string().min(4, "Password must be at least 4 characters")
})

// Email verification form validation.
export const verifyEmailSchema = z.object({
  userId: z.string().min(1),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type VerifyEmailForm = z.infer<typeof verifyEmailSchema>;

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;