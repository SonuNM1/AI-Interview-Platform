import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import {
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResendOTPInput,
  ResetPasswordSchema,
} from "../validators/auth.validator.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { publishEvent } from "@repo/shared-rabbitmq";
import { AppError } from "../utils/AppError.js";
import { VerifyEmailInput } from "../validators/verify-email.schema.js";
import { deleteOTP, getOTP } from "./otp.service.js";
import { RoleType } from "../generated/prisma/index.js";
import axios from "axios";
import { UserEventType } from "@repo/shared-rabbitmq";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const registerUser = async (data: RegisterInput) => {
  const { email, password, role } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: role as RoleType,
    },
  });

  // Publish User created event

  console.log("Before publish");

  await publishEvent("user_events", {
    type: UserEventType.USER_REGISTERED,
    id: user.id,
    email: user.email,
    role: user.role,
  });

  console.log("After publish");

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
};

export const loginUser = async (data: LoginInput) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Email is not registered. Please register first.", 404);
  }

  if (user.deletedAt) {
    throw new AppError("This account has been deleted", 400);
  }

  // comparing entered password with the hashed password stored in the database

  if (!user.passwordHash) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Preventing login until the user verifies their email

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email before loggin in", 403);
  }

  // access token payload

  const accessPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate access token

  const accessToken = generateAccessToken(accessPayload);

  // Create a login session

  const session = await prisma.refreshToken.create({
    data: {
      // temp value. Will update after generating refresh token
      tokenHash: "",
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Refresh token payload

  const refreshPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    sessionId: session.id,
  };

  // Generate refresh token

  const refreshToken = generateRefreshToken(refreshPayload);

  // hash refresh token

  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

  await prisma.refreshToken.update({
    where: {
      id: session.id,
    },
    data: {
      tokenHash: refreshTokenHash,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

// Delete user from auth db

export const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // deleting the refresh tokens first

  await prisma.refreshToken.deleteMany({
    where: {
      userId,
    },
  });

  // soft delete user from auth db

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  // Delete profile from User service

  await axios.delete(
    `${process.env.USER_SERVICE_URL}/api/v1/users/delete-user/${userId}`,
    {
      headers: {
        "x-user-id": userId 
      }
    }
  );

  return {
    deleted: true,
  };
};

// Refresh Access Token

export const refreshAccessToken = async (data: RefreshTokenInput) => {
  const { refreshToken } = data;

  // Verify Refresh Token
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
    id: string;
    email: string;
    role: string;
    sessionId: string;
  };

  // Find the current login session

  const session = await prisma.refreshToken.findUnique({
    where: {
      id: payload.sessionId,
    },
  });

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
  });

  if (!user || user.deletedAt) {
    throw new AppError("Account is deleted or unavailable", 401);
  }

  // Session does not exist
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  // Check if session is already revoked
  if (session.revokedAt) {
    throw new AppError("Session has been revoked", 401);
  }

  // Check if Refresh Token has expired
  if (session.expiresAt < new Date()) {
    throw new AppError("Refresh token has expired", 401);
  }

  // Compare incoming Refresh Token with stored hash
  const isTokenValid = await bcrypt.compare(refreshToken, session.tokenHash);

  // Invalid Refresh Token
  if (!isTokenValid) {
    throw new AppError("Invalid refresh token", 401);
  }

  // Generate new Access Token

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    accessToken,
  };
};

// Get logged-in user's profile

export const getProfile = async (userId: string) => {
  // Find user by ID

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  // user not found

  if (!user) {
    throw new Error("User not found");
  }

  // Return only required fields

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};

// logout user

export const logoutUser = async (data: RefreshTokenInput) => {
  const { refreshToken } = data;

  // verify refresh token

  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
    id: string;
    email: string;
    role: string;
    sessionId: string;
  };

  // Find the current session

  const session = await prisma.refreshToken.findUnique({
    where: {
      id: payload.sessionId,
    },
  });

  // if session not found

  if (!session) {
    throw new Error("Session not found");
  }

  // Delete the session

  await prisma.refreshToken.delete({
    where: {
      id: session.id,
    },
  });

  return;
};

// Verify email otp

export const verifyEmail = async (data: VerifyEmailInput) => {
  const otpData = await getOTP(data.userId);

  if (!otpData) {
    throw new AppError("OTP expired or not found", 400);
  }

  if (otpData.otp != data.otp) {
    throw new AppError("Invalid OTP", 400);
  }

  await prisma.user.update({
    where: {
      id: data.userId,
    },
    data: {
      isEmailVerified: true,
    },
  });

  await deleteOTP(data.userId);

  return {
    verified: true,
  };
};

// Resend OTP

export const resendOTPService = async (data: ResendOTPInput) => {
  const { email } = data;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  const otpData = await getOTP(user.id);

  if (!otpData) {
    throw new AppError("OTP has expired. Please register again", 404);
  }

  if (otpData.resendCount >= 3) {
    throw new AppError("Maximum OTP resend attempts exceeded", 429);
  }

  await publishEvent("user_events", {
    type: UserEventType.RESEND_OTP,
    id: user.id,
    email: user.email,
  });

  return {
    message: "OTP sent successfully",
  };
};

// forgot password

export const forgotPasswordService = async (data: ForgotPasswordInput) => {
  const { email } = data;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 400);
  }

  await publishEvent("user_events", {
    type: UserEventType.PASSWORD_RESET,
    id: user.id,
    email: user.email,
  });

  return {
    message: "Password reset OTP sent successfully",
  };
};

// Reset password

export const resetPasswordService = async (data: ResetPasswordSchema) => {
  const { email, otp, newPassword } = data;

  // find user

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // fetch OTP from Redis

  const otpData = await getOTP(user.id);

  if (!otpData) {
    throw new AppError("OTP has expired", 404);
  }

  // comparing OTP

  if (otpData.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  // Hash new password

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // update password

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash: hashedPassword,
    },
  });

  // remove OTP from Redis

  await deleteOTP(user.id);

  return {
    message: "Password reset successful",
  };
};

// requests an OTP before permanently disabling the user's account 

export const requestAccountDeletion = async (
  userId: string,
  email: string 
) => {
  await publishEvent("user_events", {
    type: UserEventType.ACCOUNT_DELETION_REQUESTED, 
    id: userId, 
    email 
  }) ; 

  return {
    message: "Account deletion OTP sent successfully."
  }
}

/* Verifies the account deletion OTP and soft-deletes the authentication account */

export const verifyAccountDeletion = async (
  userId: string,
  otp: string,
) => {
  const otpData = await getOTP(userId);

  if (!otpData) {
    throw new AppError("OTP expired or not found", 400);
  }

  if (otpData.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  await deleteOTP(userId);

  return await deleteUser(userId) ; 
};