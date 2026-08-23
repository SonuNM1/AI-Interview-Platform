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

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("accessToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Store the logged-in user and tokens.
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

      localStorage.setItem(
        "accessToken",
        action.payload.accessToken,
      );

      localStorage.setItem(
        "refreshToken",
        action.payload.refreshToken,
      );
    },

    // Clear authentication data during logout.
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const {
  setCredentials,
  clearCredentials,
} = authSlice.actions;

export default authSlice.reducer;