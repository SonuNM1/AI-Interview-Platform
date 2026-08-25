import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  email: string;
  role: "CANDIDATE" | "RECRUITER" | "MENTOR" | "ADMIN";
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

/* Restore the authenticated user from localStorage when the application starts again after a page refresh.*/

const getPersistedUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem("authUser");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    // Remove corrupted/stale user data instead of crashing the app.
    localStorage.removeItem("authUser");
    return null;
  }
};

const persistedAccessToken = localStorage.getItem("accessToken");

/* Initial auth state - Tokens and user information are restored from localStorage so Redux does not lose the authenticated user after a page refresh.*/

const initialState: AuthState = {
  user: getPersistedUser(),
  accessToken: persistedAccessToken,
  isAuthenticated: !!persistedAccessToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {

    /* Store authenticated user and tokens after successful login or registration */

    setCredentials: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;

      // Persist the access token so authentication survives refresh

      localStorage.setItem(
        "accessToken",
        action.payload.accessToken,
      );

      // Persist the refresh token for future token renewal.

      localStorage.setItem(
        "refreshToken",
        action.payload.refreshToken,
      );

      // Persist the authenticated user's basic information.

      localStorage.setItem(
        "authUser",
        JSON.stringify(action.payload.user),
      );
    },

    /* Clear all authentication information during logout */

    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      // Remove all persisted authentication information
      
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("authUser");
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
} = authSlice.actions;

export default authSlice.reducer;