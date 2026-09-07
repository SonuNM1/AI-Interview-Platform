import axios from "axios";

/*
 * Type definition for the authentication bridge
 * exposed by the Shell.
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

/*
 * Mentor API Client
 *
 * Authentication is owned by the Shell.
 * Mentor MFE asks the Shell for the access token
 * and attaches it to API requests.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/*
 * API Gateway client
 */
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

/*
 * Request interceptor
 *
 * Before every request:
 * Mentor MFE → Shell auth bridge → access token → API Gateway
 */
api.interceptors.request.use((config) => {
  const accessToken =
    window.__AUTH_BRIDGE__?.getAccessToken();

  if (accessToken) {
    config.headers.Authorization =
      `Bearer ${accessToken}`;
  }

  return config;
});

/*
 * Response interceptor
 *
 * If the access token has expired:
 * 1. Ask Shell to refresh it.
 * 2. Retry the failed request.
 * 3. If refresh fails, logout through Shell.
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    /*
     * Prevent infinite retry loops.
     */
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      try {
        /*
         * Ask Shell to refresh the access token.
         */
        const newAccessToken =
          await window.__AUTH_BRIDGE__
            ?.refreshAccessToken();

        if (!newAccessToken) {
          throw new Error(
            "Unable to refresh access token",
          );
        }

        /*
         * Put the new token on the failed request.
         */
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        /*
         * Retry the original request.
         */
        return api(originalRequest);
      } catch (refreshError) {
        /*
         * Refresh failed.
         */
        await window.__AUTH_BRIDGE__?.logout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;