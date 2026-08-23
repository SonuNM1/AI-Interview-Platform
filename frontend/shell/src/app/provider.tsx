import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";

import { store } from "./store";
import { theme } from "./theme";

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({
  children,
}: AppProvidersProps) {
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}