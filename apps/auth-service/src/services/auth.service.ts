import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
} from "../validators/auth.validator.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import jwt from "jsonwebtoken";
import { publishMessage } from "@repo/shared-rabbitmq";
import { AppError } from "../utils/AppError.js";

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const registerUser = async (data: RegisterInput) => {
  const { email, password } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError(
      "Email already registered", 
      409
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  });

  /*Creating empty profile in User Service 

  await axios.post(`${process.env.USER_SERVICE_URL}/api/v1/users`, {
    id: user.id 
  })*/

  // Publish User created event 

  console.log("Before publish") ;

  await publishMessage("user_created", {
    id: user.id, 
    email: user.email 
  })

  console.log("After publish")

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
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
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

  // Session does not exist
  if (!session) {
    throw new Error("Session not found");
  }

  // Check if session is already revoked
  if (session.revokedAt) {
    throw new Error("Session has been revoked");
  }

  // Check if Refresh Token has expired
  if (session.expiresAt < new Date()) {
    throw new Error("Refresh token has expired");
  }

  // Compare incoming Refresh Token with stored hash
  const isTokenValid = await bcrypt.compare(refreshToken, session.tokenHash);

  // Invalid Refresh Token
  if (!isTokenValid) {
    throw new Error("Invalid refresh token");
  }

  // Generate new Access Token
  const accessToken = generateAccessToken({
    id: payload.id,
    email: payload.email,
    role: payload.role,
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
