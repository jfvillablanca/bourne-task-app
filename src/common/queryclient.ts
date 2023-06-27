import { toast } from 'react-toastify';

import {
    QueryCache,
    QueryClient,
    QueryClientConfig,
} from '@tanstack/react-query';

export const createQueryCache = () =>
    new QueryCache({
        onError: (error) => {
            toast(`Something went wrong: ${error}`);
        },
    });

export const createQueryClient = (config?: QueryClientConfig) =>
    new QueryClient({ queryCache: createQueryCache(), ...config });
