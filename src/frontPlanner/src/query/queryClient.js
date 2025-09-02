import { QueryClient } from "@tanstack/react-query";

const defaultOptions = {
    queries: {
        staleTime: 5 * 1000
    }
}

export const queryClient = new QueryClient({ defaultOptions });