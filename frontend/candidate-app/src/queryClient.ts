import { QueryClient } from "@tanstack/react-query";

// the QueryClient manages TanStack query's cache - it stores server data such as: user profiles, interviews, notifications, messages, etc - we create one QueryClient for the Candidate MFE 

export const queryClient = new QueryClient() ; 