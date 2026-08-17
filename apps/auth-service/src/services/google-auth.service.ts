import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import bcrypt from "bcrypt";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
);

export const loginWithGoogle = async (idToken: string) => {

  // Verify that the ID token was actually issued by Google and was intended for our application.
  
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub || !payload.email) {
    throw new Error("Invalid Google account");
  }

  const googleId = payload.sub;
  const email = payload.email;

  // First try to find the account using Google ID.

  let user = await prisma.user.findUnique({
    where: {
      googleId,
    },
  });

  // If the Google ID isn't linked yet, check whether the email already belongs to an existing account.

  if (!user) {
    user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  // Create a new candidate account if no account exists.

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        googleId,
        passwordHash: null,
        isEmailVerified: true,
      },
    });
  } else if (!user.googleId) {
    
    // Link Google to an existing email account.
    
    user = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        googleId,
        isEmailVerified: true,
      },
    });
  }

  // Generate the same JWT access token used by normal login.

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Create a refresh-token session.

  const session = await prisma.refreshToken.create({
    data: {
      tokenHash: "",
      userId: user.id,
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ),
    },
  });

  // Generate refresh token using the existing JWT system.

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