import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// Central Redux store for the Shell application

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Types used by our Redux hooks

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;