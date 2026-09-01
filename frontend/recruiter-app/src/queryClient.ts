import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

/*Creates the React Query Manager for the recruiter app. React Query handles server/API data for us. 

React Query then handles: calling the API, loading state, error state, caching the result, refetching, avoiding unnecessary duplicate API requests, invalidating/refetching data after mutations. 
*/