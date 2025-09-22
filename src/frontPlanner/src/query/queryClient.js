import { QueryClient } from '@tanstack/react-query';

const defaultOptions = {
    queries: {
        // staleTime: 5 * 60 * 1000
    }
};

export const queryClient = new QueryClient({ defaultOptions });
