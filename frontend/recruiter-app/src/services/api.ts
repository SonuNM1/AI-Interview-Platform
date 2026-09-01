import axios from "axios";

/*
Recruiter API Client - Authentication is owned by the Shell. Recruiter asks the Shell for the current access token before making authenticated API requests
*/

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});

declare global {
  interface Window {
    __AUTH_BRIDGE__?: {
      getAccessToken: () => string | null;
      refreshAccessToken: () => Promise<string>;
      logout: () => Promise<void>;
    };
  }
}

// attach access token to every request

api.interceptors.request.use((config) => {
  const accessToken = window.__AUTH_BRIDGE__?.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// refresh token once when the API returns 401

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken =
          await window.__AUTH_BRIDGE__?.refreshAccessToken();

        if (!newAccessToken) {
          throw new Error("Unable to refresh access token");
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        await window.__AUTH_BRIDGE__?.logout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
