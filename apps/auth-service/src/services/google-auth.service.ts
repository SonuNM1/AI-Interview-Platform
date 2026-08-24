import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";

import { prisma } from "../lib/prisma.js";
import { RoleType } from "../generated/prisma/index.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";

import { AppError } from "../utils/AppError.js";

import { publishEvent } from "@repo/shared-rabbitmq";
import { UserEventType } from "@repo/shared-rabbitmq";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
);

export const loginWithGoogle = async (
  idToken: string,
  requestedRole?: "CANDIDATE" | "RECRUITER" | "MENTOR",
) => {
  // Verify Google ID token.
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new AppError("Invalid Google account", 401);
  }

  const googleId = payload.sub;
  const email = payload.email;

  console.log("========== GOOGLE AUTH ==========");
  console.log("Email:", email);
  console.log("Google ID:", googleId);
  console.log("Requested role:", requestedRole);

  /*
   * ============================================================
   * GOOGLE REGISTRATION
   * ============================================================
   *
   * requestedRole is present only when the request comes from
   * the registration page.
   */

  if (requestedRole) {
    // Check whether this Google account already exists.
    const existingGoogleUser = await prisma.user.findUnique({
      where: {
        googleId,
      },
    });

    if (existingGoogleUser) {
      throw new AppError(
        "An account with this Google account already exists. Please sign in instead.",
        409,
      );
    }

    // Check whether this email already belongs to an account.
    const existingEmailUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmailUser) {
      throw new AppError(
        "An account with this email already exists. Please sign in instead.",
        409,
      );
    }

    // Create a completely new Google account.
    const user = await prisma.user.create({
      data: {
        email,
        googleId,
        passwordHash: null,
        isEmailVerified: true,
        role: requestedRole as RoleType,
      },
    });

    console.log(
      "New Google user created:",
      user.id,
    );

    // Notify User Service.
    await publishEvent("user_events", {
      type: UserEventType.USER_REGISTERED,
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate tokens for the newly registered user.
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const session = await prisma.refreshToken.create({
      data: {
        tokenHash: "",
        userId: user.id,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      10,
    );

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
  }

  /*
   * ============================================================
   * GOOGLE LOGIN
   * ============================================================
   *
   * No requestedRole means this request came from the login page.
   */

  const user = await prisma.user.findUnique({
    where: {
      googleId,
    },
  });

  if (!user) {
    throw new AppError(
      "No account found. Please register first.",
      404,
    );
  }

  // Generate access token.
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Create refresh-token session.
  const session = await prisma.refreshToken.create({
    data: {
      tokenHash: "",
      userId: user.id,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ),
    },
  });

  // Generate refresh token.
  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role,
    sessionId: session.id,
  });

  // Store only the hashed refresh token.
  const refreshTokenHash = await bcrypt.hash(
    refreshToken,
    10,
  );

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