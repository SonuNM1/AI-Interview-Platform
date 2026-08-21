import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import { Provider } from "react-redux"
import { store } from "./store"

const queryClient = new QueryClient() ; 

interface AppProvidersProps {
    children: React.ReactNode 
}

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </Provider>
    )
}
