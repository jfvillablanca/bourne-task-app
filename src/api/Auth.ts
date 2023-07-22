import { AxiosError } from 'axios';
import { configureAuth } from 'react-query-auth';
import { toast } from 'react-toastify';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthDto, AuthToken, User } from '../common';
import { decodeToken, tokenStorage } from '../lib/utils';

import { get, post } from '.';

type AuthError = AxiosError['response'] & { type?: 'password' | 'user' };

const { useUser, useRegister, useLogin, useLogout } = configureAuth<
    User,
    AuthError,
    AuthDto,
    AuthDto
>({
    userFn: () => getUser(),
    registerFn: (credentials: AuthDto) => registerLocal(credentials),
    loginFn: (credentials: AuthDto) => loginLocal(credentials),
    logoutFn: () => logout(),
});

export const Auth = {
    useUser: () => {
        return useUser({
            retry: false,
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useRegisterLocal: () => {
        return useRegister({
            onSuccess: () => {
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
        return useLogin({
            onError: (error) => {
                if (error?.statusText === 'Invalid password') {
                    error.type = 'password';
                    return error;
                }
                error.type = 'user';
                return error;
            },
            onSuccess: () => {
                toast.success('Welcome back! 😊');
            },
            meta: {
                isErrorHandledLocally: true,
            },
        });
    },

    useLogout: () => {
        const queryClient = useQueryClient();
        return useLogout({
            onSuccess: () => {
                return queryClient.invalidateQueries();
            },
        });
    },

    useRefresh: () => {
        const queryClient = useQueryClient();
        return useMutation<boolean, AxiosError['response'], void>({
            mutationFn: () => refresh(),
            onSuccess: () => {
                return queryClient.invalidateQueries();
            },
        });
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
