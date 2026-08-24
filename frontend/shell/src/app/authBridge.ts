import { logout } from "@/services/auth.api";
import { clearCredentials } from "@/app/authSlice";
import { store } from "@/app/store";

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