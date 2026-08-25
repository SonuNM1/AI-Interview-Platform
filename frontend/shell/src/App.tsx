import { useEffect } from "react";

import { AppProviders } from "./app/provider";
import { AppRoutes } from "./routes";

import { logout } from "./services/auth.api";
import { clearCredentials } from "./app/authSlice";
import { store } from "./app/store";

function App() {
  useEffect(() => {
    const handleShellLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        store.dispatch(clearCredentials());

        window.location.href = "/login";
      }
    };

    window.addEventListener("shell:logout", handleShellLogout);

    return () => {
      window.removeEventListener(
        "shell:logout",
        handleShellLogout,
      );
    };
  }, []);

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;