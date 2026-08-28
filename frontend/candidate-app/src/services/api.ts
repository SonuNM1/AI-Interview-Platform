import axios from "axios";

/* Candidate API Client - Candidate does not own authentication. Authentication is provided by the Shell through: window.__AUTH_BRIDGE__

Candidate is responsible only for making API requests */


/* API Gateway client */

const api = axios.create({
  baseURL: "http://localhost:4000/api/v1",
});


/* Type definition for the authentication bridge exposed by the Shell */
declare global {
  interface Window {
    __AUTH_BRIDGE__?: {
      getAccessToken: () => string | null;

      refreshAccessToken: () => Promise<string>;

      logout: () => Promise<void>;
    };
  }
}

/* Request interceptor - Before every request: Candidate → asks Shell for access token → attaches token → sends request */

api.interceptors.request.use((config) => {
  const accessToken =
    window.__AUTH_BRIDGE__?.getAccessToken();

  if (accessToken) {
    config.headers.Authorization =
      `Bearer ${accessToken}`;
  }

  return config;
});

/* Response interceptor */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    /* Prevent infinite retry loops */
    
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      try {

        // Ask the Shell to refresh the token

        const newAccessToken =
          await window.__AUTH_BRIDGE__
            ?.refreshAccessToken();

        if (!newAccessToken) {
          throw new Error(
            "Unable to refresh access token",
          );
        }

        //Put the new token on the failed request

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Retry the original request.
         
        return api(originalRequest);
      } catch (refreshError) {

        //Refresh failed
        
        await window.__AUTH_BRIDGE__?.logout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;