import {
  getAccessToken,
  refreshAccessToken,
  logoutFromShell,
} from "@/auth/AuthBridge";

/**
 * ============================================================
 * GLOBAL AUTH BRIDGE
 * ============================================================
 *
 * This is the communication boundary between the Shell and
 * all Microfrontends.
 *
 * The Shell owns authentication.
 *
 * MFEs such as Candidate, Recruiter and Mentor only consume
 * these capabilities through window.__AUTH_BRIDGE__.
 */

declare global {
  interface Window {
    __AUTH_BRIDGE__?: {
      getAccessToken: () => string | null;

      refreshAccessToken: () => Promise<string>;

      logout: () => Promise<void>;
    };
  }
}

/**
 * Expose the Shell's authentication capabilities globally
 * so Module Federation applications can consume them.
 */
export function initializeAuthBridge() {
  window.__AUTH_BRIDGE__ = {
    getAccessToken,
    refreshAccessToken,
    logout: logoutFromShell,
  };
}