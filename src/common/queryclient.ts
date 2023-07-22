import { AxiosError, HttpStatusCode } from 'axios';
import { toast } from 'react-toastify';

import {
    MutationCache,
    QueryCache,
    QueryClient,
    QueryClientConfig,
} from '@tanstack/react-query';

import { tokenStorage } from '../lib/utils';

const isAxiosErrorResponse = (
    error: unknown,
): error is AxiosError['response'] => {
    return (
        error !== null &&
        typeof error === 'object' &&
        'statusText' in error &&
        'status' in error &&
        'data' in error
    );
};

const handleError = (error: unknown) => {
    if (error && isAxiosErrorResponse(error)) {
        if (error.status === HttpStatusCode.Unauthorized) {
            // TODO: suppress error unless access with expired token
            // toast.error(`Please login to continue`); // commented for now

            tokenStorage.clearTokens();
            queryClient.invalidateQueries();

            return;
        }
        if (error.status === HttpStatusCode.Forbidden) {
            toast.error(`You are forbidden to access this resource`);
            return;
        }
        toast.error(`Something went wrong: ${error.statusText}`);
        return;
    }
    toast.error(`Something went wrong: ${error}`);
};

export const createQueryCache = () =>
    new QueryCache({
        onError: (error, query) => {
            if (query.meta?.isErrorHandledLocally) {
                return;
            }
            handleError(error);
        },
    });

export const createMutationCache = () =>
    new MutationCache({
        onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.isErrorHandledLocally) {
                return;
            }
            handleError(error);
        },
    });

export const createQueryClient = (config?: QueryClientConfig) =>
    new QueryClient({
        queryCache: createQueryCache(),
        mutationCache: createMutationCache(),
        ...config,
    });

export const queryClient = createQueryClient();
