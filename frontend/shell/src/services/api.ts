import axios from "axios";

// API Gateway is the only backend entry point used by the frontend.
const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add the access token to every protected request.
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// If access token expires, get a new one using the refresh token.
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Don't try refreshing the token for the refresh endpoint itself
    
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "http://localhost:4000/api/v1/auth/refresh",
          { refreshToken },
        );

        const newAccessToken = response.data.data.accessToken;

        // Save the new access token.
        localStorage.setItem("accessToken", newAccessToken);

        // Retry the original request with the new token.
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, so the user needs to log in again.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;