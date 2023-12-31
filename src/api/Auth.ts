import { AxiosError, HttpStatusCode } from 'axios';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AuthDto, AuthToken, secondsBeforeExpiration, User } from '../common';
import { decodeToken, tokenStorage } from '../lib/utils';

import { get, post } from '.';

type AuthError = AxiosError['response'] & { type?: 'password' | 'user' };

export const Auth = {
    authedUserQueryKey: ['authenticated-user'] as const,
    allUsersQueryKey: ['allUsers'] as const,

    useFindAllUsers: () => {
        const refreshToken = Auth.useTokenRefresh();
        return useQuery<User[], AxiosError['response']>({
            queryKey: Auth.allUsersQueryKey,
            queryFn: () => refreshToken(() => findAllUsers()),
        });
    },

    useUser: () => {
        const refreshToken = Auth.useTokenRefresh();
        return useQuery<User, AxiosError['response']>({
            queryKey: Auth.authedUserQueryKey,
            queryFn: () => refreshToken(() => getUser()),
            retry: false,
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useRegisterLocal: () => {
        const queryClient = useQueryClient();

        const setUser = useCallback(
            (data: User) =>
                queryClient.setQueryData(Auth.authedUserQueryKey, data),
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
            (data: User) =>
                queryClient.setQueryData(Auth.authedUserQueryKey, data),
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
        const refreshToken = Auth.useTokenRefresh();

        const setUser = useCallback(
            (data: User | null) =>
                queryClient.setQueryData(Auth.authedUserQueryKey, data),
            [queryClient],
        );

        return useMutation<boolean, AxiosError['response'], void>({
            mutationFn: () => refreshToken(() => logout()),
            onError: (error) => {
                return error;
            },
            onSuccess: () => {
                setUser(null);
                tokenStorage.clearTokens();
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
            meta: {
                isErrorHandledLocally: true,
            },
        });
        const queryClient = useQueryClient();

        const refreshToken = useCallback(
            async <T>(queryFn: () => Promise<T>) => {
                // FIXME: Move access token to context instead of tokenStorage
                const accessToken = tokenStorage.getToken('access_token');
                if (accessToken) {
                    try {
                        const fnResult = await queryFn();
                        if (secondsBeforeExpiration(accessToken) < 60) {
                            await refreshMutation.mutateAsync();
                        }
                        return fnResult;
                    } catch (err) {
                        const error = err as AxiosError['response'];
                        if (error?.status !== HttpStatusCode.Unauthorized) {
                            return await queryFn();
                        }
                        if (error?.status === HttpStatusCode.Unauthorized) {
                            try {
                                await refreshMutation.mutateAsync();
                            } catch (err) {
                                const error = err as AxiosError['response'];
                                if (
                                    error?.status ===
                                    HttpStatusCode.Unauthorized
                                ) {
                                    toast.error(`Please login to continue`);
                                    tokenStorage.clearTokens();
                                    queryClient.invalidateQueries();
                                }
                            }
                            return await queryFn();
                        }
                    }
                }
                // HACK: queryFn is expected to throw a 401 here since
                // axios couldn't find access token in localStorage
                return await queryFn();
            },
            [refreshMutation, queryClient],
        );
        return refreshToken;
    },
};

async function findAllUsers(): Promise<User[]> {
    const response = await get('/api/users');
    return response.data;
}

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
