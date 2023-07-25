import { AxiosError } from 'axios';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AuthDto, AuthToken, User } from '../common';
import { decodeToken, tokenStorage } from '../lib/utils';

import { get, post } from '.';

type AuthError = AxiosError['response'] & { type?: 'password' | 'user' };

export const Auth = {
    queryKey: ['authenticated-user'] as const,

    useUser: () => {
        return useQuery<User, AxiosError['response']>({
            queryKey: Auth.queryKey,
            queryFn: () => getUser(),
            retry: false,
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useRegisterLocal: () => {
        const queryClient = useQueryClient();

        const setUser = useCallback(
            (data: User) => queryClient.setQueryData(Auth.queryKey, data),
            [queryClient],
        );

        return useMutation<User, AxiosError['response'], AuthDto>({
            mutationFn: (credentials: AuthDto) => registerLocal(credentials),
            onSuccess: (user) => {
                setUser(user);
                toast.success("You're all set! 🥳");
            },
            onError: (error) => {
                return error;
            },
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useLoginLocal: () => {
        const queryClient = useQueryClient();

        const setUser = useCallback(
            (data: User) => queryClient.setQueryData(Auth.queryKey, data),
            [queryClient],
        );

        return useMutation<User, AuthError, AuthDto>({
            mutationFn: (credentials: AuthDto) => loginLocal(credentials),
            onError: (error) => {
                if (error?.statusText === 'Invalid password') {
                    error.type = 'password';
                    return error;
                }
                error.type = 'user';
                return error;
            },
            onSuccess: (user) => {
                setUser(user);
                toast.success('Welcome back! 😊');
            },
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useLogout: () => {
        const queryClient = useQueryClient();

        const setUser = useCallback(
            (data: User | null) =>
                queryClient.setQueryData(Auth.queryKey, data),
            [queryClient],
        );

        return useMutation<unknown, AxiosError['response'], unknown>({
            mutationFn: () => logout(),
            onError: (error) => {
                return error;
            },
            onSuccess: () => {
                setUser(null);
                queryClient.invalidateQueries();
            },
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useTokenRefresh: () => {
        const refreshMutation = useMutation<
            boolean,
            AxiosError['response'],
            void
        >({
            mutationFn: () => refresh(),
        });

        const refreshTokenIfNeeded = useCallback(async () => {
            const shouldRefresh = true; // access_token expiration logic

            if (shouldRefresh) {
                try {
                    return await refreshMutation.mutateAsync();
                } catch (err) {
                    tokenStorage.clearTokens();
                }
            }
        }, [refreshMutation]);
        return refreshTokenIfNeeded;
    },
};

async function getUser(): Promise<User> {
    const response = await get('/api/users/me');
    return response.data;
}

async function logout() {
    await post('/api/auth/logout');
    tokenStorage.clearTokens();
    return true;
}

async function registerLocal(credentials: AuthDto) {
    const response = await post(`/api/auth/local/register`, credentials);
    return handleUserResponse(response.data);
}

async function loginLocal(credentials: AuthDto) {
    const response = await post(`/api/auth/local/login`, credentials);
    return handleUserResponse(response.data);
}

async function refresh() {
    const response = await post('/api/auth/refresh');
    const tokens = response.data as AuthToken;
    tokenStorage.setTokens(tokens);
    return true;
}

function handleUserResponse(data: AuthToken) {
    tokenStorage.setTokens(data);
    const decodedData = decodeToken(data.access_token);
    const user: User = {
        _id: decodedData.sub,
        email: decodedData.email,
    };
    return user;
}
