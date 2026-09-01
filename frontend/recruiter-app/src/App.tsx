import "./index.css";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AppRoutes } from "./routes";
import { queryClient } from "./queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />

      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}