import {
  getAccessToken,
  refreshAccessToken,
  logoutFromShell,
} from "@/auth/AuthBridge";

declare global {
  interface Window {
    __AUTH_BRIDGE__?: {
      getAccessToken: () => string | null;

      refreshAccessToken: () => Promise<string>;

      logout: () => Promise<void>;
    };
  }
}

export function initializeAuthBridge() {
  window.__AUTH_BRIDGE__ = {
    getAccessToken,
    refreshAccessToken,
    logout: logoutFromShell,
  };
}