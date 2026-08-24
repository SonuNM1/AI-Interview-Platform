import api from "./api";
import type {
  LoginForm,
  RegisterForm,
  VerifyEmailForm,
  ForgotPasswordForm, 
  ResetPasswordForm
} from "./auth.schema";

// Common authentication response.
export interface AuthUser {
  id: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER" | "MENTOR" | "ADMIN";
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// Register a new user

export async function register(data: RegisterForm) {
  const response = await api.post("/auth/register", data);

  return response.data;
}

// Login with email and password.

export async function login(data: LoginForm): Promise<AuthResponse> {
  const response = await api.post("/auth/login", data);

  return response.data.data;
}

// Login/register using Google.

export async function googleLogin(
  idToken: string,
  role?: "CANDIDATE" | "RECRUITER" | "MENTOR",
): Promise<AuthResponse> {
  const response = await api.post("/auth/google", {
    idToken,
    ...(role && { role }),
  });

  return response.data.data;
}

// send password reset OTP 

export async function forgotPassword(data: ForgotPasswordForm) {
  const response = await api.post("/auth/forgot-password", data) ; 

  return response.data ; 
}

// reset password using otp 

export async function resetPassword(data: ResetPasswordForm) {
  const response = await api.post("/auth/reset-password", data) ; 

  return response.data ; 
}

// Verify registration email using OTP

export async function verifyEmail(data: VerifyEmailForm) {
  const response = await api.post("/auth/verify-email", data);

  return response.data;
}

// Resend email OTP.

export async function resendOTP(email: string) {
  const response = await api.post("/auth/resend-otp", {
    email,
  });

  return response.data;
}



// Get the currently logged-in user.

export async function getProfile(): Promise<AuthUser> {
  const response = await api.get("/auth/profile");

  return response.data.data;
}

// Logout the current session.
export async function logout() {
  const refreshToken = localStorage.getItem("refreshToken");

  const response = await api.post("/auth/logout", {
    refreshToken,
  });

  return response.data;
}