import axios from "axios";

import { clearCredentials } from "@/app/authSlice";
import { logout } from "@/services/auth.api";
import { store } from "@/app/store";

/**
 * ============================================================
 * SHELL AUTH BRIDGE
 * ============================================================
 *
 * The Shell is the single owner of authentication.
 *
 * Responsibilities:
 * - Access token
 * - Refresh token
 * - Token refresh
 * - Logout
 * - Clearing authentication state
 *
 * Microfrontends must not implement these themselves.
 */


/**
 * ------------------------------------------------------------
 * Get current access token
 * ------------------------------------------------------------
 *
 * MFEs call this through window.__AUTH_BRIDGE__.
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    "http://localhost:4000/api/v1/auth/refresh",
    {
      refreshToken,
    },
  );

  const newAccessToken =
    response.data.data.accessToken;

  localStorage.setItem(
    "accessToken",
    newAccessToken,
  );

  return newAccessToken;
}


/**
 * ------------------------------------------------------------
 * Logout
 * ------------------------------------------------------------
 *
 * The Shell performs the actual logout operation.
 *
 * MFEs should call:
 *
 * window.__AUTH_BRIDGE__?.logout()
 *
 * instead of calling /auth/logout themselves.
 */
export async function logoutFromShell() {
  try {
    await logout();
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    store.dispatch(clearCredentials());

    window.location.href = "/login";
  }
}